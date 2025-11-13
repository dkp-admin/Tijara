package codes.shahid.rnprinterplugin.queue

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log

/**
 * A foreground service that manages the printer queue.
 * This service ensures the printer queue continues to run even when the app is in the background
 * or after device reboot.
 */
class PrinterQueueService : Service() {
    companion object {
        private const val TAG = "PrinterQueueService"
        const val ACTION_START_SERVICE = "codes.shahid.rnprinterplugin.queue.START_SERVICE"
        const val ACTION_STOP_SERVICE = "codes.shahid.rnprinterplugin.queue.STOP_SERVICE"
    }

    private lateinit var printerQueue: PrinterQueue

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "PrinterQueueService created")
        printerQueue = PrinterQueue.getInstance(applicationContext)
        
        // Ensure notification channels are created
        NotificationUtils.createNotificationChannels(applicationContext)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "PrinterQueueService started with intent: ${intent?.action}")

        when (intent?.action) {
            ACTION_STOP_SERVICE -> {
                stopService()
                return START_NOT_STICKY
            }
            else -> {
                startForegroundService()
                return START_STICKY
            }
        }
    }

    private fun startForegroundService() {
        Log.d(TAG, "Starting foreground service")
        
        try {
        // Create notification for foreground service
        val notification = NotificationUtils.createQueueNotification(applicationContext)
        
        // Start as foreground service with notification
        startForeground(NotificationUtils.QUEUE_NOTIFICATION_ID, notification)
        
        // Start the printer queue
            val result = printerQueue.startQueue()
            if (result["success"] as Boolean) {
                Log.d(TAG, "Printer queue started successfully: ${result["message"]}")
            } else {
                Log.e(TAG, "Error starting printer queue: ${result["error"]}")
            }
        
        Log.d(TAG, "Foreground service started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting foreground service: ${e.message}", e)
        }
    }

    private fun stopService() {
        Log.d(TAG, "Stopping service")
        try {
        // Stop the printer queue
        printerQueue.stopQueue()
        
        // Stop the foreground service
        stopForeground(true)
        stopSelf()
            
            Log.d(TAG, "Service stopped successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping service: ${e.message}", e)
            stopSelf() // Make sure we still stop even if there's an error
        }
    }

    override fun onDestroy() {
        Log.d(TAG, "PrinterQueueService destroyed")
        try {
        printerQueue.stopQueue()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping queue on service destroy: ${e.message}", e)
        }
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
