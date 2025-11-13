package codes.shahid.rnprinterplugin.printer.neoleap.templates

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.Log
import com.dantsu.escposprinter.EscPosPrinter
import codes.shahid.rnprinterplugin.templates.Templates
import codes.shahid.rnprinterplugin.types.Order
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class NeoLeapTemplates(private val context: Context) : Templates {

    companion object {
        private const val TAG = "NeoLeapTemplates"
    }

    /**
     * Utility function to chunk text into smaller pieces
     * @param text The text to chunk
     * @param maxLength The maximum length of each chunk
     * @return List of text chunks
     */
    private fun chunkText(text: String, maxLength: Int): List<String> {
        if (text.length <= maxLength) return listOf(text)

        val chunks = mutableListOf<String>()
        var start = 0

        while (start < text.length) {
            val end = minOf(start + maxLength, text.length)
            chunks.add(text.substring(start, end))
            start = end
        }

        return chunks
    }


    private fun drawArabic(text: String, align: String, width: Int, marginLeft: Int): Bitmap {
        val bitmapWidth = width
        val bitmapHeight = 50

        val textBitmap = Bitmap.createBitmap(bitmapWidth, bitmapHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(textBitmap)
        val paint = Paint()
        paint.color = Color.BLACK // Set the text color
        paint.textSize = 31f // Set the text size
        paint.isAntiAlias = true

        when (align) {
            "center" -> {
                Log.d("PRINT_TEST", "$align$text")
                paint.textAlign = Paint.Align.CENTER
            }
            "right" -> {
                paint.textAlign = Paint.Align.LEFT
            }
            else -> {
                Log.d("PRINT_TEST", "$align$text")
                paint.textAlign = Paint.Align.RIGHT
            }
        }

        val xPosition = (bitmapWidth / 2).toFloat() + marginLeft
        val yPosition = bitmapHeight / 2 - (paint.descent() + paint.ascent()) / 2
        canvas.drawText(text, xPosition, yPosition, paint)
        return textBitmap
    }

    fun getReceiptData(order: Order): Pair<StringBuffer, MutableMap<String, Bitmap>> {
        Log.d(TAG, "Generating receipt for order ${order._id}")
        val printData = StringBuffer()
        val bitmaps: MutableMap<String, Bitmap> = HashMap()
        val currency = order.currency ?: "SAR"

        // Generate bitmaps for Arabic text
        bitmaps["locationName"] = drawArabic(order.location.name.ar, "center", 400, 0)
        bitmaps["dateAndTime"] = drawArabic("التاريخ و الوقت", "left", 350, 0)

        // Customer name handling
        if (order.customer != null) {
            val customerNameChunks = chunkText(order.customer.name, 30)
            customerNameChunks.forEachIndexed { index, chunk ->
                bitmaps["customerName$index"] = drawArabic(chunk, "left", 400, 200)
            }
        }

        bitmaps["invoice"] = drawArabic("فاتورة", "left", 170, 0)
        bitmaps["simplifiedTaxInvoice"] = drawArabic("فاتورة ضريبية مبسطة", "center", 400, 0)
        bitmaps["returnPolicy"] = drawArabic("سياسة العائدات", "center", 400, 0)
        bitmaps["header"] = drawArabic("المجموع    الكمية          سعر الوحدة", "center", 400, 0)
        bitmaps["description"] = drawArabic("وصف", "left", 170, 0)
        bitmaps["unitPrice"] = drawArabic("الكمية       الكمية                سعر الوحدة", "left", 700, 0)
        bitmaps["qty"] = drawArabic("الكمية", "left", 250, 0)
        bitmaps["totalTaxable"] = drawArabic("إجمالي المبلغ الخاضع للضريبة", "left", 370, 140)
        bitmaps["totalVat"] = drawArabic("إجمالي ضريبة القيمة المضافة", "left", 370, 140)
        bitmaps["totalAmount"] = drawArabic("المبلغ الإجمالي", "left", 370, 0)
        bitmaps["customer"] = drawArabic("العميل", "left", 170, 0)
        bitmaps["customerVat"] = drawArabic("العميل VAT", "left", 350, 0)
        bitmaps["discount"] = drawArabic("إجمالي الخصم", "left", 350, 0)
        bitmaps["locationAddress"] = drawArabic(order.location.address, "center", 400, 0)

        // Build receipt content
        printData.append("!NLFONT 15 15 3\n*text c " + order.location.name.en + "\n")
        printData.append("*image c 600*50 path:locationName\n")
        printData.append("*feedline 1\n")

        if (order.location.vat.isNotEmpty()) {
            printData.append("!NLFONT 15 15 3\n*text c VAT No. " + order.location.vat + "\n")
        }

        printData.append("!NLFONT 15 15 3\n*text c PH No. " + order.location.phone + "\n")
        printData.append("*image c 600*35 path:locationAddress\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 15 15 3\n*text l Invoice No.\n")
        printData.append("*image l 170*50 path:invoice\n")
        printData.append("!NLFONT 15 15 3\n*text r #" + order.orderNum +"\n");
        printData.append("!NLFONT 15 15 3\n*text l Date & Time:\n\n")
        printData.append("*image l 280*50 path:dateAndTime\n")
        printData.append("!NLFONT 15 15 3\n*text r " + order.createdAt + "\n")

        if (order.customer != null && order.customer.name.isNotEmpty()) {
            printData.append("!NLFONT 15 15 3\n*text l Customer:\n")
            printData.append(("*image l 170*50 path:customer\n\n"))
            val customerNameChunks = chunkText(order.customer.name, 30)
            customerNameChunks.forEachIndexed { index, _ ->
                printData.append("*image r 400*40 path:customerName$index\n")
            }
        }

        if (order.customer != null && order.customer.vat.isNotEmpty()) {
            printData.append("!NLFONT 15 15 3\n*TEXT l Customer VAT:\n!NLFONT 15 15 3\n*text r " + order.customer.vat + "\n")
            printData.append(("*image l 300*50 path:customerVat\n"))
        }

        if (order.tokenNum != null && order.tokenNum.isNotEmpty()) {
            printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
            printData.append("!NLFONT 15 15 3\n*text c " + order.tokenNum + "\n")
        }

        if (order.orderType != null && order.orderType.isNotEmpty()) {
            printData.append("!NLFONT 15 15 3\n*text c " + order.orderType + "\n")
        }

        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 15 15 3\n*text c Simplified Tax Invoice\n")
        printData.append("*image l 370*40 path:simplifiedTaxInvoice\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 15 15 3\n*text l Description\n*image l 170*40 path:description\n")
        printData.append("!NLFONT 15 15 3\n*text l UnitPrice           Qty    Total\n")
        printData.append("*image l 370*40 path:header\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // Print items
        order.items.forEach { item ->
            printData.append("!NLFONT 15 15 3\n*text l ${item.name.en}\n")

            if (item.name.ar.length > 30) {
                bitmaps[item.sku + "1"] = drawArabic(item.name.ar.substring(0, 30), "center", 400, 50)
                bitmaps[item.sku + "2"] = drawArabic(item.name.ar.substring(30), "left", 400, 0)
                printData.append("*image l 370*40 path:${item.sku + "1"}\n")
                printData.append("*image l 370*40 path:${item.sku + "2"}\n")
            } else {
                Log.d("LENGTH_TEST", item.name.ar + "  :" + item.name.ar.length.toString())
                var margin = -120
                when {
                    item.name.ar.length > 16 && item.name.ar.length <= 21 -> margin = -95
                    item.name.ar.length <= 16 -> margin = -20
                }
                bitmaps[item.sku] = drawArabic(item.name.ar, "right", 400, margin)
                printData.append("*image r 400*40 path:${item.sku}\n")
            }

            printData.append("\n!NLFONT 15 15 3\n*TEXT l ${item.sellingPrice}\n!NLFONT 15 15 3\n*text r ${item.qty}       ${item.total}\n\n")
        }

        // Print totals
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 15 15 3\n*TEXT l Total Taxable Amount:\n!NLFONT 15 15 3\n*text r $currency" + order.payment.subTotal + "\n")
        printData.append("*image l 370*40 path:totalTaxable\n")

        if (order.payment.discount > 0) {
            printData.append("!NLFONT 15 15 3\n*TEXT l Total Discount:\n!NLFONT 15 15 3\n*text r $currency" + order.payment.discount + "\n")
            printData.append("*image l 370*40 path:discount\n")
        }

        printData.append("!NLFONT 15 15 3\n*TEXT l Total Vat:\n!NLFONT 15 15 3\n*text r $currency" + order.payment.vat + "\n")
        printData.append("*image l 370*40 path:totalVat\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 15 15 3\n*TEXT l Total Amount:\n!NLFONT 15 15 3\n*text r $currency" + order.payment.total + "\n")
        printData.append("*image l 370*40 path:totalAmount\n")

        if (order.refunds.isNotEmpty()) {
            printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
            printData.append(
                "!NLFONT 15 15 3\n*text l Amount Refund:\n!NLFONT 15 15 3\n*text r $currency${
                    order.refunds[0].amount.toString()
                }\n"
            )
        }

        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // Payment breakdown
        order.payment.breakup.forEach { payment ->
            when (payment.providerName) {
                "card" -> {
                    if (payment.total > 0) {
                        printData.append("!NLFONT 15 15 3\n*TEXT l Card:\n!NLFONT 15 15 3\n*text r $currency ${payment.total}\n")
                    }
                }
                "wallet" -> {
                    if (payment.total > 0) {
                        printData.append("!NLFONT 15 15 3\n*TEXT l Wallet:\n!NLFONT 15 15 3\n*text r $currency ${payment.total}\n")
                    }
                }
                "credit" -> {
                    if (payment.total > 0) {
                        printData.append("!NLFONT 15 15 3\n*TEXT l Credit:\n!NLFONT 15 15 3\n*text r $currency ${payment.total}\n")
                    }
                }
                "cash" -> {
                    if (payment.total > 0) {
                        printData.append("!NLFONT 15 15 3\n*TEXT l Cash:\n!NLFONT 15 15 3\n*text r $currency ${payment.total}\n")
                    }
                }
                "tendered-cash" -> {
                    if (payment.total > 0) {
                        printData.append("!NLFONT 15 15 3\n*TEXT l Tendered Cash:\n!NLFONT 15 15 3\n*text r $currency ${payment.total}\n")
                    }
                }
                "change" -> {
                    if (payment.total > 0) {
                        printData.append("!NLFONT 15 15 3\n*TEXT l Change:\n!NLFONT 15 15 3\n*text r $currency ${payment.total}\n")
                    }
                }
            }
        }

        // Return policy
        val returnPolicy = order.location.returnPolicy
        if (returnPolicy != null) {
            if (returnPolicy.isNotEmpty()) {
                printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
                printData.append("!NLFONT 15 15 3\n*text c Return Policy\n")
                printData.append("*image l 370*40 path:returnPolicy\n")
                printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

                val returnPolicyChunks = chunkText(returnPolicy!!, 30)
                returnPolicyChunks.forEachIndexed { index, chunk ->
                    bitmaps["returnPolicy$index"] = drawArabic(chunk, "center", 450, 0)
                    printData.append("*image c 450*35 path:returnPolicy$index\n")
                }

                printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
            }
        }

        // Custom text
        val customText = order.location.customText
        if (customText != null) {
            if (customText.isNotEmpty()) {
                if (order.location.returnPolicy?.isEmpty() == true) {
                    printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
                }

                val customTextChunks = chunkText(customText, 30)
                customTextChunks.forEachIndexed { index, chunk ->
                    bitmaps["customText$index"] = drawArabic(chunk, "center", 450, 0)
                    printData.append("*image c 450*40 path:customText$index\n")
                }
            }
        }

        // Barcode and QR code
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!BARCODE 8 120 1 3\n*BARCODE c ${order.orderNum}\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // QR code
        if (order.qrCode != null) {
            printData.append("!QRCODE 300 0 3\n*QRCODE c ${order.qrCode}\n")
        }

        // Footer
        var footer = "Thank You"
        if (order.location.invoiceFooter?.isNotEmpty() == true) {
            footer = order.location.invoiceFooter!!
        }

        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        val footerChunks = chunkText(footer, 30)
        footerChunks.forEachIndexed { index, chunk ->
            bitmaps["footer$index"] = drawArabic(chunk, "center", 450, 0)
            printData.append("*image c 450*40 path:footer$index\n")
        }

        printData.append("*feedline 4\n")

        return Pair(printData, bitmaps)
    }

    /**
     * Generate refund receipt data for Neoleap printer
     * @param order The order data
     * @return Refund receipt data as a string and bitmaps
     */
    fun getRefundReceiptData(order: Order): Pair<StringBuffer, MutableMap<String, Bitmap>> {
        Log.d(TAG, "Generating refund receipt for order ${order._id}")
        val printData = StringBuffer()
        val bitmaps: MutableMap<String, Bitmap> = HashMap()
        val currency = order.currency ?: "SAR"

        // Generate bitmaps for Arabic text
        bitmaps["locationName"] = drawArabic(order.location.name.ar, "center", 400, 0)
        bitmaps["dateAndTime"] = drawArabic("التاريخ و الوقت", "left", 350, 0)

        // Customer name handling
        if (order.customer != null) {
            val customerNameChunks = chunkText(order.customer.name, 30)
            customerNameChunks.forEachIndexed { index, chunk ->
                bitmaps["customerName$index"] = drawArabic(chunk, "left", 400, 200)
            }
        }

        bitmaps["invoice"] = drawArabic("فاتورة", "left", 170, 0)
        bitmaps["refundInvoice"] = drawArabic("رقم إيصال الإسترجاع", "left", 320, 80)
        bitmaps["refundReceipt"] = drawArabic("إشعار الدائن/إيصال الاسترداد", "center", 400, 0)
        bitmaps["header"] = drawArabic("المجموع    الكمية          سعر الوحدة", "center", 400, 0)
        bitmaps["description"] = drawArabic("وصف", "left", 170, 0)
        bitmaps["unitPrice"] = drawArabic("الكمية       الكمية                سعر الوحدة", "left", 700, 0)
        bitmaps["qty"] = drawArabic("الكمية", "left", 250, 0)
        bitmaps["totalTaxable"] = drawArabic("إجمالي المبلغ الخاضع للضريبة", "left", 370, 140)
        bitmaps["vatRefund"] = drawArabic("استرداد", "left", 170, 0)
        bitmaps["amountRefund"] = drawArabic("المبلغ المسترد", "left", 370, 0)
        bitmaps["totalAmount"] = drawArabic("المبلغ الإجمالي", "left", 370, 0)
        bitmaps["customer"] = drawArabic("العميل", "left", 170, 0)
        bitmaps["customerVat"] = drawArabic("العميل VAT", "left", 350, 0)
        bitmaps["discount"] = drawArabic("إجمالي الخصم", "left", 350, 0)
        bitmaps["locationAddress"] = drawArabic(order.location.address, "center", 400, 0)
        bitmaps["returnPolicy"] = drawArabic("سياسة العائدات", "center", 400, 0)

        // Build receipt content
        printData.append("!NLFONT 15 15 3\n*text c " + order.location.name.en + "\n")
        printData.append("*image c 600*50 path:locationName\n")
        printData.append("*feedline 1\n")

        if (order.location.vat.isNotEmpty()) {
            printData.append("!NLFONT 15 15 3\n*text c VAT No. " + order.location.vat + "\n")
        }

        printData.append("!NLFONT 15 15 3\n*text c PH No. " + order.location.phone + "\n")
        printData.append("*image c 600*35 path:locationAddress\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 15 15 3\n*text l Invoice Reference No.\n")
        printData.append("*image l 170*50 path:invoice\n")
        printData.append("!NLFONT 15 15 3\n*text r #" + order.orderNum +"\n");

        // Refund receipt number
        val refundReceiptNo = if (order.refunds.isNotEmpty() && order.refunds[0].referenceNumber.isNotEmpty()) {
            order.refunds[0].referenceNumber
        } else {
            "R-" + order.orderNum
        }

        printData.append("!NLFONT 15 15 3\n*text l Refund Receipt NO.:\n")
        printData.append("*image l 280*50 path:refundInvoice\n")
        printData.append("!NLFONT 15 15 3\n*text r #" + refundReceiptNo + "\n")
        printData.append("!NLFONT 15 15 3\n*text l Date & Time:\n\n")
        printData.append("*image l 280*50 path:dateAndTime\n")
        printData.append("!NLFONT 15 15 3\n*text r " + order.createdAt + "\n")

        if (order.customer != null && order.customer.name.isNotEmpty()) {
            printData.append("!NLFONT 15 15 3\n*text l Customer:\n")
            printData.append(("*image l 170*50 path:customer\n\n"))
            val customerNameChunks = chunkText(order.customer.name, 30)
            customerNameChunks.forEachIndexed { index, _ ->
                printData.append("*image r 400*40 path:customerName$index\n")
            }
        }

        if (order.customer != null && order.customer.vat.isNotEmpty()) {
            printData.append("!NLFONT 15 15 3\n*TEXT l Customer VAT:\n!NLFONT 15 15 3\n*text r " + order.customer.vat + "\n")
            printData.append(("*image l 280*50 path:customerVat\n"))
        }

        if (order.tokenNum != null && order.tokenNum.isNotEmpty()) {
            printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
            printData.append("!NLFONT 15 15 3\n*text c " + order.tokenNum + "\n")
        }

        if (order.orderType != null && order.orderType.isNotEmpty()) {
            printData.append("!NLFONT 15 15 3\n*text c " + order.orderType + "\n")
        }

        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 15 15 3\n*text c Notice Creditor / Refund Receipt\n")
        printData.append("*image l 370*40 path:refundReceipt\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 15 15 3\n*text l Description\n*image l 170*40 path:description\n")
        printData.append("!NLFONT 15 15 3\n*text l UnitPrice           Qty    Total\n")
        printData.append("*image l 370*40 path:header\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // Print refunded items
        if (order.refunds.isNotEmpty()) {
            order.refunds[0].items.forEach { item ->
                printData.append("!NLFONT 15 15 3\n*text l ${item.nameEn}\n")

                if (item.nameAr.length > 30) {
                    bitmaps[item.sku + "1"] = drawArabic(item.nameAr.substring(0, 30), "center", 400, 50)
                    bitmaps[item.sku + "2"] = drawArabic(item.nameAr.substring(30), "left", 370, 0)
                    printData.append("*image l 370*40 path:${item.sku + "1"}\n")
                    printData.append("*image l 370*40 path:${item.sku + "2"}\n")
                } else {
                    Log.d("LENGTH_TEST", item.nameAr + "  :" + item.nameAr.length.toString())
                    var margin = -120
                    when {
                        item.nameAr.length > 16 && item.nameAr.length <= 21 -> margin = -95
                        item.nameAr.length <= 16 -> margin = -20
                    }
                    bitmaps[item.sku] = drawArabic(item.nameAr, "right", 370, margin)
                    printData.append("*image r 370*40 path:${item.sku}\n")
                }

                val unitPrice = if (item.qty > 0) {
                    String.format("%.2f", item.amount.toDouble() / item.qty)
                } else {
                    "0.00"
                }

                printData.append("\n!NLFONT 15 15 3\n*TEXT l $unitPrice\n!NLFONT 15 15 3\n*text r ${item.qty}       ${item.amount}\n\n")
            }
        }

        // Print totals
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 15 15 3\n*TEXT l Total Taxable Amount:\n!NLFONT 15 15 3\n*text r $currency" + order.payment.subTotal + "\n")
        printData.append("*image l 370*40 path:totalTaxable\n")

        if (order.refunds.isNotEmpty()) {
            val refund = order.refunds[0]

            printData.append("!NLFONT 15 15 3\n*TEXT l Vat Refund:\n!NLFONT 15 15 3\n*text r $currency ${refund.vat}\n")
            printData.append("*image l 170*50 path:vatRefund\n")
            printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
            printData.append("!NLFONT 15 15 3\n*TEXT l Amount Refund:\n!NLFONT 15 15 3\n*text r $currency ${refund.amount}\n")
            printData.append("*image l 280*50 path:amountRefund\n")

            // Payment breakdown for refund
            printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

            refund.refundedTo.forEach { payment ->
                when (payment.refundTo.lowercase()) {

                    "card" -> {
                        if (payment.amount.toDouble() > 0) {
                            printData.append("!NLFONT 15 15 3\n*TEXT l Card:\n!NLFONT 15 15 3\n*text r $currency ${payment.amount}\n")
                        }
                    }
                    "cash" -> {
                        if (payment.amount.toDouble() > 0) {
                            printData.append("!NLFONT 15 15 3\n*TEXT l Cash:\n!NLFONT 15 15 3\n*text r $currency ${payment.amount}\n")
                        }
                    }
                    "wallet" -> {
                        if (payment.amount.toDouble() > 0) {
                            printData.append("!NLFONT 15 15 3\n*TEXT l Wallet:\n!NLFONT 15 15 3\n*text r $currency ${payment.amount}\n")
                        }
                    }
                    "credit" -> {
                        if (payment.amount.toDouble() > 0) {
                            printData.append("!NLFONT 15 15 3\n*TEXT l Credit:\n!NLFONT 15 15 3\n*text r $currency ${payment.amount}\n")
                        }
                    }
                }
            }
        }

        // Return policy
        val returnPolicy = order.location.returnPolicy
        if (returnPolicy != null) {
            if (returnPolicy.isNotEmpty()) {
                printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
                printData.append("!NLFONT 15 15 3\n*text c Return Policy\n")
                printData.append("*image l 370*40 path:returnPolicy\n")
                printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

                val returnPolicyChunks = chunkText(returnPolicy!!, 30)
                returnPolicyChunks.forEachIndexed { index, chunk ->
                    bitmaps["returnPolicy$index"] = drawArabic(chunk, "center", 450, 0)
                    printData.append("*image c 450*35 path:returnPolicy$index\n")
                }

                printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
            }
        }

        // Custom text
        val customText = order.location.customText
        if (customText != null) {
            if (customText.isNotEmpty()) {
                if (order.location.returnPolicy?.isEmpty() == true) {
                    printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
                }

                val customTextChunks = chunkText(customText, 30)
                customTextChunks.forEachIndexed { index, chunk ->
                    bitmaps["customText$index"] = drawArabic(chunk, "center", 450, 0)
                    printData.append("*image c 450*35 path:customText$index\n")
                }
            }
        }

        // Barcode and QR code
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!BARCODE 8 120 1 3\n*BARCODE c ${order.orderNum}\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // QR code
        if (order.qrCode != null) {
            printData.append("!QRCODE 300 0 3\n*QRCODE c ${order.qrCode}\n")
        }

        // Footer
        var footer = "Thank You"
        if (order.location.invoiceFooter?.isNotEmpty() == true) {
            footer = order.location.invoiceFooter.toString()
        }

        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        bitmaps["footer"] = drawArabic(footer, "center", 400, 0)
        printData.append("*image c 600*35 path:footer\n")
        printData.append("*feedline 4\n")

        return Pair(printData, bitmaps)
    }

    /**
     * Generate KOT data for Neoleap printer
     * @param order The order data
     * @param kitchenName Optional kitchen name to filter items
     * @return KOT data as a string and bitmaps
     */
    fun getKotData(order: Order, kitchenName: String?): Pair<StringBuffer, MutableMap<String, Bitmap>> {
        Log.d(TAG, "Generating KOT for order ${order._id}, kitchen: $kitchenName")
        val printData = StringBuffer()
        val bitmaps: MutableMap<String, Bitmap> = HashMap()

        // Generate KOT header
        bitmaps["locationName"] = drawArabic(order.location.name.ar, "center", 400, 0)

        printData.append("!NLFONT 15 15 3\n*text c KITCHEN ORDER TICKET\n")
        printData.append("!NLFONT 15 15 3\n*text c " + order.location.name.en + "\n")
        printData.append("*image c 600*50 path:locationName\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // Order info
        printData.append("!NLFONT 15 15 3\n*text l Order #: ${order.orderNum}\n")
        if (order.tokenNum != null && order.tokenNum.isNotEmpty()) {
            printData.append("!NLFONT 15 15 3\n*text l Token #: ${order.tokenNum}\n")
        }
        printData.append("!NLFONT 15 15 3\n*text l Date: ${order.createdAt}\n")
        printData.append("!NLFONT 15 15 3\n*text l Order Type: ${order.orderType ?: "Takeaway"}\n")

        // Table info for dine-in
        if (order.orderType == "dine-in" && order.dineInData.tableRef.isNotEmpty()) {
            printData.append("!NLFONT 15 15 3\n*text l Table: ${order.dineInData.table}\n")
            printData.append("!NLFONT 15 15 3\n*text l Guests: ${order.dineInData.noOfGuests}\n")
        }

        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // Items are already filtered by PrintController, so just use all items
        // The order object passed here contains only items relevant to this printer
        val items = order.items

        if (items.isEmpty()) {
            printData.append("!NLFONT 15 15 3\n*text c No items for ${kitchenName ?: "any kitchen"}\n")
        } else {
            // Print items
            var totalQty = 0

            items.forEach { item ->
                printData.append("!NLFONT 15 15 3\n*text l ${item.name.en}[R]${item.qty}\n")

                // Add Arabic name
                bitmaps[item.sku] = drawArabic(item.name.ar, "right", 370, -20)
                printData.append("*image r 370*40 path:${item.sku}\n")

                // Add modifiers if any
                item.modifiers?.forEach { modifier ->
                    printData.append("!NLFONT 15 15 3\n*text l + ${modifier.name}\n")
                }

                // Add note if any
                if (item.note != null && item.note.isNotEmpty()) {
                    printData.append("!NLFONT 15 15 3\n*text l Note: ${item.note}\n")
                }

                totalQty += item.qty
            }

            // Print total quantity
            printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
            printData.append("!NLFONT 15 15 3\n*text l Total QTY[R]${totalQty}\n")
            bitmaps["totalQty"] = drawArabic("الكمية الإجمالية", "left", 250, 0)
            printData.append("*image l 250*40 path:totalQty\n")
        }

        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("*feedline 4\n")

        return Pair(printData, bitmaps)
    }

    override fun getReceipt(printer: EscPosPrinter, order: Order): String {
        TODO("Not yet implemented")
    }

    override fun getRefundReceipt(escPosPrinter: EscPosPrinter, order: Order): String {
        Log.d(TAG, "Generating refund receipt template for order ${order._id}")


        val refund = order.refunds[0]
        val sb = StringBuilder()

        // Header
        sb.append(centerText(order.company.name.uppercase())).append("\n")
        sb.append(centerText(order.location.name.en)).append("\n")
        sb.append(centerText("*** REFUND RECEIPT ***")).append("\n\n")

        // Order info
        sb.append("Original Order #: ${order.orderNum}").append("\n")
        sb.append("Refund Date: ${refund.date ?: formatDate(Date())}").append("\n")
        sb.append("Refund Ref: ${refund.referenceNumber}").append("\n")
        if (refund.cashier != null) {
            sb.append("Cashier: ${refund.cashier.name}").append("\n")
        }
        sb.append("\n")

        // Refund reason
        sb.append("Reason: ${refund.reason}").append("\n\n")

        // Refunded items
        sb.append(dashedLine()).append("\n")
        sb.append(String.format("%-4s %-20s %8s %10s", "Qty", "Item", "Price", "Total")).append("\n")
        sb.append(dashedLine()).append("\n")

        for (item in refund.items) {
            sb.append(String.format("%-4d %-20s %8.2f %10.2f",
                item.qty,
                truncateText(item.nameEn, 20),
                item.amount / item.qty,
                item.amount
            )).append("\n")
        }

        sb.append(dashedLine()).append("\n\n")

        // Refund summary
        if (refund.discountAmount > 0) {
            sb.append("Discount:").append(alignRight(formatCurrency(refund.discountAmount))).append("\n")
        }

        // Add charges if any
        refund.charges.forEach { charge ->
            sb.append("${charge.name.en}:").append(alignRight(formatCurrency(charge.totalCharge))).append("\n")
        }

        sb.append("VAT:").append(alignRight(formatCurrency(refund.vat))).append("\n")
        sb.append(dashedLine()).append("\n")
        sb.append("Total Refunded:").append(alignRight(formatCurrency(refund.amount))).append("\n")
        sb.append(dashedLine()).append("\n\n")

        // Refund method
        sb.append("Refunded To:").append("\n")
        refund.refundedTo.forEach { refundPayment ->
            sb.append("${refundPayment.refundTo}: ${formatCurrency(refundPayment.amount)}").append("\n")
        }
        sb.append("\n")

        // Footer
        sb.append(centerText("Thank you for your understanding")).append("\n")

        return sb.toString()
    }


    override fun getKot(escPosPrinter: EscPosPrinter, order: Order, kitchenName: String?): String {
        Log.d(TAG, "Generating KOT template for order ${order._id}")

        val sb = StringBuilder()

        // Header
        sb.append(centerText("KITCHEN ORDER TICKET")).append("\n")
        sb.append(centerText(order.location.name.en)).append("\n\n")

        // Order info
        sb.append("Order #: ${order.orderNum}").append("\n")
        if (order.tokenNum != null) {
            sb.append("Token #: ${order.tokenNum}").append("\n")
        }
        sb.append("Date: ${formatDate(order.createdAt)}").append("\n")
        sb.append("Order Type: ${order.orderType ?: "Takeaway"}").append("\n")

        // Table info for dine-in
        if (order.orderType == "dine-in" && order.dineInData.tableRef.isNotEmpty()) {
            sb.append("Table: ${order.dineInData.table}").append("\n")
            sb.append("Guests: ${order.dineInData.noOfGuests}").append("\n")
        }
        sb.append("\n")

        // Items are already filtered by PrintController, so just use all items
        // The order object passed here contains only items relevant to this printer
        val items = order.items

        if (items.isEmpty()) {
            sb.append("No items for ${kitchenName ?: "any kitchen"}").append("\n")
            return sb.toString()
        }

        // Items
        sb.append(dashedLine()).append("\n")
        sb.append(String.format("%-4s %-30s", "Qty", "Item")).append("\n")
        sb.append(dashedLine()).append("\n")

        for (item in items) {
            sb.append(String.format("%-4d %-30s",
                item.qty,
                truncateText(item.name.en, 30)
            )).append("\n")

            // Add modifiers if any
            item.modifiers?.forEach { modifier ->
                sb.append(String.format("     %-29s",
                    truncateText("+ ${modifier.name}", 29)
                )).append("\n")
            }

            // Add note if any
            if (item.note.isNotEmpty()) {
                sb.append(String.format("     Note: %-24s",
                    truncateText(item.note, 24)
                )).append("\n")
            }
        }

        sb.append(dashedLine()).append("\n")

        // Special instructions
        if (!order.specialInstructions.isNullOrEmpty()) {
            sb.append("\nSpecial Instructions:").append("\n")
            sb.append(order.specialInstructions).append("\n")
        }

        return sb.toString()
    }

    override fun getProforma(escPosPrinter: EscPosPrinter,order: Order): String {
        Log.d(TAG, "Generating proforma template for order ${order._id}")

        val sb = StringBuilder()

        // Header
        sb.append(centerText(order.company.name.uppercase())).append("\n")
        sb.append(centerText(order.location.name.en)).append("\n")
        sb.append(centerText("PROFORMA INVOICE")).append("\n\n")

        // Order info
        sb.append("Order #: ${order.orderNum}").append("\n")
        sb.append("Date: ${formatDate(order.createdAt)}").append("\n")
        if (order.cashier != null) {
            sb.append("Prepared By: ${order.cashier.name}").append("\n")
        }
        sb.append("\n")

        // Customer info if available
        order.customer?.let {
            sb.append("Customer: ${it.name}").append("\n")
            if (it.phone != null) {
                sb.append("Phone: ${it.phone}").append("\n")
            }
            if (it.vat.isNotEmpty()) {
                sb.append("VAT #: ${it.vat}").append("\n")
            }
            sb.append("\n")
        }

        // Items
        sb.append(dashedLine()).append("\n")
        sb.append(String.format("%-4s %-20s %8s %10s", "Qty", "Item", "Price", "Total")).append("\n")
        sb.append(dashedLine()).append("\n")

        for (item in order.items) {
            sb.append(String.format("%-4d %-20s %8.2f %10.2f",
                item.qty,
                truncateText(item.name.en, 20),
                item.sellingPrice,
                item.total
            )).append("\n")

            // Add modifiers if any
            item.modifiers?.forEach { modifier ->
                sb.append(String.format("     %-19s %8.2f %10.2f",
                    truncateText("+ ${modifier.name}", 19),
                    modifier.subTotal,
                    modifier.total
                )).append("\n")
            }
        }

        sb.append(dashedLine()).append("\n\n")

        // Payment summary
        sb.append("Subtotal:").append(alignRight(formatCurrency(order.payment.subTotal))).append("\n")

        if (order.payment.discount > 0) {
            sb.append("Discount:").append(alignRight(formatCurrency(order.payment.discount))).append("\n")
        }

        // Add charges if any
        order.payment.charges.forEach { charge ->
            sb.append("${charge.name.en}:").append(alignRight(formatCurrency(charge.total))).append("\n")
        }

        sb.append("VAT (${order.payment.vatPercentage}%):").append(alignRight(formatCurrency(order.payment.vat))).append("\n")
        sb.append(dashedLine()).append("\n")
        sb.append("Total:").append(alignRight(formatCurrency(order.payment.total))).append("\n")
        sb.append(dashedLine()).append("\n\n")

        // Footer
        sb.append(centerText("This is not a tax invoice")).append("\n")
        sb.append(centerText("Valid for ${getValidityPeriod()} days")).append("\n")

        return sb.toString()
    }



    private fun centerText(text: String, width: Int = 40): String {
        if (text.length >= width) return text
        val padding = (width - text.length) / 2
        return " ".repeat(padding) + text
    }

    private fun alignRight(text: String, width: Int = 12): String {
        if (text.length >= width) return text
        val padding = width - text.length
        return " ".repeat(padding) + text
    }

    private fun truncateText(text: String, maxLength: Int): String {
        return if (text.length <= maxLength) text else text.substring(0, maxLength - 3) + "..."
    }

    private fun dashedLine(width: Int = 40): String {
        return "-".repeat(width)
    }

    private fun formatDate(date: Date): String {
        val sdf = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
        return sdf.format(date)
    }

    private fun formatCurrency(amount: Double): String {
        return String.format("%.2f", amount)
    }

    override fun getTransactionReceipt(printer: EscPosPrinter, transactionData: Map<String, Any>): String {
        val printData = StringBuffer()
        val bitmaps = HashMap<String, Bitmap>()

        // Header Section
        printData.append("!NLFONT 15 15 3\n*text c ${transactionData["userName"]}\n")
        printData.append("!NLFONT 15 15 3\n*text c ${transactionData["locationName"]}\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // Date Range
        printData.append("!NLFONT 15 15 3\n*text l Sales Summary\n")
        printData.append("!NLFONT 12 12 3\n*text l ${transactionData["startDate"]} to ${transactionData["endDate"]}\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // Sales Details
        printData.append("!NLFONT 15 15 3\n*text c Sales Details\n")
        val totalRevenue = transactionData["totalRevenue"] as? Number ?: 0.0
        val netSales = transactionData["netSales"] as? Number ?: 0.0
        val totalVat = transactionData["totalVat"] as? Number ?: 0.0
        val discount = transactionData["discount"] as? Number ?: 0.0

        printData.append("!NLFONT 12 12 3\n*text l Total Sales: SAR ${String.format("%.2f", totalRevenue)}\n")
        printData.append("!NLFONT 12 12 3\n*text l Net Sales: SAR ${String.format("%.2f", netSales)}\n")
        printData.append("!NLFONT 12 12 3\n*text l Total VAT: SAR ${String.format("%.2f", totalVat)}\n")
        printData.append("!NLFONT 12 12 3\n*text l Discounts: SAR ${String.format("%.2f", discount)}\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // Transaction Details
        printData.append("!NLFONT 15 15 3\n*text c Transaction Details\n")

        // Process transaction types
        val txnStats = transactionData["txnStats"] as? List<Map<String, Any>> ?: emptyList()
        val paymentTypes = transactionData["paymentTypes"] as? List<Map<String, Any>> ?: emptyList()

        for (paymentType in paymentTypes) {
            val name = paymentType["name"] as? String ?: continue
            val status = paymentType["status"] as? Boolean ?: false
            if (!status) continue

            val txnData = txnStats.find { it["paymentName"] as? String == name }
            val amount = txnData?.get("balanceAmount") as? Number ?: 0.0
            val count = when (val noOfPayments = txnData?.get("noOfPayments")) {
                is Number -> noOfPayments.toInt()
                is String -> noOfPayments.toIntOrNull() ?: 0
                else -> 0
            }

            printData.append("!NLFONT 12 12 3\n*text l $name Transaction: SAR ${String.format("%.2f", amount)}, Count: $count\n")
        }

        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")

        // Refund Details
        printData.append("!NLFONT 15 15 3\n*text c Refund Details\n")

        // Process refunds
        val refundTypes = listOf("card", "cash", "wallet", "credit", "nearpay", "stcpay")
        for (type in refundTypes) {
            val refundAmount = transactionData["refundIn${type.capitalize()}"] as? String ?: "0.00"
            val refundCount = transactionData["refundCountIn${type.capitalize()}"] as? Number ?: 0
            if (refundAmount != "0.00" || refundCount != 0) {
                printData.append("!NLFONT 12 12 3\n*text l ${type.capitalize()} Refund: SAR $refundAmount, Count: $refundCount\n")
            }
        }

        // Footer
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 12 12 3\n*text l Printed on: ${transactionData["printedOn"]}\n")
        printData.append("!NLFONT 12 12 3\n*text l Printed by: ${transactionData["printedBy"]}\n")
        printData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
        printData.append("!NLFONT 12 12 3\n*text c ${transactionData["footer"]}\n")
        printData.append("!NLFONT 12 12 3\n*text c Powered by Tijarah360\n")
        printData.append("*feedline 4\n")

        return printData.toString()
    }

    private fun getValidityPeriod(): Int {
        return 30
    }
}
