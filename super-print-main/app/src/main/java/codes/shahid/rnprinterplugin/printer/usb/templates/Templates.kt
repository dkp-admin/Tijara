package codes.shahid.rnprinterplugin.printer.usb.templates

import android.content.Context
import android.graphics.Typeface
import android.text.Layout
import android.util.Log
import com.dantsu.escposprinter.EscPosPrinter
import com.dantsu.escposprinter.textparser.PrinterTextParserImg
import codes.shahid.rnprinterplugin.templates.Templates
import codes.shahid.rnprinterplugin.types.Order
import codes.shahid.rnprinterplugin.utils.BitmapUtils
import codes.shahid.rnprinterplugin.utils.PrinterHelper
import codes.shahid.rnprinterplugin.utils.getQRData
import java.util.Date

class UsbTemplates(private val context: Context): Templates {

    companion object {
        private const val TAG = "Templates"
    }

    override fun getTransactionReceipt(printer: EscPosPrinter, transactionData: Map<String, Any>): String {
        val is2Inch = false
        val dividerLength = if (is2Inch) 32 else 48
        val textSize = if (is2Inch) 16 else 36
        val headerTextSize = if (is2Inch) 16 else 36
        val charsPerLine = if (is2Inch) 32 else 44

        val builder = StringBuilder()

        // Header
        builder.append("[C]<b>${transactionData["userName"]}</b>\n")
        builder.append("[L]\n")
        builder.append("[C]<b>${transactionData["locationName"]}</b>\n")
        builder.append("[C]${"-".repeat(dividerLength)}\n")

        // Date range
        builder.append("[L]Sales Summary[R]${transactionData["startDate"]}\nto ${transactionData["endDate"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage(printer,"تفاصيل المبيعات", "right", textSize)}</img>\n")
        builder.append("[C]${"-".repeat(dividerLength)}\n")

        // Sales details
        builder.append("[C]<b>Sales Details</b>\n")

        builder.append("[C]<img>${getArabicTextAsImage(printer,"ملخص المبيعات", "center", headerTextSize)}</img>\n")
        builder.append("[L]Total Sales[R]SAR ${transactionData["totalRevenue"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage(printer,"إجمالي المبيعات", "right", textSize)}</img>\n")
        builder.append("[L]Net Sales[R]SAR ${transactionData["netSales"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage(printer,"صافي المبيعات", "right", textSize)}</img>\n")
        builder.append("[L]Total VAT[R]SAR ${transactionData["totalVat"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage(printer,"إجمالي الضريبة", "right", textSize)}</img>\n")
        builder.append("[L]Discounts[R]SAR ${transactionData["discount"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage(printer,"الخصومات", "right", textSize)}</img>\n")

        // Transaction details
        builder.append("[C]${"-".repeat(dividerLength)}\n")
        builder.append("[C]<b>Transaction Details</b>\n")
        builder.append("[C]<img>${getArabicTextAsImage(printer,"تفاصيل المعاملة", "center", headerTextSize)}</img>\n")

        // Process transaction types
        val txnStats = transactionData["txnStats"] as? List<Map<String, Any>> ?: emptyList()
        val paymentTypes = transactionData["paymentTypes"] as? List<Map<String, Any>> ?: emptyList()

        val transactionTypes = listOf(
            mapOf("key" to "card", "en" to "Card Transaction", "ar" to "معاملات البطاقة"),
            mapOf("key" to "cash", "en" to "Cash Transaction", "ar" to "نقداً المحفظة"),
            mapOf("key" to "wallet", "en" to "Wallet Transaction", "ar" to "معاملات المحفظة"),
            mapOf("key" to "hungerstation", "en" to "HungerStation Transaction", "ar" to "امعاملة هنقرستيشن"),
            mapOf("key" to "jahez", "en" to "Jahez Transaction", "ar" to "معاملة جاهز"),
            mapOf("key" to "toyou", "en" to "ToYou Transaction", "ar" to "معاملة تويو"),
            mapOf("key" to "barakah", "en" to "Barakah Transaction", "ar" to "معاملة بركة"),
            mapOf("key" to "careem", "en" to "Careem Transaction", "ar" to "معاملة كريم"),
            mapOf("key" to "ninja", "en" to "Ninja Transaction", "ar" to "معاملة نينجا"),
            mapOf("key" to "thechef", "en" to "The Chef Transaction", "ar" to "معاملة ذا شيف"),
            mapOf("key" to "nearpay", "en" to "Nearpay Transaction", "ar" to "معاملات نيرباي"),
            mapOf("key" to "stcpay", "en" to "STC Pay Transaction", "ar" to "معاملات إس تي سي")
        )

        for (type in transactionTypes) {
            val key = type["key"] as String
            val paymentType = paymentTypes.find { payment ->
                (payment["name"] as? String)?.toLowerCase() == key ||
                        (key == "thechef" && (payment["name"] as? String) == "The Chef")
            }

            if (paymentType != null && (paymentType["status"] as? Boolean) == true) {
                val txnData = txnStats.find { d ->
                    (d["paymentName"] as? String)?.toLowerCase() == key.toLowerCase()
                }

                val amount = (txnData?.get("balanceAmount") as? Number)?.toDouble() ?: 0.0
                val count = when (val noOfPayments = txnData?.get("noOfPayments")) {
                    is Number -> noOfPayments.toInt()
                    is String -> noOfPayments.toIntOrNull() ?: 0
                    else -> 0
                }

                if (amount > 0 || count > 0) {
                    builder.append("[L]${type["en"]}[R]SAR ${String.format("%.2f", amount)}, Count: $count\n")
                    builder.append("[L]<img>${getArabicTextAsImage(printer,type["ar"] as String, "right", textSize)}</img>\n")
                }
            }
        }

        // Refund details
        builder.append("[C]${"-".repeat(dividerLength)}\n")
        builder.append("[C]<b>Refund Details</b>\n")
        builder.append("[C]<img>${getArabicTextAsImage(printer,"تفاصيل استرداد الأموال", "center", headerTextSize)}</img>\n")

        val refundTypes = listOf(
            mapOf("key" to "card", "en" to "Card Refund", "ar" to "المسترجع بالبطاقة"),
            mapOf("key" to "cash", "en" to "Cash Refund", "ar" to "المسترجع نقداً"),
            mapOf("key" to "wallet", "en" to "Wallet Refund", "ar" to "استرداد المحفظة"),
            mapOf("key" to "hungerstation", "en" to "HungerStation Refund", "ar" to "امعاملة هنقرستيشن"),
            mapOf("key" to "jahez", "en" to "Jahez Refund", "ar" to "معاملة جاهز"),
            mapOf("key" to "toyou", "en" to "ToYou Refund", "ar" to "معاملة تويو"),
            mapOf("key" to "barakah", "en" to "Barakah Refund", "ar" to "معاملة بركة"),
            mapOf("key" to "careem", "en" to "Careem Refund", "ar" to "معاملة كريم"),
            mapOf("key" to "ninja", "en" to "Ninja Refund", "ar" to "معاملة نينجا"),
            mapOf("key" to "thechef", "en" to "The Chef Refund", "ar" to "معاملة ذا شيف"),
            mapOf("key" to "nearpay", "en" to "Nearpay Refund", "ar" to "معاملات نيرباي"),
            mapOf("key" to "stcpay", "en" to "STC Pay Refund", "ar" to "معاملات إس تي سي")
        )

        for (type in refundTypes) {
            val key = type["key"] as String
            val paymentType = paymentTypes.find { payment ->
                (payment["name"] as? String)?.toLowerCase() == key ||
                        (key == "thechef" && (payment["name"] as? String) == "The Chef")
            }

            if (paymentType != null && (paymentType["status"] as? Boolean) == true) {
                var refundAmount = "0.00"
                var refundCount = 0

                if (listOf("card", "cash", "wallet", "credit", "nearpay", "stcpay").contains(key)) {
                    val capKey = key.capitalize()
                    refundAmount = (transactionData["refundIn$capKey"] as? String) ?: "0.00"
                    val count = when (val noOfPayments = transactionData?.get("refundCountIn$capKey")) {
                        is Number -> noOfPayments.toInt()
                        is String -> noOfPayments.toIntOrNull() ?: 0
                        else -> 0
                    }
                    refundCount = (count)?.toInt() ?: 0
                } else {
                    val refundData = transactionData["refundData"] as? List<Map<String, Any>> ?: emptyList()
                    val refundInfo = refundData.find { r -> (r["refundType"] as? String) == key }
                    if (refundInfo != null) {
                        val totalRefund = (refundInfo["totalRefund"] as? Number)?.toDouble() ?: 0.0
                        refundAmount = String.format("%.2f", totalRefund)
                        refundCount = (refundInfo["refundCount"] as? Number)?.toInt() ?: 0
                    }
                }

                val refundAmountDouble = refundAmount.toDoubleOrNull() ?: 0.0
                if (refundAmountDouble > 0 || refundCount > 0) {
                    builder.append("[L]${type["en"]}[R]SAR $refundAmount, Count: $refundCount\n")
                    builder.append("[L]<img>${getArabicTextAsImage(printer,type["ar"] as String, "right", textSize)}</img>\n")
                }
            }
        }

        // Footer
        builder.append("[C]${"-".repeat(dividerLength)}\n")
        builder.append("[L]Printed on[R]${transactionData["printedOn"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage(printer,"طبع على", "right", textSize)}</img>\n")
        builder.append("[L]Printed by[R]${transactionData["printedBy"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage(printer,"طبع بواسطة", "right", textSize)}</img>\n")
        builder.append("[C]${"-".repeat(dividerLength)}\n")
        builder.append("[C]${transactionData["footer"]}\n")
        builder.append("[C]Powered by Tijarah360\n")
        builder.append("${if (is2Inch) "\n\n" else "[L]\n[L]\n[L]\n"}")

        return builder.toString()
    }


