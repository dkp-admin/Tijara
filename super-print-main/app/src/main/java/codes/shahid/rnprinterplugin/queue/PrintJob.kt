package codes.shahid.rnprinterplugin.queue

import codes.shahid.rnprinterplugin.types.Order
import java.util.Date
import java.util.UUID


enum class PrintJobType {
    RECEIPT,
    REFUND_RECEIPT,
    KOT,
    PROFORMA,
    TRANSACTION_REPORT
}


enum class PrintJobStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED
}


data class PrintJob(
    val id: String = UUID.randomUUID().toString(),
    val printerId: String,
    val jobType: PrintJobType,
    val order: Order? = null,
    val transactionData: Map<String, Any>? = null,
    val kitchenName: String? = null,
    var status: PrintJobStatus = PrintJobStatus.PENDING,
    var errorMessage: String? = null,
    val createdAt: Date = Date(),
    var processedAt: Date? = null
)
