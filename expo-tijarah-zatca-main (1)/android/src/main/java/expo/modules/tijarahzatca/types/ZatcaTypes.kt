package expo.modules.tijarahzatca.types

import expo.modules.kotlin.types.Enumerable
import expo.modules.kotlin.records.Record

enum class ZATCAInvoiceTypes(val value: String) : Enumerable {
  INVOICE("388"),
  DEBIT_NOTE("383"),
  CREDIT_NOTE("381")
}

enum class ZATCAPaymentMethods(val value: String) : Enumerable {
  CASH("10"),
  CREDIT("30"),
  BANK_ACCOUNT("42"),
  BANK_CARD("48")
}

data class ZATCASimplifiedInvoiceLineItemDiscount(
  val amount: Double,
  val reason: String
) : Record

data class ZATCASimplifiedInvoiceLineItemTax(
  val percent_amount: Double
) : Record

data class ZATCASimplifiedInvoiceLineItem(
  val id: String,
  val name: String,
  val quantity: Double,
  val tax_exclusive_price: Double,
  val VAT_percent: Double,
  val other_taxes: List<ZATCASimplifiedInvoiceLineItemTax> = emptyList(),
  val discounts: List<ZATCASimplifiedInvoiceLineItemDiscount> = emptyList()
) : Record

data class EGSUnitLocation(
  val city: String,
  val city_subdivision: String,
  val street: String,
  val plot_identification: String,
  val building: String,
  val postal_zone: String
) : Record

data class EGSUnitInfo(
  val uuid: String,
  val custom_id: String,
  val model: String,
  val CRN_number: String,
  val VAT_name: String,
  val VAT_number: String,
  val branch_name: String,
  val branch_industry: String,
  val location: EGSUnitLocation,
  val solution_name: String = "Tijarah360"
) : Record

data class ZATCASimplifiedInvoiceCancelation(
  val canceled_invoice_number: Int,
  val payment_method: ZATCAPaymentMethods,
  val cancelation_type: ZATCAInvoiceTypes,
  val reason: String
) : Record

data class OrderItem(
  val productRef: String?,
  val name: Map<String, String>,
  val quantity: Double,
  val variant: Map<String, Any>,
  val billing: Map<String, Any>
) : Record

data class RefundItem(
  val name: Map<String, String>,
  val amount: Double,
  val _id: String,
  val qty: Double
) : Record

data class Refund(
  val amount: Double,
  val vat: Double,
  val items: List<RefundItem>,
  val reason: String,
  val referenceNumber: String?
) : Record

data class Device(
  val deviceCode: String
) : Record

data class Customer(
  val name: String?
) : Record

data class Order(
  val device: Device,
  val companyRef: String,
  val locationRef: String,
  val items: List<OrderItem>,
  val refunds: List<Refund>,
  val orderNum: String,
  val createdAt: String,
  val createdAtTime: String? = null,
  val invoiceSequence: Int,
  val previous_invoice_hash: String?,
  val customer: Customer?
) : Record

data class Company(
  val commercialRegistrationNumber: DocumentInfo,
  val name: NameInfo,
  val vat: VatInfo,
  val businessType: String
) : Record

data class Location(
  val address: AddressInfo,
  val name: NameInfo
) : Record

data class DeviceInfo(
  val deviceCode: String,
  val zatcaConfiguration: ZatcaConfiguration,
  val metadata: DeviceMetadata
) : Record

data class DocumentInfo(
  val docNumber: String
) : Record

data class NameInfo(
  val en: String
) : Record

data class AddressInfo(
  val city: String,
  val state: String,
  val address1: String,
  val address2: String? = null,
  val postalCode: String,
  val country: String
) : Record

data class VatInfo(
  val docNumber: String,
  val percentage: String,
  val url: String? = null,
  val vatRef: String? = null,
  val expiry: String? = null
) : Record

data class ZatcaConfiguration(
  val enableZatca: String,
  val zatcaId: String,
  val binarySecurityToken: String,
  val secret: String
) : Record

data class DeviceMetadata(
  val model: String
) : Record