    private fun getArabicTextAsImage(
        printer: EscPosPrinter,
        text: String,
        align: String = "right",   // Default to right alignment for Arabic
        textSize: Int = 32         // Default text size
    ): String {
        val alignment = when (align.lowercase()) {
            "left" -> Layout.Alignment.ALIGN_NORMAL
            "center" -> Layout.Alignment.ALIGN_CENTER
            "right" -> Layout.Alignment.ALIGN_OPPOSITE
            else -> Layout.Alignment.ALIGN_OPPOSITE  // Fallback to right
        }

        val bitmap = BitmapUtils.getBitmap(
            context,
            text,
            textSize,
            Typeface.SANS_SERIF,
            alignment
        )

        return PrinterTextParserImg.bitmapToHexadecimalString(printer, bitmap)
    }

    // Helper function equivalent to imageToHex in JavaScript
    private fun imageToHex(
        printer: EscPosPrinter,
        text: String,
        align: String = "left",
        textSize: String = "20"
    ): String {
        val alignment = when (align.lowercase()) {
            "left" -> Layout.Alignment.ALIGN_NORMAL
            "center" -> Layout.Alignment.ALIGN_CENTER
            "right" -> Layout.Alignment.ALIGN_OPPOSITE
            else -> Layout.Alignment.ALIGN_NORMAL
        }

        val bitmap = BitmapUtils.getBitmap(
            context,
            text,
            textSize.toIntOrNull() ?: 20,
            Typeface.SANS_SERIF,
            alignment
        )

        return PrinterTextParserImg.bitmapToHexadecimalString(printer, bitmap)
    }

    // Helper function to break text into multiple lines
    private fun getMultiLineText(text: String, is2Inch: Boolean = false): List<String> {
        val maxLineLength = if (is2Inch) 25 else 40
        val lines = text.split("\n")
        val parts = mutableListOf<String>()
        var currentPart = ""

        for (line in lines) {
            if (currentPart.isNotEmpty() && currentPart.length + line.length > maxLineLength) {
                parts.add(currentPart.trim())
                currentPart = ""
            }
            currentPart += line
        }

        if (currentPart.isNotEmpty()) {
            parts.add(currentPart.trim())
        }

        return parts
    }

    // Helper function equivalent to imageToHexRev in JavaScript (for reversed/right-aligned text)
    private fun imageToHexRev(
        printer: EscPosPrinter,
        text: String,
        align: String = "left",
        textSize: String = "20"
    ): String {
        val alignment = when (align.lowercase()) {
            "left" -> Layout.Alignment.ALIGN_NORMAL
            "center" -> Layout.Alignment.ALIGN_CENTER
            "right" -> Layout.Alignment.ALIGN_OPPOSITE
            else -> Layout.Alignment.ALIGN_OPPOSITE  // Default to right for reversed
        }

        val bitmap = BitmapUtils.getBitmap(
            context,
            text,
            textSize.toIntOrNull() ?: 20,
            Typeface.SANS_SERIF,
            alignment
        )

        return PrinterTextParserImg.bitmapToHexadecimalString(printer, bitmap)
    }

