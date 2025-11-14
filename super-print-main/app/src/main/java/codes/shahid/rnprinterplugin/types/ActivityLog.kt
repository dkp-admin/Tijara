package codes.shahid.rnprinterplugin.types

import java.util.Date

/**
 * Represents an activity log entry for order processing and printer operations
 */
data class ActivityLog(
    val id: Long = 0,             // Database ID (0 for new entries)
    val jobId: String = "",       // Print job ID
    val orderId: String = "",     // Order ID
    val printerId: String = "",   // Printer ID
    val printerName: String = "", // Printer name
    val action: String = "",      // Action (QUEUED, PROCESSING, PRINTED, etc.)
    val status: String = "",      // Status (SUCCESS, FAILED, etc.)
    val message: String = "",     // Short message
    val errorDetails: String = "",// Detailed error information
    val timestamp: Date = Date()  // When the log was created
)

/**
 * Constants for activity log actions
 */
object ActivityLogAction {
    const val QUEUED = "QUEUED"           // Job added to queue
    const val PROCESSING = "PROCESSING"   // Job is being processed
    const val PRINTED = "PRINTED"         // Print completed
    const val FAILED = "FAILED"           // Print failed
    const val RETRYING = "RETRYING"       // Retrying after failure
}

/**
 * Constants for activity log statuses
 */
object ActivityLogStatus {
    const val SUCCESS = "SUCCESS"         // Operation succeeded
    const val ERROR = "ERROR"             // Operation failed with error
    const val PENDING = "PENDING"         // Operation is pending
    const val IN_PROGRESS = "IN_PROGRESS" // Operation is in progress
} 