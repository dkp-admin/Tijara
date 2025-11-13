package expo.modules.tijarahzatca.utils

import expo.modules.tijarahzatca.types.*
import kotlin.math.roundToInt

fun Double.toFixedNoRounding(decimals: Int): String {
  val regex = Regex("^-?\\d+(?:\\.\\d{0,$decimals})?")
  val match = regex.find(this.toString())
  return if (match != null) {
    val result = match.value
    val dotIndex = result.indexOf('.')
    if (dotIndex == -1) {
      result + "." + "0".repeat(decimals)
    } else {
      val neededZeros = decimals - (result.length - dotIndex - 1)
      if (neededZeros > 0) result + "0".repeat(neededZeros) else result
    }
  } else {
    "0.${"0".repeat(decimals)}"
  }
}

data class LineItemTotals(
  val taxes_total: Double,
  val discounts_total: Double,
  val subtotal: Double
)

data class LineItemResult(
  val line_item_xml: Map<String, Any>,
  val line_item_totals: LineItemTotals
)

data class LineItemTotalsResult(
  val cacAllowanceCharges: List<Map<String, Any>>,
  val cacClassifiedTaxCategories: List<Map<String, Any>>,
  val cacTaxTotal: Map<String, Any>,
  val line_item_total_tax_exclusive: Double,
  val line_item_total_taxes: Double,
  val line_item_total_discounts: Double
)

object InvoiceHelper {

  fun constructLineItem(line_item: ZATCASimplifiedInvoiceLineItem): LineItemResult {
    val lineItemTotalsResult = constructLineItemTotals(line_item)

    val line_item_xml = mapOf(
      "cbc:ID" to "121324",
      "cbc:InvoicedQuantity" to mapOf(
        "@_unitCode" to "PCE",
        "#text" to line_item.quantity.toInt() // Convert to integer like backend
      ),
      "cbc:LineExtensionAmount" to mapOf(
        "@_currencyID" to "SAR",
        "#text" to lineItemTotalsResult.line_item_total_tax_exclusive.toFixedNoRounding(2)
      ),
      "cac:TaxTotal" to lineItemTotalsResult.cacTaxTotal,
      "cac:Item" to mapOf(
        "cbc:Name" to line_item.name,
        "cac:ClassifiedTaxCategory" to lineItemTotalsResult.cacClassifiedTaxCategories
      ),
      "cac:Price" to mapOf(
        "cbc:PriceAmount" to mapOf(
          "@_currencyID" to "SAR",
          "#text" to line_item.tax_exclusive_price
        ),
        "cac:AllowanceCharge" to lineItemTotalsResult.cacAllowanceCharges
      )
    )

    val totals = LineItemTotals(
      taxes_total = lineItemTotalsResult.line_item_total_taxes,
      discounts_total = lineItemTotalsResult.line_item_total_discounts,
      subtotal = lineItemTotalsResult.line_item_total_tax_exclusive
    )

    return LineItemResult(line_item_xml, totals)
  }

  private fun constructLineItemTotals(line_item: ZATCASimplifiedInvoiceLineItem): LineItemTotalsResult {
    var line_item_total_discounts = 0.0
    var line_item_total_taxes = 0.0

    val cacAllowanceCharges = mutableListOf<Map<String, Any>>()
    val cacClassifiedTaxCategories = mutableListOf<Map<String, Any>>()

    // VAT - Match backend order: ID -> Percent -> TaxScheme
    val VAT = mutableMapOf<String, Any>(
      "cbc:ID" to if (line_item.VAT_percent > 0) "S" else "O"
    )
    if (line_item.VAT_percent > 0) {
      VAT["cbc:Percent"] = line_item.VAT_percent.toFixedNoRounding(2)
    }
    VAT["cac:TaxScheme"] = mapOf("cbc:ID" to "VAT")
    cacClassifiedTaxCategories.add(VAT)

    // Calc total discounts
    line_item.discounts.forEach { discount ->
      line_item_total_discounts += discount.amount
      cacAllowanceCharges.add(mapOf(
        "cbc:ChargeIndicator" to "false",
        "cbc:AllowanceChargeReason" to discount.reason,
        "cbc:Amount" to mapOf(
          "@_currencyID" to "SAR",
          "#text" to discount.amount.toFixedNoRounding(2)
        )
      ))
    }

    // Calc item subtotal
    var line_item_subtotal = line_item.tax_exclusive_price * line_item.quantity - line_item_total_discounts
    line_item_subtotal = line_item_subtotal.toFixedNoRounding(2).toDouble()

    // Calc total taxes
    line_item_total_taxes = line_item_total_taxes.toFixedNoRounding(2).toDouble() +
      ((line_item_subtotal * line_item.VAT_percent) / 100).toFixedNoRounding(2).toDouble()
    line_item_total_taxes = line_item_total_taxes.toFixedNoRounding(2).toDouble()

    line_item.other_taxes.forEach { tax ->
      line_item_total_taxes = line_item_total_taxes.toFixedNoRounding(2).toDouble() +
        (tax.percent_amount * line_item_subtotal).toFixedNoRounding(2).toDouble()
      line_item_total_taxes = line_item_total_taxes.toFixedNoRounding(2).toDouble()
      cacClassifiedTaxCategories.add(mapOf(
        "cbc:ID" to "S",
        "cbc:Percent" to tax.percent_amount.toFixedNoRounding(2),
        "cac:TaxScheme" to mapOf("cbc:ID" to "VAT")
      ))
    }

    val cacTaxTotal = mapOf(
      "cbc:TaxAmount" to mapOf(
        "@_currencyID" to "SAR",
        "#text" to line_item_total_taxes.toFixedNoRounding(2)
      ),
      "cbc:RoundingAmount" to mapOf(
        "@_currencyID" to "SAR",
        "#text" to String.format("%.2f", line_item_subtotal.toFixedNoRounding(2).toDouble() +
                   line_item_total_taxes.toFixedNoRounding(2).toDouble())
      )
    )

    return LineItemTotalsResult(
      cacAllowanceCharges = cacAllowanceCharges,
      cacClassifiedTaxCategories = cacClassifiedTaxCategories,
      cacTaxTotal = cacTaxTotal,
      line_item_total_tax_exclusive = line_item_subtotal,
      line_item_total_taxes = line_item_total_taxes,
      line_item_total_discounts = line_item_total_discounts
    )
  }