    override fun getReceipt(printer:EscPosPrinter,order: Order): String {
        Log.d(TAG, "Generating receipt template for order ${order._id}")

        val printBuffer = StringBuffer()
        val currency = order.currency ?: "SAR"

        // Generate bitmaps for Arabic text
        val locationName = BitmapUtils.getBitmap(
            context,
            order.location.name.ar,
            36,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_CENTER
        )
        val locationAddress = BitmapUtils.getBitmap(
            context,
            order.location.address,
            28,
            Typeface.SANS_SERIF,
            Layout.Alignment.ALIGN_CENTER
        )
        val invoice = BitmapUtils.getBitmap(
            context,
            "فاتورة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val specialInstruction = BitmapUtils.getBitmap(
            context,
            "تعليمات خاصة",
            28,
            Typeface.SANS_SERIF,
            Layout.Alignment.ALIGN_CENTER
        )
        val dateTime = BitmapUtils.getBitmap(
            context,
            "التاريخ و الوقت",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val customer = BitmapUtils.getBitmap(
            context,
            "العميل",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val customerVat = BitmapUtils.getBitmap(
            context,
            "العميل VAT",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE

        )

        val customerLabel = BitmapUtils.getBitmap(
            context,
            "العميل",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE

        )


        val description = BitmapUtils.getBitmap(
            context,
            "وصف",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )


        val totalTaxable = BitmapUtils.getBitmap(
            context,
            "إجمالي المبلغ الخاضع للضريبة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val totalAmount = BitmapUtils.getBitmap(
            context,
            "المبلغ الإجمالي",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val totalVat = BitmapUtils.getBitmap(
            context,
            "إجمالي ضريبة القيمة المضافة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val totalDiscount = BitmapUtils.getBitmap(
            context,
            "إجمالي الخصم",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val header = BitmapUtils.getBitmap(
            context,
            "المجموع                              الكمية                           سعر الوحدة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val simplifiedTaxInvoice = BitmapUtils.getBitmap(
            context,
            "  فاتورة ضريبية مبسطة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_CENTER
        )

        val returnPolicyArabic = BitmapUtils.getBitmap(
            context,
            "سياسة العائدات",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_CENTER
        )

        // Build the receipt content
        printBuffer.append(
            "[C]<font size='tall'>" + order.location.name.en + "</font>\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                locationName
            ) + "</img>\n" +
                    "[C]<font size='normal'>VAT No." + order.location.vat + "</font>\n" +
                    "[C]<font size='normal'>PH No. " + order.location.phone + "</font>\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                locationAddress
            ) + "</img>\n" +
                    "[C]------------------------------------------------\n" +
                    "[L]Invoice No\n[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                invoice
            ) + "</img>\n" +
                    "[L]#" + order.orderNum + "\n" +
                    "[L]Date & Time[R]" + formatDate(order.createdAt) + "\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                dateTime
            ) + "</img>\n"
        )

        // Handle customer name with Arabic text detection
        val customerName = order.customer?.name ?: "NA"
        val is2Inch = order.changeSize == true

        if (customerName.isNotEmpty() && customerName != "NA" && PrinterHelper.isArabicText(customerName)) {
            printBuffer.append("[L]Customer\n")
            printBuffer.append("[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                customerLabel
            ) + "</img>\n")
            printBuffer.append("[C]<img>${imageToHexRev(printer, "  ${customerName}${" ".repeat(if (is2Inch) 25 else 35)}", "left", if (is2Inch) "25" else "35")}</img>\n")
        } else {
            printBuffer.append("[L]Customer[R]${customerName.trim()}\n")
            printBuffer.append("[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                customerLabel
            ) + "</img>\n")
        }

        if (!order.customer?.vat.isNullOrEmpty()) {
            printBuffer.append(
                "[L]Customer VAT[R]" + (order.customer?.vat ?: "NA") + "\n" +
                        "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                    printer,
                    customerVat
                ) + "</img>\n"
            )
        }

        if (!order.tokenNum.isNullOrEmpty()) {
            printBuffer.append("[C]------------------------------------------------\n" + "[C]<b>" + order.tokenNum + "</b>\n")
        }

        if (!order.table.isNullOrEmpty() && order.table != "NA") {
            printBuffer.append("[C]------------------------------------------------\n" + "[C]<b>" + order.table + "</b>\n")
        }

        if (!order.orderType.isNullOrEmpty()) {
            printBuffer.append("[C]" + order.orderType + "\n")
        }

        printBuffer.append(
            "[C]------------------------------------------------\n" +
                    "[C]Simplified Tax Invoice\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                simplifiedTaxInvoice
            ) + "</img>\n" +
                    "[C]------------------------------------------------\n" +
                    "[L]<b>Description</b>\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                description
            ) + "</img>\n" +
                    "[L]<b>Unit Price</b>[C]<b>Qty</b>[R]<b>Total   </b>\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                header
            ) + "</img>\n"
        )

        printBuffer.append("[C]------------------------------------------------\n")

        order.items.forEach { item ->
            printBuffer.append(
                "[L]" + item.name.en + "\n" +
                        "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                    printer,
                    BitmapUtils.getBitmap(
                        context,
                        item.name.ar,
                        32,
                        Typeface.SANS_SERIF,
                        Layout.Alignment.ALIGN_OPPOSITE
                    )
                ) + "</img>\n"
            )

            if (!item.modifiers.isNullOrEmpty()) {
                item.modifiers.forEach { modifier ->
                    printBuffer.append("[L]+ " + modifier.optionName + "\n")
                }
            }

            if (!item.note.isNullOrEmpty()) {
                printBuffer.append("[L]Note: " + item.note + "\n")
            }

            printBuffer.append("[L]" + formatCurrency(item.sellingPrice) + "[C]" + item.qty + "[R]" + if (item.isFree == true) "FREE" else "${formatCurrency(item.total)}" + "\n")

            printBuffer.append("\n")

            if ((item.discount.toString()?.toDoubleOrNull() ?: 0.0) > 0 || item.isFree == true) {
                printBuffer.append("[R](Org) ${item.total+item.discount}\n")
            }
        }

        printBuffer.append("[C]------------------------------------------------\n")

        val subTotalFormatted = formatPrinterLine(
            printer,
            label = "Total Taxable Amount",
            arLabel = "إجمالي المبلغ الخاضع للضريبة",
            value = order.payment.subTotal.toString(),
            false,
            currency
        )

        printBuffer.append(subTotalFormatted)

        if (!order.payment.charges.isNullOrEmpty()) {
            order.payment.charges.forEach { charge ->
                val line = formatPrinterLine(
                    printer = printer,
                    label = charge.name.en,
                    arLabel = charge.name.ar,
                    value = charge.total.toString(),
                    false,
                    currency
                )
                printBuffer.append(line)
            }
        }

        if (order.payment.discount > 0) {
            val discountLine = formatPrinterLine(
                printer = printer,
                label = "Total Discount",
                arLabel = "إجمالي الخصم",
                value = order.payment.discount.toString(),
                false,
                currency
            )
            printBuffer.append(discountLine)
        }

        val vatLine = formatPrinterLine(
            printer = printer,
            label = "Total VAT",
            arLabel = "إجمالي ضريبة القيمة المضافة",
            value = order.payment.vat.toString(),
            false,
            currency
        )
        printBuffer.append(vatLine)

        val totalLine = formatPrinterLine(
            printer = printer,
            label = "Total Amount",
            arLabel = "المبلغ الإجمالي",
            value = order.payment.total.toString(),
            false,
            currency
        )
        printBuffer.append(totalLine)
        printBuffer.append("[C]------------------------------------------------\n")

        // Payment breakup
        if (!order.payment.breakup.isNullOrEmpty()) {
            order.payment.breakup.forEach { breakup ->
                if (breakup.name.toLowerCase() == "cash") {
                    // For cash payments, show paid amount and change
                    val paidAmount = breakup.paid ?: breakup.total
                    val change = breakup.change ?: 0.0

                    printBuffer.append("[L]Cash[R]$currency ${formatCurrency(paidAmount)}\n")
                    if (change > 0) {
                        printBuffer.append("[L]Change[R]$currency ${formatCurrency(change)}\n")
                    }
                } else {
                    printBuffer.append("[L]${breakup.name}[R]$currency ${formatCurrency(breakup.total)}\n")
                }
            }
            printBuffer.append("[C]------------------------------------------------\n")
        }

        var footer = "Thank You"
        if (!order.location.invoiceFooter.isNullOrEmpty()) {
            footer = order.location.invoiceFooter
        }

        if (!order.specialInstructions.isNullOrEmpty()) {
            var specialInstructions = order.specialInstructions
            if (specialInstructions.length > 40) {
                specialInstructions = specialInstructions.replace(
                    "(.{40})".toRegex(),
                    "$1\n"
                )
            }
            printBuffer.append(
                "[C]------------------------------------------------\n[C]<b>Special Instruction</b>\n[C]<img>" +
                        PrinterTextParserImg.bitmapToHexadecimalString(
                            printer,
                            specialInstruction
                        ) + "</img>\n[C]$specialInstructions\n"
            )
        }

        if (!order.location.returnPolicy.isNullOrEmpty()) {
            val is2Inch = false
            printBuffer.append("[C]${"-".repeat(if (is2Inch) 32 else 48)}\n")
            printBuffer.append("[C]<b>Return Policy</b>\n")

            if (PrinterHelper.isArabicText(order.location.returnPolicy)) {
                printBuffer.append(
                "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                    printer,
                    returnPolicyArabic
                ) + "</img>\n" )

                val returnPolicyParts = getMultiLineText(order.location.returnPolicy, is2Inch)
                for (part in returnPolicyParts) {
                    printBuffer.append("[C]<img>${imageToHex(
                        printer,
                        part,
                        "center",
                        if (is2Inch) "25" else "35"
                    )}</img>\n")
                }
            } else {
                val returnPolicyParts = getMultiLineText(order.location.returnPolicy, is2Inch)
                for (part in returnPolicyParts) {
                    printBuffer.append("[C]$part\n")
                }
            }
        }

        if (!order.location.customText.isNullOrEmpty()) {
            val is2Inch = false
            printBuffer.append("[C]${"-".repeat(if (is2Inch) 32 else 48)}\n")

            if (PrinterHelper.isArabicText(order.location.customText)) {
                val customTextParts = getMultiLineText(order.location.customText, is2Inch)
                for (part in customTextParts) {
                    printBuffer.append("[C]<img>${imageToHex(
                        printer,
                        part,
                        "center",
                        if (is2Inch) "25" else "35"
                    )}</img>\n")
                }
            } else {
                val customTextParts = getMultiLineText(order.location.customText, is2Inch)
                for (part in customTextParts) {
                    printBuffer.append("[C]$part\n")
                }
            }
        }

        printBuffer.append("[C]------------------------------------------------\n[C]" + footer + "\n")

        val qrCode = getQRData(
            mapOf(
                "company" to mapOf("en" to order.company?.name),
                "vat" to order.location.vat,
                "createdAt" to order.createdAt,
                "payment" to mapOf(
                    "total" to order.payment?.total,
                    "vat" to order.payment?.vat
                )
            )
        )


        if (qrCode != null) {
            val qrSize = if (order.changeSize == true) "50" else "25"
            printBuffer.append("\n[C]------------------------------------------------\n[C]<qrcode size='$qrSize'>" + qrCode + "</qrcode>\n[L]\n\n[C]Powered by Tijarah360\n[L]\n\n[L]\n\n[L]\n\n")
        } else {
            printBuffer.append("\n[C]------------------------------------------------\n[C]Powered by Tijarah360\n[L]\n\n[L]\n\n[L]\n\n")
        }

        return printBuffer.toString()
    }
    override fun getRefundReceipt(printer: EscPosPrinter,order: Order): String {
        Log.d(TAG, "Generating refund receipt template for order ${order._id}")
        Log.d(TAG,order.refunds.toString())

        // Check if refunds array exists and has elements
        if (order.refunds.isNullOrEmpty()) {
            Log.e(TAG, "No refunds found for order ${order._id}")
            return "[C]<b>ERROR: No refund data available</b>\n[L]\n\n"
        }

        val refund = order.refunds[0]
        val printBuffer = StringBuffer()
        val currency = order.currency ?: "SAR"

        // Generate bitmaps for Arabic text
        val locationName = BitmapUtils.getBitmap(
            context,
            order.location.name.ar,
            36,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_CENTER
        )
        val locationAddress = BitmapUtils.getBitmap(
            context,
            order.location.address,
            28,
            Typeface.SANS_SERIF,
            Layout.Alignment.ALIGN_CENTER
        )
        val refundReceiptAr = BitmapUtils.getBitmap(
            context,
            "إشعار الدائن/إيصال الاسترداد",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_CENTER
        )
        val specialInstruction = BitmapUtils.getBitmap(
            context,
            "تعليمات خاصة",
            28,
            Typeface.SANS_SERIF,
            Layout.Alignment.ALIGN_CENTER
        )

        val description = BitmapUtils.getBitmap(
            context,
            "وصف",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )

        val refundReceiptNo = BitmapUtils.getBitmap(
            context,
            "إيصال استرداد",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )

        val invoiceRef = BitmapUtils.getBitmap(
            context,
            "فاتورة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )

        val header = BitmapUtils.getBitmap(
            context,
            "الكمية                              الكمية                           سعر الوحدة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )

        val customerLabel = BitmapUtils.getBitmap(
            context,
            "العميل",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE

        )

        val customerVat = BitmapUtils.getBitmap(
            context,
            "العميل VAT",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )

        val returnPolicyArabic = BitmapUtils.getBitmap(
            context,
            "سياسة العائدات",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_CENTER
        )

        // Customer name handling with Arabic detection
        var customerNameContent = ""
        if (!order.customer?.name.isNullOrEmpty()) {
            val customerName = order.customer!!.name
            if (PrinterHelper.isArabicText(customerName)) {
                val customerNameAr = BitmapUtils.getBitmap(
                    context,
                    customerName,
                    32,
                    Typeface.SANS_SERIF,
                    Layout.Alignment.ALIGN_OPPOSITE
                )
                customerNameContent = "[L]Customer[R]\n[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(printer, customerNameAr) + "</img>\n"
            } else {
                customerNameContent = "[L]Customer[R]$customerName\n"
            }
        }

        // Build the refund receipt content
        printBuffer.append(
            "[C]<font size='tall'>" + order.location.name.en + "</font>\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                locationName
            ) + "</img>\n" +
                    "[C]<font size='normal'>VAT No." + order.location.vat + "</font>\n" +
                    "[C]<font size='normal'>PH No. " + order.location.phone + "</font>\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                locationAddress
            ) + "</img>\n" +
                    "[C]------------------------------------------------\n" +
                    "[L]Refund Receipt Number"+
                    "\n[L]<img>"+PrinterTextParserImg.bitmapToHexadecimalString(printer,refundReceiptNo)+"</img>\n[L]${refund.referenceNumber}\n"+
                    "[L]Invoice Reference Number"+
                    "\n[L]<img>"+PrinterTextParserImg.bitmapToHexadecimalString(printer,invoiceRef)+"</img>\n[L]${order.orderNum}\n"+

                    "[L]Date & Time[R]" + (refund.date ?: formatDate(Date())) + "\n"
        )

        // Handle customer name with Arabic text detection
        val customerName = order.customer?.name?.trim().takeIf { !it.isNullOrEmpty() } ?: "NA"
        val is2Inch = order.changeSize == true

        if (customerName.isNotEmpty() && customerName != "NA" && PrinterHelper.isArabicText(customerName)) {
            printBuffer.append("[L]Customer\n")
            printBuffer.append("[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                customerLabel
            ) + "</img>\n")
            printBuffer.append("[C]<img>${imageToHexRev(printer, "  ${customerName}${" ".repeat(if (is2Inch) 25 else 35)}", "left", if (is2Inch) "25" else "35")}</img>\n")
        } else {
            printBuffer.append("[L]Customer[R]${customerName}\n")
            printBuffer.append("[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                customerLabel
            ) + "</img>\n")
        }

        if (!order.customer?.vat.isNullOrEmpty()) {
            printBuffer.append(
                "[L]Customer VAT[R]" + (order.customer?.vat ?: "NA") + "\n" +
                        "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                    printer,
                    customerVat
                ) + "</img>\n"
            )
        }

        if (!order.tokenNum.isNullOrEmpty()) {
            printBuffer.append("[C]------------------------------------------------\n" + "[C]<b>" + order.tokenNum + "</b>\n")
        }

        if (!order.table.isNullOrEmpty() && order.table != "NA") {
            printBuffer.append("[C]------------------------------------------------\n" + "[C]<b>" + order.table + "</b>\n")
        }

        if (!order.orderType.isNullOrEmpty()) {
            printBuffer.append("[C]" + order.orderType + "\n")
        }



        printBuffer.append( "[C]------------------------------------------------\n" +
                "[C]Notice Creditor / Refund Receipt\n" +
                "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
            printer,
            refundReceiptAr
        ) + "</img>\n")
        printBuffer.append( "[C]------------------------------------------------\n" )
        printBuffer.append( "[L]<b>Description</b>\n" +
                "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
            printer,
            description
        ) + "</img>\n" +
                "[L]<b>Unit Price</b>[C]<b>Qty</b>[R]<b>Total   </b>\n" +
                "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
            printer,
            header
        ) + "</img>\n")
        printBuffer.append("[C]------------------------------------------------\n")
        // Add refunded items
        refund.items.forEach { item ->
            printBuffer.append(
                "[L]" + item.nameEn + "\n" +
                        "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                    printer,
                    BitmapUtils.getBitmap(
                        context,
                        item.nameAr,
                        32,
                        Typeface.SANS_SERIF,
                        Layout.Alignment.ALIGN_OPPOSITE
                    )
                ) + "</img>\n"
            )

            printBuffer.append("[L]" + formatCurrency(item.amount / item.qty) + "[C]" + item.qty + "[R]" + if (item.qty > 0) "${formatCurrency(item.amount)}" else "FREE" + "\n")
            printBuffer.append("\n")
        }

        printBuffer.append("[C]------------------------------------------------\n")

        // Calculate refund subtotal (sum of all refunded items before VAT)
        val refundSubTotal = refund.items.sumOf { it.amount - (it.vat ?: 0.0) }

        val subTotalFormatted = formatPrinterLine(
            printer,
            label = "Total Taxable Amount",
            arLabel = "إجمالي المبلغ الخاضع للضريبة",
            value = refundSubTotal.toString(),
            false,
            currency
        )
        printBuffer.append(subTotalFormatted)


        refund.charges.forEach { charge ->
            val chargeLine = formatPrinterLine(
                printer = printer,
                label = charge.name.en,
                arLabel = charge.name.ar ?: charge.name.en,
                value = charge.totalCharge.toString(),
                false,
                currency
            )
            printBuffer.append(chargeLine)
        }



        val vatLine = formatPrinterLine(
            printer = printer,
            label = "VAT Refund",
            arLabel = "استرداد",
            value = refund.vat.toString(),
            false,
            currency
        )
        printBuffer.append(vatLine)
        printBuffer.append("[C]------------------------------------------------\n")

        val totalLine = formatPrinterLine(
            printer = printer,
            label = "Total Refund",
            arLabel = "إجمالي المبلغ المسترد",
            value = refund.amount.toString(),
            false,
            currency
        )
        printBuffer.append(totalLine)

        printBuffer.append("[C]------------------------------------------------\n")

        // Refund method (similar to payment breakup)
        if (!refund.refundedTo.isNullOrEmpty()) {
            refund.refundedTo.forEach { refundPayment ->
                printBuffer.append(
                    "[L]" + refundPayment.refundTo + "[R]" + formatCurrency(refundPayment.amount) + "\n"
                )
            }
            printBuffer.append("[C]------------------------------------------------\n")
        }

        var footer = "Thank You"
        if (!order.location.invoiceFooter.isNullOrEmpty()) {
            footer = order.location.invoiceFooter
        }

        if (!order.specialInstructions.isNullOrEmpty()) {
            var specialInstructions = order.specialInstructions
            if (specialInstructions.length > 40) {
                specialInstructions = specialInstructions.replace(
                    "(.{40})".toRegex(),
                    "$1\n"
                )
            }
            printBuffer.append(
                "[C]------------------------------------------------\n[C]<b>Special Instruction</b>\n[C]<img>" +
                        PrinterTextParserImg.bitmapToHexadecimalString(
                            printer,
                            specialInstruction
                        ) + "</img>\n[C]$specialInstructions\n"
            )
        }

        if (!order.location.returnPolicy.isNullOrEmpty()) {
            val is2Inch = false

            printBuffer.append("[C]<b>Return Policy</b>\n")

            if (PrinterHelper.isArabicText(order.location.returnPolicy)) {
                printBuffer.append(
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                        printer,
                        returnPolicyArabic
                    ) + "</img>\n" )


                val returnPolicyParts = getMultiLineText(order.location.returnPolicy, is2Inch)
                for (part in returnPolicyParts) {
                    printBuffer.append("[C]<img>${imageToHex(
                        printer,
                        part,
                        "center",
                        if (is2Inch) "25" else "35"
                    )}</img>\n")
                }
            } else {
                val returnPolicyParts = getMultiLineText(order.location.returnPolicy, is2Inch)
                for (part in returnPolicyParts) {
                    printBuffer.append("[C]$part\n")
                }
            }
        }

        if (!order.location.customText.isNullOrEmpty()) {
            val is2Inch = false
            printBuffer.append("[C]${"-".repeat(if (is2Inch) 32 else 48)}\n")

            if (PrinterHelper.isArabicText(order.location.customText)) {
                val customTextParts = getMultiLineText(order.location.customText, is2Inch)
                for (part in customTextParts) {
                    printBuffer.append("[C]<img>${imageToHex(
                        printer,
                        part,
                        "center",
                        if (is2Inch) "25" else "35"
                    )}</img>\n")
                }
            } else {
                val customTextParts = getMultiLineText(order.location.customText, is2Inch)
                for (part in customTextParts) {
                    printBuffer.append("[C]$part\n")
                }
            }
        }



        val qrCode = getQRData(
            mapOf(
                "company" to mapOf("en" to order.company?.name),
                "vat" to order.location.vat,
                "createdAt" to order.createdAt,
                "payment" to mapOf(
                    "total" to refund.amount,
                    "vat" to refund.vat
                )
            )
        )



        if (qrCode != null) {
            val qrSize = if (order.changeSize == true) "50" else "25"
            printBuffer.append("\n[C]------------------------------------------------\n[C]<qrcode size='$qrSize'>" + qrCode + "</qrcode>\n[C]------------------------------------------------\n[C]"+ footer + "\n"+"[L]\n\n[C]Powered by Tijarah360\n[L]\n\n[L]\n\n[L]\n\n")
        } else {
            printBuffer.append("\n[C]------------------------------------------------\n[C]Powered by Tijarah360\n[L]\n\n[L]\n\n[L]\n\n")
        }

        return printBuffer.toString()
    }
    override fun getKot(printer: EscPosPrinter, order: Order, kitchenName: String?): String {
        Log.d(TAG, "Generating KOT template for order ${order._id}")

        // Generate bitmaps for Arabic text
        val locationNameAr = BitmapUtils.getBitmap(
            context,
            order.location.name.ar,
            36,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_CENTER
        )
        val locationAddressAr = BitmapUtils.getBitmap(
            context,
            order.location.address,
            28,
            Typeface.SANS_SERIF,
            Layout.Alignment.ALIGN_CENTER
        )
        val invoiceNumberAr = BitmapUtils.getBitmap(
            context,
            "رقم الفاتورة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val dateTimeAr = BitmapUtils.getBitmap(
            context,
            "التاريخ والوقت",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val descriptionQtyAr = BitmapUtils.getBitmap(
            context,
            "الكمية                                                                             الوصف",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val totalQtyAr = BitmapUtils.getBitmap(
            context,
            "إجمالي الكمية",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val specialInstructionsAr = BitmapUtils.getBitmap(
            context,
            "تعليمات خاصة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_CENTER
        )

        var kotContent = "[C]<b>${order.location.name.en}</b>\n" +
                "[C]<img>${PrinterTextParserImg.bitmapToHexadecimalString(printer, locationNameAr)}</img>\n" +
                "[C]<img>${PrinterTextParserImg.bitmapToHexadecimalString(printer, locationAddressAr)}</img>\n" +
                "[C]------------------------------------------------\n" +
                "[L]Invoice[R]#${order.orderNum}\n"

        if (!order.table.isNullOrEmpty()) {
            kotContent += "[L]Table[R]${order.table}\n"
        }

        if (!order.kotId.isNullOrEmpty()) {
            kotContent += "[L]KOT[R]${order.kotId}\n"
        }

        kotContent += "[L]<img>${PrinterTextParserImg.bitmapToHexadecimalString(printer, invoiceNumberAr)}</img>\n" +
                "[L]Date & time[R]${formatDate(order.createdAt)}\n" +
                "[L]<img>${PrinterTextParserImg.bitmapToHexadecimalString(printer, dateTimeAr)}</img>\n"

        if (!order.tokenNum.isNullOrEmpty()) {
            kotContent += "[C]------------------------------------------------\n"
            kotContent += "[C]<font size='big'>${order.tokenNum}</font>\n"
        }

        if (!order.orderType.isNullOrEmpty()) {
            kotContent += "[C]------------------------------------------------\n"
            kotContent += "[C]${order.orderType}\n"
        }

        kotContent += "[C]------------------------------------------------\n" +
                "[C]<b>KOT</b>\n" +
                "[C]------------------------------------------------\n" +
                "[L]Description[R]Qty\n" +
                "[L]<img>${PrinterTextParserImg.bitmapToHexadecimalString(printer, descriptionQtyAr)}</img>\n" +
                "[C]------------------------------------------------\n"

        var qty = 0

        // Items are already filtered by PrintController, so just use all items
        // The order object passed here contains only items relevant to this printer
        val items = order.items

        if (items.isEmpty()) {
            kotContent += "[C]No items for ${kitchenName ?: "any kitchen"}\n"
            return kotContent
        }

        items.forEach { item ->
            val itemNameAr = BitmapUtils.getBitmap(
                context,
                item.name.ar,
                28,
                Typeface.SANS_SERIF,
                Layout.Alignment.ALIGN_OPPOSITE
            )
            qty += item.qty

            kotContent += "[L]" + item.name.en + "[R]" + item.qty + "\n" +
                    "[L]<img>${PrinterTextParserImg.bitmapToHexadecimalString(printer, itemNameAr)}</img>\n"

            if (!item.modifiers.isNullOrEmpty()) {
                item.modifiers.forEach { modifier ->
                    kotContent += "[L]+ " + modifier.optionName + "\n"
                }
            }

            if (!item.note.isNullOrEmpty()) {
                kotContent += "[L]Note: " + item.note + "\n"
            }
        }

        kotContent += "[C]------------------------------------------------\n" +
                "[L]Total QTY[R]" + qty + "\n" +
                "[L]<img>${PrinterTextParserImg.bitmapToHexadecimalString(printer, totalQtyAr)}</img>\n"

        if (!order.specialInstructions.isNullOrEmpty()) {
            kotContent += "[C]------------------------------------------------\n" +
                    "[C]<b>Special Instructions</b>\n" +
                    "[C]<img>${PrinterTextParserImg.bitmapToHexadecimalString(printer, specialInstructionsAr)}</img>\n" +
                    "[C]" + order.specialInstructions + "\n"
        }

        kotContent += "[C]------------------------------------------------\n" +
                "[C]Printed: " + formatDate(Date()) + "\n" +
                "[L]\n\n[L]\n\n[L]\n\n"

        return kotContent
    }
    override fun getProforma(printer: EscPosPrinter,order: Order): String {
        Log.d(TAG, "Generating proforma template for order ${order._id}")

        val printBuffer = StringBuffer()
        val currency = order.currency ?: "SAR"

        // Generate bitmaps for Arabic text
        val locationName = BitmapUtils.getBitmap(
            context,
            order.location.name.ar,
            36,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_CENTER
        )
        val locationAddress = BitmapUtils.getBitmap(
            context,
            order.location.address,
            28,
            Typeface.SANS_SERIF,
            Layout.Alignment.ALIGN_CENTER
        )
        val invoice = BitmapUtils.getBitmap(
            context,
            "فاتورة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val specialInstruction = BitmapUtils.getBitmap(
            context,
            "تعليمات خاصة",
            28,
            Typeface.SANS_SERIF,
            Layout.Alignment.ALIGN_CENTER
        )
        val dateTime = BitmapUtils.getBitmap(
            context,
            "التاريخ و الوقت",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val customer = BitmapUtils.getBitmap(
            context,
            "العميل",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val customerVat = BitmapUtils.getBitmap(
            context,
            "العميل VAT",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val description = BitmapUtils.getBitmap(
            context,
            "وصف",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val totalTaxable = BitmapUtils.getBitmap(
            context,
            "إجمالي المبلغ الخاضع للضريبة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val totalAmount = BitmapUtils.getBitmap(
            context,
            "المبلغ الإجمالي",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val totalVat = BitmapUtils.getBitmap(
            context,
            "إجمالي ضريبة القيمة المضافة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val totalDiscount = BitmapUtils.getBitmap(
            context,
            "إجمالي الخصم",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val header = BitmapUtils.getBitmap(
            context,
            "الكمية                              الكمية                           سعر الوحدة",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        val returnPolicyArabic = BitmapUtils.getBitmap(
            context,
            "سياسة العائدات",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_CENTER
        )
        val customerLabel = BitmapUtils.getBitmap(
            context,
            "العميل",
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )

        // Build the proforma content
        printBuffer.append(
            "[C]<font size='tall'>" + order.location.name.en + "</font>\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                locationName
            ) + "</img>\n" +
                    "[C]<font size='normal'>VAT No." + order.location.vat + "</font>\n" +
                    "[C]<font size='normal'>PH No. " + order.location.phone + "</font>\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                locationAddress
            ) + "</img>\n" +
                    "[L]Date & Time[R]" + formatDate(order.createdAt) + "\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                dateTime
            ) + "</img>\n"
        )

        // Handle customer name with Arabic text detection
        val customerName = order.customer?.name ?: "NA"
        val is2Inch = order.changeSize == true

        if (customerName.isNotEmpty() && customerName != "NA" && PrinterHelper.isArabicText(customerName)) {
            printBuffer.append("[L]Customer\n")
            printBuffer.append("[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                customerLabel
            ) + "</img>\n")
            printBuffer.append("[C]<img>${imageToHexRev(printer, "  ${customerName}${" ".repeat(if (is2Inch) 25 else 35)}", "left", if (is2Inch) "25" else "35")}</img>\n")
        } else {
            printBuffer.append("[L]Customer[R]${customerName.trim()}\n")
            printBuffer.append("[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                customerLabel
            ) + "</img>\n")
        }

        if (!order.customer?.vat.isNullOrEmpty()) {
            printBuffer.append(
                "[L]Customer VAT[R]" + (order.customer?.vat ?: "NA") + "\n" +
                        "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                    printer,
                    customerVat
                ) + "</img>\n"
            )
        }

        if (!order.tokenNum.isNullOrEmpty()) {
            printBuffer.append("[C]------------------------------------------------\n" + "[C]<b>" + order.tokenNum + "</b>\n")
        }

        if (!order.table.isNullOrEmpty() && order.table != "NA") {
            printBuffer.append("[C]------------------------------------------------\n" + "[C]<b>" + order.table + "</b>\n")
        }

        if (!order.orderType.isNullOrEmpty()) {
            printBuffer.append("[C]" + order.orderType + "\n")
        }

        printBuffer.append(
            "[C]------------------------------------------------\n" +
                    "[C]Proforma Invoice\n" +
                    "[C]------------------------------------------------\n" +
                    "[L]<b>Description</b>\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                description
            ) + "</img>\n" +
                    "[L]<b>Unit Price</b>[C]<b>Qty</b>[R]<b>Total</b>\n" +
                    "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                printer,
                header
            ) + "</img>\n"
        )

        printBuffer.append("[C]------------------------------------------------\n")

        order.items.forEach { item ->
            printBuffer.append(
                "[L]" + item.name.en + "\n" +
                        "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                    printer,
                    BitmapUtils.getBitmap(
                        context,
                        item.name.ar,
                        32,
                        Typeface.SANS_SERIF,
                        Layout.Alignment.ALIGN_OPPOSITE
                    )
                ) + "</img>\n"
            )

            if (!item.modifiers.isNullOrEmpty()) {
                item.modifiers.forEach { modifier ->
                    printBuffer.append("[L]+ " + modifier.name + "\n")
                }
            }

            if (!item.note.isNullOrEmpty()) {
                printBuffer.append("[L]Note: " + item.note + "\n")
            }

            printBuffer.append("[L]" + formatCurrency(item.sellingPrice) + "[C]" + item.qty + "[R]" + formatCurrency(item.total) + "\n")
        }

        printBuffer.append("[C]------------------------------------------------\n")

        val subTotalFormatted = formatPrinterLine(
            printer,
            label = "Total Taxable Amount",
            arLabel = "إجمالي المبلغ الخاضع للضريبة",
            value = order.payment.subTotal.toString(),
            false,
            currency
        )

        printBuffer.append(subTotalFormatted)

        if (!order.payment.charges.isNullOrEmpty()) {
            order.payment.charges.forEach { charge ->
                val line = formatPrinterLine(
                    printer = printer,
                    label = charge.name.en,
                    arLabel = charge.name.ar,
                    value = charge.total.toString(),
                    false,
                    currency
                )
                printBuffer.append(line)
            }
        }

        if (order.payment.discount > 0) {
            val discountLine = formatPrinterLine(
                printer = printer,
                label = "Total Discount",
                arLabel = "إجمالي الخصم",
                value = order.payment.discount.toString(),
                false,
                currency
            )
            printBuffer.append(discountLine)
        }

        val vatLine = formatPrinterLine(
            printer = printer,
            label = "Total VAT",
            arLabel = "إجمالي ضريبة القيمة المضافة",
            value = order.payment.vat.toString(),
            false,
            currency
        )
        printBuffer.append(vatLine)

        val totalLine = formatPrinterLine(
            printer = printer,
            label = "Total Amount",
            arLabel = "المبلغ الإجمالي",
            value = order.payment.total.toString(),
            false,
            currency
        )
        printBuffer.append(totalLine)

        printBuffer.append("[C]------------------------------------------------\n")

        // Payment breakup
        if (!order.payment.breakup.isNullOrEmpty()) {
            order.payment.breakup.forEach { breakup ->
                if (breakup.name.toLowerCase() == "cash") {
                    // For cash payments, show paid amount and change
                    val paidAmount = breakup.paid ?: breakup.total
                    val change = breakup.change ?: 0.0

                    printBuffer.append("[L]Cash[R]$currency ${formatCurrency(paidAmount)}\n")
                    if (change > 0) {
                        printBuffer.append("[L]Change[R]$currency ${formatCurrency(change)}\n")
                    }
                } else {
                    printBuffer.append("[L]${breakup.name}[R]$currency ${formatCurrency(breakup.total)}\n")
                }
            }
            printBuffer.append("[C]------------------------------------------------\n")
        }

        var footer = "Thank You"
        if (!order.location.invoiceFooter.isNullOrEmpty()) {
            footer = order.location.invoiceFooter
        }

        if (!order.specialInstructions.isNullOrEmpty()) {
            var specialInstructions = order.specialInstructions
            if (specialInstructions.length > 40) {
                specialInstructions = specialInstructions.replace(
                    "(.{40})".toRegex(),
                    "$1\n"
                )
            }
            printBuffer.append(
                "[C]------------------------------------------------\n[C]<b>Special Instruction</b>\n[C]<img>" +
                        PrinterTextParserImg.bitmapToHexadecimalString(
                            printer,
                            specialInstruction
                        ) + "</img>\n[C]$specialInstructions\n"
            )
        }

        if (!order.location.returnPolicy.isNullOrEmpty()) {
            val is2Inch = false
            printBuffer.append("[C]${"-".repeat(if (is2Inch) 32 else 48)}\n")
            printBuffer.append("[C]<b>Return Policy</b>\n")

            if (PrinterHelper.isArabicText(order.location.returnPolicy)) {
                printBuffer.append(
                "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(
                    printer,
                    returnPolicyArabic
                ) + "</img>\n" )

                val returnPolicyParts = getMultiLineText(order.location.returnPolicy, is2Inch)
                for (part in returnPolicyParts) {
                    printBuffer.append("[C]<img>${imageToHex(
                        printer,
                        "  $part  ",
                        "center",
                        if (is2Inch) "25" else "35"
                    )}</img>\n")
                }
            } else {
                val returnPolicyParts = getMultiLineText(order.location.returnPolicy, is2Inch)
                for (part in returnPolicyParts) {
                    printBuffer.append("[C]$part\n")
                }
            }
        }

        if (!order.location.customText.isNullOrEmpty()) {
            val is2Inch = false
            printBuffer.append("[C]${"-".repeat(if (is2Inch) 32 else 48)}\n")

            if (PrinterHelper.isArabicText(order.location.customText)) {
                val customTextParts = getMultiLineText(order.location.customText, is2Inch)
                for (part in customTextParts) {
                    printBuffer.append("[C]<img>${imageToHex(
                        printer,
                        "  $part  ",
                        "center",
                        if (is2Inch) "25" else "35"
                    )}</img>\n")
                }
            } else {
                val customTextParts = getMultiLineText(order.location.customText, is2Inch)
                for (part in customTextParts) {
                    printBuffer.append("[C]$part\n")
                }
            }
        }

        printBuffer.append("[C]------------------------------------------------\n[C]Payment Pending\n")
        printBuffer.append("[C]------------------------------------------------\n[C]" + footer + "\n")
        printBuffer.append("\n[L]\n\n[L]\n\n[L]\n\n\n")

        return printBuffer.toString()
    }

    // Use helper functions from PrinterHelper
    private fun centerText(text: String, width: Int = 40): String {
        return PrinterHelper.centerText(text, width)
    }

    private fun alignRight(text: String, width: Int = 12): String {
        return PrinterHelper.alignRight(text, width)
    }

    private fun truncateText(text: String, maxLength: Int): String {
        return PrinterHelper.truncateText(text, maxLength)
    }

    private fun dashedLine(width: Int = 40): String {
        return PrinterHelper.dashedLine(width)
    }

    private fun formatDate(date: Date): String {
        return PrinterHelper.formatDate(date)
    }

    private fun formatCurrency(amount: Double): String {
        return PrinterHelper.formatCurrency(amount)
    }

    private fun getValidityPeriod(): Int {
        return PrinterHelper.getValidityPeriod()
    }

    // Helper function to format printer line with Arabic text
    private fun formatPrinterLine(
        printer: EscPosPrinter,
        label: String,
        arLabel: String,
        value: String,
        isBold: Boolean = false,
        currency: String = "SAR"
    ): String {
        return PrinterHelper.formatPrinterLine(context, printer, label, arLabel, value, isBold, currency)
    }
}
