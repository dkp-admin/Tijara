package codes.shahid.rnprinterplugin.printer

import codes.shahid.rnprinterplugin.types.Order
import codes.shahid.rnprinterplugin.types.Printer
import codes.shahid.rnprinterplugin.types.PrinterConnectionParams
import codes.shahid.rnprinterplugin.types.TransactionData

interface BasePrinter {
    fun initialize()
    fun connect(productId: PrinterConnectionParams)
    fun getDeviceList(): List<Printer>
    fun printReceipt(orderJson: Order)
    fun printRefundReceipt(orderJson: Order)
    fun printTransactionReceipt(transactionData: Map<String, Any>)
    fun printKot(orderJson: Order, kitchenName: String? = null)
    fun printProforma(orderJson: Order)
    fun openCashDrawer()
    fun getPrinterStatus(): String
    fun disconnect()
}