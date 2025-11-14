package codes.shahid.rnprinterplugin.queue

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Broadcast receiver that stops the printer queue service.
 * This is typically triggered from the notification action.
 */
class QueueStopReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "QueueStopReceiver"
        const val ACTION_STOP_QUEUE = "codes.shahid.rnprinterplugin.queue.STOP_QUEUE"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_STOP_QUEUE) {
            Log.d(TAG, "Received stop queue action")
            stopQueueService(context)
        }
    }

    private fun stopQueueService(context: Context) {
        try {
            // Stop the service
            val serviceIntent = Intent(context, PrinterQueueService::class.java).apply {
                action = PrinterQueueService.ACTION_STOP_SERVICE
            }
            context.startService(serviceIntent)

            Log.d(TAG, "Printer queue service stop request sent")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping printer queue service: ${e.message}")

            // Fallback to direct queue stop if service stop fails
            try {
                val printerQueue = PrinterQueue.getInstance(context)
                printerQueue.stopQueue()
                NotificationUtils.cancelQueueNotification(context)
                Log.d(TAG, "Printer queue stopped directly (fallback)")
            } catch (e2: Exception) {
                Log.e(TAG, "Fallback method also failed: ${e2.message}")
            }
        }
    }
}
