package codes.shahid.rnprinterplugin.printer.neoleap

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.Toast
import com.google.gson.Gson
import com.newland.sdk.me.module.printer.ErrorCode
import com.newland.sdk.me.module.printer.ModuleManage
import com.newland.sdk.me.module.printer.PrintListener
import com.newland.sdk.me.module.printer.PrinterModule
import codes.shahid.rnprinterplugin.printer.BasePrinter
import codes.shahid.rnprinterplugin.printer.neoleap.templates.NeoLeapTemplates
import codes.shahid.rnprinterplugin.printer.sunmi.SunmiPrinter
import codes.shahid.rnprinterplugin.printer.sunmi.SunmiPrinter.Companion
import codes.shahid.rnprinterplugin.types.Order
import codes.shahid.rnprinterplugin.types.Printer
import codes.shahid.rnprinterplugin.types.PrinterConnectionParams
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine
import kotlinx.coroutines.runBlocking

class NeoleapPrinter(
    private val context: Context
) : BasePrinter {

    companion object {
        private const val TAG = "NeoleapPrinter"
    }

    private var isInitialized = false
    private var isConnected = false
    private val printerName = "Neoleap Printer"
    private val templates = NeoLeapTemplates(context)
    private lateinit var mPrinterModule: PrinterModule
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun initialize() {
        Log.d(TAG, "Initializing $printerName")
        runBlocking {
            suspendCoroutine { continuation ->
                mainHandler.post {
                    try {
                        ModuleManage.getInstance().init()
                        mPrinterModule = ModuleManage.getInstance().printerModule
                        isInitialized = true
                        continuation.resume(Unit)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error initializing Neoleap printer: ${e.message}")
                        continuation.resumeWithException(e)
                    }
                }
            }
        }
        Log.d(TAG, "Neoleap printer initialized successfully")
    }

    override fun connect(id: PrinterConnectionParams) {
        if (!isInitialized) {
            Log.e(TAG, "Cannot connect: Printer not initialized")
            throw IllegalStateException("Printer must be initialized before connecting")
        }
        Log.d(TAG, "Connecting to $printerName")
        isConnected = true
    }

    override fun printReceipt(order: Order) {
        checkConnection()
        Log.d(TAG, "Printing receipt on $printerName for order ${order._id}")

        try {
            val (printData, bitmaps) = templates.getReceiptData(order)

            mainHandler.post {
                try {
                    mPrinterModule.print(printData.toString(), bitmaps, object : PrintListener {
                        override fun onSuccess() {
                            Log.d("PRINT_STATUS", "Successfully printed receipt for order ${order._id}")
                        }

                        override fun onError(errorCode: ErrorCode, s: String) {
                            Log.e("PRINT_STATUS", "Error printing receipt: $errorCode - $s")
                        }
                    })
                } catch (e: Exception) {
                    Log.e(TAG, "Error in print execution: ${e.message}", e)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error generating or printing receipt: ${e.message}", e)
            throw e
        }
    }

    override fun printTransactionReceipt(transactionData: Map<String, Any>) {
        checkConnection()
        Log.d(TAG, "Printing transaction report on $printerName")

        try {
            val printData = StringBuffer()

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
                val count = txnData?.get("noOfPayments") as? Number ?: 0

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

            mPrinterModule!!.print(printData.toString(), null, object : PrintListener {
                override fun onSuccess() {
                    Log.d("PRINT_STATUS", "Successfully printed transaction report")
                }

                override fun onError(errorCode: ErrorCode, s: String) {
                    Log.e("PRINT_STATUS", "Error printing transaction report: $errorCode - $s")
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error printing transaction report: ${e.message}", e)
            throw e
        }
    }


    override fun printRefundReceipt(order: Order) {
        checkConnection()
        Log.d(TAG, "Printing refund receipt on $printerName for order ${order._id}")

        try {
            val (printData, bitmaps) = templates.getRefundReceiptData(order)

            mPrinterModule!!.print(printData.toString(), bitmaps, object : PrintListener {
                override fun onSuccess() {
                    Log.d("PRINT_STATUS", "Successfully printed refund receipt for order ${order._id}")
                }

                override fun onError(errorCode: ErrorCode, s: String) {
                    Log.e("PRINT_STATUS", "Error printing refund receipt: $errorCode - $s")
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error generating or printing refund receipt: ${e.message}", e)
            throw e
        }
    }


    override fun printKot(order: Order, kitchenName: String?) {
        checkConnection()
        Log.d(TAG, "Printing KOT on $printerName for order ${order._id}, kitchen: $kitchenName")

        try {
            val (printData, bitmaps) = templates.getKotData(order, kitchenName)

            mPrinterModule!!.print(printData.toString(), bitmaps, object : PrintListener {
                override fun onSuccess() {
                    Log.d("PRINT_STATUS", "Successfully printed KOT for order ${order._id}")
                }

                override fun onError(errorCode: ErrorCode, s: String) {
                    Log.e("PRINT_STATUS", "Error printing KOT: $errorCode - $s")
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error generating or printing KOT: ${e.message}", e)
            throw e
        }
    }


    override fun printProforma(order: Order) {
        checkConnection()
        Log.d(TAG, "Printing proforma on $printerName for order ${order._id}")

        try {
            val (printData, bitmaps) = templates.getReceiptData(order)

            val proformaInfo = StringBuffer()
            proformaInfo.append("!NLFONT 15 15 3\n*text c *** PROFORMA INVOICE ***\n")
            proformaInfo.append("!NLFONT 10 22 3\n*text c -------------------------\n")

            val finalPrintData = StringBuffer(printData.toString().replace(
                "!NLFONT 10 22 3\n*text c -------------------------\n!NLFONT 15 15 3\n*text c Simplified Tax Invoice\n",
                proformaInfo.toString() + "!NLFONT 15 15 3\n*text c Simplified Tax Invoice\n"
            ))

            finalPrintData.append("!NLFONT 10 22 3\n*text c -------------------------\n")
            finalPrintData.append("!NLFONT 15 15 3\n*text c This is not a tax invoice\n")
            finalPrintData.append("!NLFONT 15 15 3\n*text c Valid for 30 days\n")
            finalPrintData.append("*feedline 4\n")

            mPrinterModule!!.print(finalPrintData.toString(), bitmaps, object : PrintListener {
                override fun onSuccess() {
                    Log.d("PRINT_STATUS", "Successfully printed proforma for order ${order._id}")
                }

                override fun onError(errorCode: ErrorCode, s: String) {
                    Log.e("PRINT_STATUS", "Error printing proforma: $errorCode - $s")
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error generating or printing proforma: ${e.message}", e)
            throw e
        }
    }

    override fun openCashDrawer() {
        checkConnection()
        Log.d(TAG, "Opening cash drawer on $printerName")

        try {
            // Create a simple command to open the cash drawer
            val printData = StringBuffer()
            printData.append("!CASHDRAWER 1\n") // Command to open cash drawer

            mPrinterModule!!.print(printData.toString(), HashMap(), object : PrintListener {
                override fun onSuccess() {
                    Log.d("PRINT_STATUS", "Successfully opened cash drawer")
                }

                override fun onError(errorCode: ErrorCode, s: String) {
                    Log.e("PRINT_STATUS", "Error opening cash drawer: $errorCode - $s")
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error opening cash drawer: ${e.message}", e)
            throw e
        }
    }

    override fun getPrinterStatus(): String {
        return if (isConnected) "Connected to Neoleap device" else "Disconnected"
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
        // For Neoleap, there's only one built-in printer
        return listOf(
            Printer(
                id = "neoleap_built_in",
                name = "Neoleap Built-in Printer",
                deviceName = "Neoleap",
                productId = "neoleap",
                vendorId = "neoleap",
                printerType = "neoleap",
                printerSize = "80mm",
                ip = "",
                port = 0,
                enableReceipts = true,
                enableKOT = true,
                enableBarcodes = true,
                printerWidthMM = "80",
                charsPerLine = "42"
            )
        )
    }

    private fun parseJson(jsonString: String): Order {
        val gson = Gson()
        return gson.fromJson(jsonString, Order::class.java)
    }
}
