package codes.shahid.rnprinterplugin.templates

import com.dantsu.escposprinter.EscPosPrinter
import codes.shahid.rnprinterplugin.types.Order


interface Templates {
    fun getReceipt(printer:EscPosPrinter,order: Order): String

    fun getRefundReceipt(printer:EscPosPrinter,order: Order): String

    fun getKot(printer:EscPosPrinter, order: Order, kitchenName: String? = null): String

    fun getProforma(printer:EscPosPrinter,order: Order): String
    
    fun getTransactionReceipt(printer: EscPosPrinter,transactionData: Map<String, Any>):String
}