  fun constructTaxTotal(line_items: List<ZATCASimplifiedInvoiceLineItem>): List<Map<String, Any>> {
    val cacTaxSubtotal = mutableListOf<Map<String, Any>>()

    val addTaxSubtotal = { taxable_amount: Double, tax_amount: Double, tax_percent: Double ->
      cacTaxSubtotal.add(mapOf(
        "cbc:TaxableAmount" to mapOf(
          "@_currencyID" to "SAR",
          "#text" to taxable_amount.toFixedNoRounding(2)
        ),
        "cbc:TaxAmount" to mapOf(
          "@_currencyID" to "SAR",
          "#text" to tax_amount.toFixedNoRounding(2)
        ),
        "cac:TaxCategory" to mapOf(
          "cbc:ID" to mapOf(
            "@_schemeAgencyID" to 6,
            "@_schemeID" to "UN/ECE 5305",
            "#text" to if (tax_percent > 0) "S" else "O"
          ),
          "cbc:Percent" to tax_percent.toFixedNoRounding(2),
          "cbc:TaxExemptionReason" to if (tax_percent > 0) null else "Not subject to VAT",
          "cac:TaxScheme" to mapOf(
            "cbc:ID" to mapOf(
              "@_schemeAgencyID" to "6",
              "@_schemeID" to "UN/ECE 5153",
              "#text" to "VAT"
            )
          )
        ).filterValues { it != null }
      ))
    }

    var taxes_total = 0.0

    line_items.forEach { line_item ->
      val total_line_item_discount = line_item.discounts.fold(0.0) { acc, discount -> acc + discount.amount }
      val taxable_amount = line_item.tax_exclusive_price * line_item.quantity - total_line_item_discount

      var tax_amount = (taxable_amount * line_item.VAT_percent) / 100
      addTaxSubtotal(taxable_amount, tax_amount, line_item.VAT_percent)
      taxes_total += tax_amount.toFixedNoRounding(2).toDouble()

      line_item.other_taxes.forEach { tax ->
        tax_amount = tax.percent_amount * taxable_amount
        addTaxSubtotal(taxable_amount, tax_amount, tax.percent_amount)
        taxes_total += tax_amount.toFixedNoRounding(2).toDouble()
      }
    }

    taxes_total = String.format("%.2f", taxes_total).toDouble()

    return listOf(
      mapOf(
        "cbc:TaxAmount" to mapOf(
          "@_currencyID" to "SAR",
          "#text" to taxes_total.toFixedNoRounding(2)
        ),
        "cac:TaxSubtotal" to cacTaxSubtotal
      ),
      mapOf(
        "cbc:TaxAmount" to mapOf(
          "@_currencyID" to "SAR",
          "#text" to taxes_total.toFixedNoRounding(2)
        )
      )
    )
  }

  fun constructLegalMonetaryTotal(tax_exclusive_subtotal: Double, taxes_total: Double): Map<String, Any> {
    return mapOf(
      "cbc:LineExtensionAmount" to mapOf(
        "@_currencyID" to "SAR",
        "#text" to tax_exclusive_subtotal.toFixedNoRounding(2)
      ),
      "cbc:TaxExclusiveAmount" to mapOf(
        "@_currencyID" to "SAR",
        "#text" to tax_exclusive_subtotal.toFixedNoRounding(2)
      ),
      "cbc:TaxInclusiveAmount" to mapOf(
        "@_currencyID" to "SAR",
        "#text" to String.format("%.2f", tax_exclusive_subtotal + taxes_total).toDouble()
      ),
      "cbc:AllowanceTotalAmount" to mapOf(
        "@_currencyID" to "SAR",
        "#text" to 0
      ),
      "cbc:PrepaidAmount" to mapOf(
        "@_currencyID" to "SAR",
        "#text" to 0
      ),
      "cbc:PayableAmount" to mapOf(
        "@_currencyID" to "SAR",
        "#text" to String.format("%.2f", tax_exclusive_subtotal + taxes_total).toDouble()
      )
    )
  }
}
