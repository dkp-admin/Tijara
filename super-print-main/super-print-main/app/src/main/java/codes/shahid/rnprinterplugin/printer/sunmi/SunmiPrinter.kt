package codes.shahid.rnprinterplugin.printer.sunmi

import android.content.Context
import android.nfc.Tag
import android.os.RemoteException
import android.util.Log
import com.google.gson.Gson
import com.sunmi.peripheral.printer.InnerPrinterCallback
import com.sunmi.peripheral.printer.InnerPrinterManager
import com.sunmi.peripheral.printer.InnerResultCallback
import com.sunmi.peripheral.printer.SunmiPrinterService
import codes.shahid.rnprinterplugin.printer.BasePrinter
import codes.shahid.rnprinterplugin.types.Order
import codes.shahid.rnprinterplugin.types.Printer
import codes.shahid.rnprinterplugin.types.PrinterConnectionParams

class SunmiPrinter(
    private val context: Context
) : BasePrinter {

    companion object {
        private const val TAG = "SunmiPrinter"
    }

    private var isInitialized = false
    private var isConnected = false
    private val printerName = "Sunmi Printer"
    private var mPrinterService: SunmiPrinterService? = null


    override fun initialize() {
        Log.d(TAG, "Initializing $printerName")
        // Sunmi-specific initialization would go here
        val innerPrinterCallback = object : InnerPrinterCallback() {
            override fun onConnected(service: SunmiPrinterService) {
                Log.d("SUNMI","Sunmit Printer Connected")
                mPrinterService = service
            }
            override fun onDisconnected() {
                Log.d("SUNMI","Sunmit Printer Disconnected")
                mPrinterService=null
            }
        }
        val result: Boolean = InnerPrinterManager.getInstance().bindService(context, innerPrinterCallback)
        isInitialized = true
    }

    override fun connect(id: PrinterConnectionParams) {
        if (!isInitialized) {
            Log.e(TAG, "Cannot connect: Printer not initialized")
            throw IllegalStateException("Printer must be initialized before connecting")
        }

        Log.d(TAG, "Connecting to $printerName")
        // Sunmi printers are built-in, so no explicit connection is needed
        isConnected = true
    }

    override fun printTransactionReceipt(transactionData: Map<String, Any>) {
        checkConnection()
        Log.d(TAG, "Printing transaction report on $printerName")

        try {
            // Create callback for all print operations
            val callback = object : InnerResultCallback() {
                @Throws(RemoteException::class)
                override fun onRunResult(isSuccess: Boolean) {
                    if (isSuccess) {
                        Log.d(TAG, "Print operation successful")
                    } else {
                        Log.e(TAG, "Print operation failed")
                    }
                }

                @Throws(RemoteException::class)
                override fun onReturnString(result: String) {
                    Log.d(TAG, "Print result: $result")
                }

                @Throws(RemoteException::class)
                override fun onRaiseException(code: Int, msg: String) {
                    Log.e(TAG, "Print exception: $code - $msg")
                }

                @Throws(RemoteException::class)
                override fun onPrintResult(code: Int, msg: String) {
                    Log.d(TAG, "Print result: $code - $msg")
                }
            }

            // Header Section
            mPrinterService?.setFontSize(24f, callback)
            mPrinterService?.setAlignment(1, callback) // Center alignment
            mPrinterService?.printText("${transactionData["userName"]}\n", callback)
            mPrinterService?.printText("${transactionData["locationName"]}\n", callback)
            mPrinterService?.printText("--------------------------------\n", callback)

            // Date Range
            mPrinterService?.setFontSize(20f, callback)
            mPrinterService?.setAlignment(0, callback) // Left alignment
            mPrinterService?.printText("Sales Summary\n", callback)
            mPrinterService?.printText("${transactionData["startDate"]} to ${transactionData["endDate"]}\n", callback)
            mPrinterService?.printText("--------------------------------\n", callback)

            // Sales Details
            mPrinterService?.setFontSize(22f, callback)
            mPrinterService?.setAlignment(1, callback) // Center alignment
            mPrinterService?.printText("Sales Details\n", callback)
            mPrinterService?.setFontSize(20f, callback)
            mPrinterService?.setAlignment(0, callback) // Left alignment

            val totalRevenue = transactionData["totalRevenue"] as? Number ?: 0.0
            val netSales = transactionData["netSales"] as? Number ?: 0.0
            val totalVat = transactionData["totalVat"] as? Number ?: 0.0
            val discount = transactionData["discount"] as? Number ?: 0.0

            mPrinterService?.printText(constructString("Total Sales", "SAR ${String.format("%.2f", totalRevenue)}\n"), callback)
            mPrinterService?.printText(constructString("Net Sales", "SAR ${String.format("%.2f", netSales)}\n"), callback)
            mPrinterService?.printText(constructString("Total VAT", "SAR ${String.format("%.2f", totalVat)}\n"), callback)
            mPrinterService?.printText(constructString("Discounts", "SAR ${String.format("%.2f", discount)}\n"), callback)
            mPrinterService?.printText("--------------------------------\n", callback)

            // Transaction Details
            mPrinterService?.setFontSize(22f, callback)
            mPrinterService?.setAlignment(1, callback) // Center alignment
            mPrinterService?.printText("Transaction Details\n", callback)
            mPrinterService?.setFontSize(20f, callback)
            mPrinterService?.setAlignment(0, callback) // Left alignment

            // Process transaction types
            val txnStats = transactionData["txnStats"] as? List<Map<String, Any>> ?: emptyList()
            val paymentTypes = transactionData["paymentTypes"] as? List<Map<String, Any>> ?: emptyList()

            for (paymentType in paymentTypes) {
                val name = paymentType["name"] as? String ?: continue
                val status = paymentType["status"] as? Boolean ?: false
                if (!status) continue

                val txnData = txnStats.find { it["paymentName"] as? String == name }
                val amount = txnData?.get("balanceAmount") as? Number ?: 0.0
                val count = txnData?.get("noOfPayments") as? Number ?: 0

                mPrinterService?.printText(constructString(
                    "$name Transaction",
                    "SAR ${String.format("%.2f", amount)}, Count: $count\n"
                ), callback)
            }

            mPrinterService?.printText("--------------------------------\n", callback)

            // Refund Details
            mPrinterService?.setFontSize(22f, callback)
            mPrinterService?.setAlignment(1, callback) // Center alignment
            mPrinterService?.printText("Refund Details\n", callback)
            mPrinterService?.setFontSize(20f, callback)
            mPrinterService?.setAlignment(0, callback) // Left alignment

            // Process refunds
            val refundTypes = listOf("card", "cash", "wallet", "credit", "nearpay", "stcpay")
            for (type in refundTypes) {
                val refundAmount = transactionData["refundIn${type.capitalize()}"] as? String ?: "0.00"
                val refundCount = transactionData["refundCountIn${type.capitalize()}"] as? Number ?: 0
                if (refundAmount != "0.00" || refundCount != 0) {
                    mPrinterService?.printText(constructString(
                        "${type.capitalize()} Refund",
                        "SAR $refundAmount, Count: $refundCount\n"
                    ), callback)
                }
            }

            // Footer
            mPrinterService?.printText("--------------------------------\n", callback)
            mPrinterService?.setAlignment(0, callback) // Left alignment
            mPrinterService?.printText(constructString("Printed on", "${transactionData["printedOn"]}\n"), callback)
            mPrinterService?.printText(constructString("Printed by", "${transactionData["printedBy"]}\n"), callback)
            mPrinterService?.printText("--------------------------------\n", callback)
            mPrinterService?.setAlignment(1, callback) // Center alignment
            mPrinterService?.printText("${transactionData["footer"]}\n", callback)
            mPrinterService?.printText("Powered by Tijarah360\n", callback)
            mPrinterService?.printText("\n\n\n\n", callback)

            // Cut paper if supported
            mPrinterService?.cutPaper(callback)

        } catch (e: Exception) {
            Log.e(TAG, "Error printing transaction report: ${e.message}", e)
            throw e
        }
    }

    override fun printReceipt(order: Order) {
        checkConnection()
        Log.d(TAG, "Printing receipt on $printerName for order ${order._id}")

        try {
            val currency = order.currency ?: "SAR"

            // Create callback for all print operations
            val callback = object : InnerResultCallback() {
                @Throws(RemoteException::class)
                override fun onRunResult(isSuccess: Boolean) {
                    if (isSuccess) {
                        Log.d(TAG, "Print operation successful")
                    } else {
                        Log.e(TAG, "Print operation failed")
                    }
                }

                @Throws(RemoteException::class)
                override fun onReturnString(result: String) {
                    Log.d(TAG, "Print result: $result")
                }

                @Throws(RemoteException::class)
                override fun onRaiseException(code: Int, msg: String) {
                    Log.e(TAG, "Print exception: $code - $msg")
                }

                @Throws(RemoteException::class)
                override fun onPrintResult(code: Int, msg: String) {
                    Log.d(TAG, "Print result: $code - $msg")
                }
            }

            // Header Section
            mPrinterService?.setFontSize(22f, callback)
            mPrinterService?.setAlignment(1, callback) // Center alignment

            var headerContent = "${order.location.name.en}\n${order.location.name.ar}\n"

            // VAT, Phone, and Address
            if (order.location.vat.isNotEmpty()) {
                headerContent += "VAT No. ${order.location.vat}\n"
            }
            headerContent += "PH No. ${order.location.phone}\n${order.location.address}\n"

            mPrinterService?.printText(headerContent, callback)

            // Receipt Content
            mPrinterService?.setAlignment(0, callback) // Left alignment

            var receiptContent = "----------------------------------\n"

            // Invoice Details
            receiptContent += "Invoice No.\nفاتورة\n#${order.orderNum}\nDate & Time\nالتاريخ و الوقت\n           ${order.createdAt}\n"

            // Customer Details
            if (order.customer != null && order.customer.name.isNotEmpty()) {
                receiptContent += "${constructString("Customer", order.customer.name.trim())}\nالعميل\n"
            }
            if (order.customer != null && order.customer.vat.isNotEmpty()) {
                receiptContent += "${constructString("Customer VAT", order.customer.vat)}\nالعميل VAT\n"
            }

            // Token Number and Order Type
            if (order.tokenNum != null || order.orderType != null) {
                receiptContent += "----------------------------------\n"
                if (order.tokenNum != null && order.tokenNum.isNotEmpty()) {
                    receiptContent += "            ${order.tokenNum}\n"
                }
                if (order.orderType != null && order.orderType.isNotEmpty()) {
                    receiptContent += "            ${order.orderType}\n"
                }
            }

            // Items Header
            receiptContent += "----------------------------------\n" +
                    "       Simplified Tax Invoice\n" +
                    "فاتورة ضريبية مبسطة         \n" +
                    "----------------------------------\n" +
                    "Description      فاتورة ضريبية مبسطة\n" +
                    "Unit Price          Qty      Total\n" +
                    "إجمالي      الكمية          سعر الوحدة\n" +
                    "----------------------------------\n"

            // Items
            order.items.forEach { item ->
                receiptContent += "${item.name.en}\n${item.name.ar}\n"

                // Add modifiers if any
                item.modifiers?.forEach { modifier ->
                    receiptContent += "${modifier.name}\n"
                }

                receiptContent += "${item.sellingPrice}               ${item.qty}      ${item.total}\n"
            }

            receiptContent += "----------------------------------\n"

            // Discounts and Totals
            if (order.payment.discount > 0) {
                receiptContent += "${constructString("Items Total", "$currency ${order.payment.subTotalWithoutDiscount}")}\n"
                receiptContent += "إجمالي العناصر\n"
                receiptContent += "${constructString("Total Discount", "$currency ${order.payment.discount}")}\n"
                receiptContent += "إجمالي الخصم\n"
                receiptContent += "----------------------------------\n"
            }

            receiptContent += "${constructString("Total Taxable Amount", "$currency ${order.payment.subTotal}")}\n"
            receiptContent += "إجمالي المبلغ الخاضع للضريبة\n"

            // Charges
            order.payment.charges.forEach { charge ->
                receiptContent += "${constructString(charge.name.en, "$currency ${charge.total}")}\n"
                receiptContent += "${charge.name.ar}\n"
            }

            receiptContent += "${constructString("Total Vat", "$currency ${order.payment.vat}")}\n" +
                    "إجمالي ضريبة القيمة المضافة\n" +
                    "----------------------------------\n" +
                    "${constructString("Total Amount", "$currency ${order.payment.total}")}\n" +
                    "المبلغ الإجمالي\n" +
                    "----------------------------------\n"

            // Payment Breakup
            order.payment.breakup.forEach { breakup ->
                receiptContent += "${constructString(breakup.providerName, "$currency ${breakup.total}")}\n"
            }

            if (order.payment.breakup.isNotEmpty()) {
                receiptContent += "----------------------------------\n"
            }

            // Special Instructions
            if (order.specialInstructions != null && order.specialInstructions.isNotEmpty()) {
                receiptContent += "----------------------------------\n" +
                        "          Special Instructions\n" +
                        "            تعليمات خاصة\n" +
                        "${order.specialInstructions}\n" +
                        "----------------------------------\n"
            }

            // Return Policy
            if (order.location.returnPolicy?.isNotEmpty() == true) {
                receiptContent += "Return Policy\n${order.location.returnPolicy}\n----------------------------------\n"
            }

            // Custom Text
            if (order.location.customText?.isNotEmpty() == true) {
                receiptContent += "${order.location.customText}\n----------------------------------\n"
            }

            mPrinterService?.printText(receiptContent, callback)

            // Footer
            mPrinterService?.setAlignment(1, callback) // Center alignment
            mPrinterService?.printText("\n", callback)

            // QR Code
            if (order.qrCode != null) {
                mPrinterService?.printQRCode(order.qrCode, 4, 3, callback)
                mPrinterService?.printText("\n", callback)
            }

            // Barcode
            mPrinterService?.printBarCode(order.orderNum, 8, 100, 200, 2, callback)

            // Footer Text
            var footerContent = if (order.location.invoiceFooter?.isNotEmpty() == true) {
                "----------------------------------\n${order.location.invoiceFooter}\n"
            } else {
                "----------------------------------\nThank You\n"
            }
            footerContent += "Powered by Tijarah360\n"

            mPrinterService?.printText(footerContent, callback)
            mPrinterService?.printText("\n\n\n\n", callback)

            // Cut paper if supported
            mPrinterService?.cutPaper(callback)

        } catch (e: Exception) {
            Log.e(TAG, "Error printing receipt: ${e.message}", e)
        }
    }

    override fun printRefundReceipt(order: Order) {
        checkConnection()
        Log.d(TAG, "Printing refund receipt on $printerName for order ${order._id}")

        try {
            val currency = order.currency ?: "SAR"

            // Create callback for all print operations
            val callback = object : InnerResultCallback() {
                @Throws(RemoteException::class)
                override fun onRunResult(isSuccess: Boolean) {
                    if (isSuccess) {
                        Log.d(TAG, "Print operation successful")
                    } else {
                        Log.e(TAG, "Print operation failed")
                    }
                }

                @Throws(RemoteException::class)
                override fun onReturnString(result: String) {
                    Log.d(TAG, "Print result: $result")
                }

                @Throws(RemoteException::class)
                override fun onRaiseException(code: Int, msg: String) {
                    Log.e(TAG, "Print exception: $code - $msg")
                }

                @Throws(RemoteException::class)
                override fun onPrintResult(code: Int, msg: String) {
                    Log.d(TAG, "Print result: $code - $msg")
                }
            }

            // Header Section
            mPrinterService?.setFontSize(22f, callback)
            mPrinterService?.setAlignment(1, callback) // Center alignment

            var headerContent = "${order.location.name.en}\n${order.location.name.ar}\n"

            // VAT, Phone, and Address
            if (order.location.vat.isNotEmpty()) {
                headerContent += "VAT No. ${order.location.vat}\n"
            }
            headerContent += "PH No. ${order.location.phone}\n${order.location.address}\n"

            mPrinterService?.printText(headerContent, callback)

            // Receipt Content
            mPrinterService?.setAlignment(0, callback) // Left alignment

            var receiptContent = "----------------------------------\n"

            // Invoice Details
            receiptContent += "Invoice Reference No.\nفاتورة\n#${order.orderNum}\n"

            // Refund Receipt Number
            val refundReceiptNo = if (order.refunds.isNotEmpty() && order.refunds[0].referenceNumber.isNotEmpty()) {
                order.refunds[0].referenceNumber
            } else {
                "R-" + order.orderNum
            }

            receiptContent += "Refund Receipt NO.\nرقم إيصال الإسترجاع\n#$refundReceiptNo\n"
            receiptContent += "Date & Time\nالتاريخ و الوقت\n           ${order.createdAt}\n"

            // Customer Details
            if (order.customer != null && order.customer.name.isNotEmpty()) {
                receiptContent += "${constructString("Customer", order.customer.name.trim())}\nالعميل\n"
            }
            if (order.customer != null && order.customer.vat.isNotEmpty()) {
                receiptContent += "${constructString("Customer VAT", order.customer.vat)}\nالعميل VAT\n"
            }

            // Token Number and Order Type
            if (order.tokenNum != null || order.orderType != null) {
                receiptContent += "----------------------------------\n"
                if (order.tokenNum != null && order.tokenNum.isNotEmpty()) {
                    receiptContent += "            ${order.tokenNum}\n"
                }
                if (order.orderType != null && order.orderType.isNotEmpty()) {
                    receiptContent += "            ${order.orderType}\n"
                }
            }

            // Items Header
            receiptContent += "----------------------------------\n" +
                    "    Notice Creditor / Refund Receipt\n" +
                    "إشعار الدائن/إيصال الاسترداد         \n" +
                    "----------------------------------\n" +
                    "Description      وصف\n" +
                    "Unit Price          Qty      Total\n" +
                    "إجمالي      الكمية          سعر الوحدة\n" +
                    "----------------------------------\n"

            // Refunded Items
            if (order.refunds.isNotEmpty()) {
                order.refunds[0].items.forEach { item ->
                    receiptContent += "${item.nameEn}\n${item.nameAr}\n"

                    val unitPrice = if (item.qty > 0) {
                        String.format("%.2f", item.amount.toDouble() / item.qty)
                    } else {
                        "0.00"
                    }

                    receiptContent += "$unitPrice               ${item.qty}      ${item.amount}\n"
                }
            }

            receiptContent += "----------------------------------\n"

            // Totals
            receiptContent += "${constructString("Total Taxable Amount", "$currency ${order.payment.subTotal}")}\n"
            receiptContent += "إجمالي المبلغ الخاضع للضريبة\n"

            // Refund details
            if (order.refunds.isNotEmpty()) {
                val refund = order.refunds[0]

                receiptContent += "${constructString("Vat Refund", "$currency ${refund.vat}")}\n"
                receiptContent += "استرداد\n"
                receiptContent += "----------------------------------\n"
                receiptContent += "${constructString("Amount Refund", "$currency ${refund.amount}")}\n"
                receiptContent += "المبلغ المسترد\n"
                receiptContent += "----------------------------------\n"

                // Payment breakdown for refund
                refund.refundedTo.forEach { payment ->
                    when (payment.refundTo.lowercase()) {
                        "card" -> {
                            if (payment.amount.toDouble() > 0) {
                                receiptContent += "${constructString("Card", "$currency ${payment.amount}")}\n"
                            }
                        }
                        "cash" -> {
                            if (payment.amount.toDouble() > 0) {
                                receiptContent += "${constructString("Cash", "$currency ${payment.amount}")}\n"
                            }
                        }
                        "wallet" -> {
                            if (payment.amount.toDouble() > 0) {
                                receiptContent += "${constructString("Wallet", "$currency ${payment.amount}")}\n"
                            }
                        }
                        "credit" -> {
                            if (payment.amount.toDouble() > 0) {
                                receiptContent += "${constructString("Credit", "$currency ${payment.amount}")}\n"
                            }
                        }
                    }
                }

                receiptContent += "----------------------------------\n"
            }

            // Return Policy
            if (order.location.returnPolicy?.isNotEmpty() == true) {
                receiptContent += "Return Policy\n${order.location.returnPolicy}\n----------------------------------\n"
            }

            // Custom Text
            if (order.location.customText?.isNotEmpty() == true) {
                receiptContent += "${order.location.customText}\n----------------------------------\n"
            }

            mPrinterService?.printText(receiptContent, callback)

            // Footer
            mPrinterService?.setAlignment(1, callback) // Center alignment
            mPrinterService?.printText("\n", callback)

            // QR Code
            if (order.qrCode != null) {
                mPrinterService?.printQRCode(order.qrCode, 4, 3, callback)
                mPrinterService?.printText("\n", callback)
            }

            // Barcode
            mPrinterService?.printBarCode(order.orderNum, 8, 100, 200, 2, callback)

            // Footer Text
            var footerContent = if (order.location.invoiceFooter?.isNotEmpty() == true) {
                "----------------------------------\n${order.location.invoiceFooter}\n"
            } else {
                "----------------------------------\nThank You\n"
            }
            footerContent += "Powered by Tijarah360\n"

            mPrinterService?.printText(footerContent, callback)
            mPrinterService?.printText("\n\n\n\n", callback)

            // Cut paper if supported
            mPrinterService?.cutPaper(callback)

        } catch (e: Exception) {
            Log.e(TAG, "Error printing refund receipt: ${e.message}", e)
        }
    }


    override fun printKot(order: Order, kitchenName: String?) {
        checkConnection()
        Log.d(TAG, "Printing KOT on $printerName for order ${order._id}, kitchen: $kitchenName")

        try {
            val callback = object : InnerResultCallback() {
                @Throws(RemoteException::class)
                override fun onRunResult(isSuccess: Boolean) {
                    if (isSuccess) {
                        Log.d(TAG, "Print operation successful")
                    } else {
                        Log.e(TAG, "Print operation failed")
                    }
                }

                @Throws(RemoteException::class)
                override fun onReturnString(result: String) {
                    Log.d(TAG, "Print result: $result")
                }

                @Throws(RemoteException::class)
                override fun onRaiseException(code: Int, msg: String) {
                    Log.e(TAG, "Print exception: $code - $msg")
                }

                @Throws(RemoteException::class)
                override fun onPrintResult(code: Int, msg: String) {
                    Log.d(TAG, "Print result: $code - $msg")
                }
            }

            // Header Section
            mPrinterService?.setFontSize(22f, callback)
            mPrinterService?.setAlignment(1, callback) // Center alignment

            mPrinterService?.printText("KITCHEN ORDER TICKET\n", callback)
            mPrinterService?.printText("${order.location.name.en}\n${order.location.name.ar}\n", callback)
            mPrinterService?.printText("----------------------------------\n", callback)

            // KOT Content
            mPrinterService?.setAlignment(0, callback) // Left alignment

            var kotContent = ""

            // Order info
            kotContent += "Order #: ${order.orderNum}\n"
            if (order.tokenNum != null && order.tokenNum.isNotEmpty()) {
                kotContent += "Token #: ${order.tokenNum}\n"
            }
            kotContent += "Date: ${order.createdAt}\n"
            kotContent += "Order Type: ${order.orderType ?: "Takeaway"}\n"

            // Table info for dine-in
            if (order.orderType == "dine-in" && order.dineInData != null) {
                kotContent += "Table: ${order.dineInData.table}\n"
                kotContent += "Guests: ${order.dineInData.noOfGuests}\n"
            }

            kotContent += "----------------------------------\n"

            // Filter items by kitchen if specified
            val items =  order.items


            if (items.isEmpty()) {
                kotContent += "No items for ${kitchenName ?: "any kitchen"}\n"
            } else {
                // Print items
                var totalQty = 0

                items.forEach { item ->
                    kotContent += "${item.name.en}[R]${item.qty}\n"
                    kotContent += "${item.name.ar}\n"

                    // Add modifiers if any
                    item.modifiers?.forEach { modifier ->
                        kotContent += "+ ${modifier.name}\n"
                    }

                    // Add note if any
                    if (item.note != null && item.note.isNotEmpty()) {
                        kotContent += "Note: ${item.note}\n"
                    }

                    totalQty += item.qty
                }

                // Print total quantity
                kotContent += "----------------------------------\n"
                kotContent += "Total QTY[R]${totalQty}\n"
                kotContent += "الكمية الإجمالية\n"
            }

            kotContent += "----------------------------------\n"

            mPrinterService?.printText(kotContent, callback)
            mPrinterService?.printText("\n\n\n\n", callback)

            // Cut paper if supported
            mPrinterService?.cutPaper(callback)

        } catch (e: Exception) {
            Log.e(TAG, "Error printing KOT: ${e.message}", e)
        }
    }


    override fun printProforma(order: Order) {
        checkConnection()
        Log.d(TAG, "Printing proforma on $printerName for order ${order._id}")

        try {
            val currency = order.currency ?: "SAR"

            // Create callback for all print operations
            val callback = object : InnerResultCallback() {
                @Throws(RemoteException::class)
                override fun onRunResult(isSuccess: Boolean) {
                    if (isSuccess) {
                        Log.d(TAG, "Print operation successful")
                    } else {
                        Log.e(TAG, "Print operation failed")
                    }
                }

                @Throws(RemoteException::class)
                override fun onReturnString(result: String) {
                    Log.d(TAG, "Print result: $result")
                }

                @Throws(RemoteException::class)
                override fun onRaiseException(code: Int, msg: String) {
                    Log.e(TAG, "Print exception: $code - $msg")
                }

                @Throws(RemoteException::class)
                override fun onPrintResult(code: Int, msg: String) {
                    Log.d(TAG, "Print result: $code - $msg")
                }
            }

            // Header Section
            mPrinterService?.setFontSize(22f, callback)
            mPrinterService?.setAlignment(1, callback) // Center alignment

            var headerContent = "${order.location.name.en}\n${order.location.name.ar}\n"

            // VAT, Phone, and Address
            if (order.location.vat.isNotEmpty()) {
                headerContent += "VAT No. ${order.location.vat}\n"
            }
            headerContent += "PH No. ${order.location.phone}\n${order.location.address}\n"

            mPrinterService?.printText(headerContent, callback)

            // Receipt Content
            mPrinterService?.setAlignment(0, callback) // Left alignment

            var receiptContent = "----------------------------------\n"

            // Proforma Header
            receiptContent += "*** PROFORMA INVOICE ***\n"
            receiptContent += "----------------------------------\n"

            // Invoice Details
            receiptContent += "Invoice No.\nفاتورة\n#${order.orderNum}\nDate & Time\nالتاريخ و الوقت\n           ${order.createdAt}\n"

            // Customer Details
            if (order.customer != null && order.customer.name.isNotEmpty()) {
                receiptContent += "${constructString("Customer", order.customer.name.trim())}\nالعميل\n"
            }
            if (order.customer != null && order.customer.vat.isNotEmpty()) {
                receiptContent += "${constructString("Customer VAT", order.customer.vat)}\nالعميل VAT\n"
            }

            // Token Number and Order Type
            if (order.tokenNum != null || order.orderType != null) {
                receiptContent += "----------------------------------\n"
                if (order.tokenNum != null && order.tokenNum.isNotEmpty()) {
                    receiptContent += "            ${order.tokenNum}\n"
                }
                if (order.orderType != null && order.orderType.isNotEmpty()) {
                    receiptContent += "            ${order.orderType}\n"
                }
            }

            // Items Header
            receiptContent += "----------------------------------\n" +
                    "       Simplified Tax Invoice\n" +
                    "فاتورة ضريبية مبسطة         \n" +
                    "----------------------------------\n" +
                    "Description      فاتورة ضريبية مبسطة\n" +
                    "Unit Price          Qty      Total\n" +
                    "إجمالي      الكمية          سعر الوحدة\n" +
                    "----------------------------------\n"

            // Items
            order.items.forEach { item ->
                receiptContent += "${item.name.en}\n${item.name.ar}\n"

                // Add modifiers if any
                item.modifiers?.forEach { modifier ->
                    receiptContent += "${modifier.name}\n"
                }

                receiptContent += "${item.sellingPrice}               ${item.qty}      ${item.total}\n"
            }

            receiptContent += "----------------------------------\n"

            // Discounts and Totals
            if (order.payment.discount > 0) {
                receiptContent += "${constructString("Items Total", "$currency ${order.payment.subTotalWithoutDiscount}")}\n"
                receiptContent += "إجمالي العناصر\n"
                receiptContent += "${constructString("Total Discount", "$currency ${order.payment.discount}")}\n"
                receiptContent += "إجمالي الخصم\n"
                receiptContent += "----------------------------------\n"
            }

            receiptContent += "${constructString("Total Taxable Amount", "$currency ${order.payment.subTotal}")}\n"
            receiptContent += "إجمالي المبلغ الخاضع للضريبة\n"

            // Charges
            order.payment.charges.forEach { charge ->
                receiptContent += "${constructString(charge.name.en, "$currency ${charge.total}")}\n"
                receiptContent += "${charge.name.ar}\n"
            }

            receiptContent += "${constructString("Total Vat", "$currency ${order.payment.vat}")}\n" +
                    "إجمالي ضريبة القيمة المضافة\n" +
                    "----------------------------------\n" +
                    "${constructString("Total Amount", "$currency ${order.payment.total}")}\n" +
                    "المبلغ الإجمالي\n" +
                    "----------------------------------\n"

            // Proforma Footer
            receiptContent += "----------------------------------\n"
            receiptContent += "This is not a tax invoice\n"
            receiptContent += "Valid for 30 days\n"
            receiptContent += "----------------------------------\n"

            // Return Policy
            if (order.location.returnPolicy!!.isNotEmpty()) {
                receiptContent += "Return Policy\n${order.location.returnPolicy}\n----------------------------------\n"
            }

            // Custom Text
            if (order.location.customText!!.isNotEmpty()) {
                receiptContent += "${order.location.customText}\n----------------------------------\n"
            }

            mPrinterService?.printText(receiptContent, callback)

            // Footer
            mPrinterService?.setAlignment(1, callback) // Center alignment
            mPrinterService?.printText("\n", callback)

            // QR Code
            if (order.qrCode != null) {
                mPrinterService?.printQRCode(order.qrCode, 4, 3, callback)
                mPrinterService?.printText("\n", callback)
            }

            // Barcode
            mPrinterService?.printBarCode(order.orderNum, 8, 100, 200, 2, callback)

            // Footer Text
            var footerContent = if (order.location.invoiceFooter!!.isNotEmpty()) {
                "----------------------------------\n${order.location.invoiceFooter}\n"
            } else {
                "----------------------------------\nThank You\n"
            }
            footerContent += "Powered by Tijarah360\n"

            mPrinterService?.printText(footerContent, callback)
            mPrinterService?.printText("\n\n\n\n", callback)

            // Cut paper if supported
            mPrinterService?.cutPaper(callback)

        } catch (e: Exception) {
            Log.e(TAG, "Error printing proforma: ${e.message}", e)
        }
    }


    override fun openCashDrawer() {
        checkConnection()
        Log.d(TAG, "Opening cash drawer on $printerName")

        try {
            val callback = object : InnerResultCallback() {
                @Throws(RemoteException::class)
                override fun onRunResult(isSuccess: Boolean) {
                    if (isSuccess) {
                        Log.d(TAG, "Cash drawer operation successful")
                    } else {
                        Log.e(TAG, "Cash drawer operation failed")
                    }
                }

                @Throws(RemoteException::class)
                override fun onReturnString(result: String) {
                    Log.d(TAG, "Cash drawer result: $result")
                }

                @Throws(RemoteException::class)
                override fun onRaiseException(code: Int, msg: String) {
                    Log.e(TAG, "Cash drawer exception: $code - $msg")
                }

                @Throws(RemoteException::class)
                override fun onPrintResult(code: Int, msg: String) {
                    Log.d(TAG, "Cash drawer result: $code - $msg")
                }
            }

            // Open cash drawer
            mPrinterService?.openDrawer(callback)

        } catch (e: Exception) {
            Log.e(TAG, "Error opening cash drawer: ${e.message}", e)
        }
    }

    override fun getPrinterStatus(): String {
        return if (isConnected) "Connected to Sunmi device" else "Disconnected"
    }

    override fun disconnect() {
        if (isConnected) {
            Log.d(TAG, "Disconnecting from $printerName")
            isConnected = false
        }
    }

    private fun checkConnection() {
        if (!isConnected) {
            Log.e(TAG, "Cannot print: Printer not connected")
            throw IllegalStateException("Printer must be connected before printing")
        }
    }

    override fun getDeviceList(): List<Printer> {
        // For Sunmi, there's only one built-in printer
        return listOf(
            Printer(
                id = "sunmi_built_in",
                name = "Sunmi Built-in Printer",
                deviceName = "Sunmi",
                productId = "sunmi",
                vendorId = "sunmi",
                printerType = "sunmi",
                printerSize = "58mm",
                ip = "",
                port = 0,
                enableReceipts = true,
                enableKOT = true,
                enableBarcodes = true,
                printerWidthMM = "58",
                charsPerLine = "32",
                numberOfPrints = 1,
                numberOfKotPrints = 1
            )
        )
    }

    private fun parseJson(jsonString: String): Order {
        val gson = Gson()
        return gson.fromJson(jsonString, Order::class.java)
    }

    /**
     * Helper function to construct a string with proper spacing
     * @param leftText The text to align left
     * @param rightText The text to align right
     * @return Formatted string with proper spacing
     */
    private fun constructString(leftText: String, rightText: String): String {
        val totalLength = 33
        val spaceLength = maxOf(0, totalLength - leftText.length - rightText.length)
        return leftText + " ".repeat(spaceLength) + rightText
    }
}
