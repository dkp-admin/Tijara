package codes.shahid.rnprinterplugin.queue

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

/**
 * Broadcast receiver that starts the printer queue service when the device boots up
 * or when the app is updated.
 */
class QueueBootReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "QueueBootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "Received broadcast: ${intent.action}")

        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED -> {
                Log.d(TAG, "Device boot completed, starting printer queue service")
                startQueueService(context)
            }
            Intent.ACTION_MY_PACKAGE_REPLACED -> {
                Log.d(TAG, "App updated, starting printer queue service")
                startQueueService(context)
            }
        }
    }

    private fun startQueueService(context: Context) {
        try {
            val serviceIntent = Intent(context, PrinterQueueService::class.java).apply {
                action = PrinterQueueService.ACTION_START_SERVICE
            }

            // Start the service based on Android version
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }

            Log.d(TAG, "Printer queue service started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting printer queue service: ${e.message}")

            // Fallback to the old method if service fails to start
            try {
                val queueAutoStarter = QueueAutoStarter.getInstance(context)
                queueAutoStarter.initialize()
                Log.d(TAG, "Printer queue started via fallback method")
            } catch (e2: Exception) {
                Log.e(TAG, "Fallback method also failed: ${e2.message}")
            }
        }
    }
}
