package codes.shahid.rnprinterplugin.queue

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.util.Log

/**
 * Helper class to manage printer queue auto-starting and lifecycle.
 * This class can either start the queue directly or via the foreground service.
 */
class QueueAutoStarter(private val context: Context) {
    companion object {
        private const val TAG = "QueueAutoStarter"
        private var instance: QueueAutoStarter? = null

        @Synchronized
        fun getInstance(context: Context): QueueAutoStarter {
            if (instance == null) {
                instance = QueueAutoStarter(context.applicationContext)
            }
            return instance!!
        }
        
        /**
         * Enable auto-starting of the printer queue service.
         * This is a convenience method for use from activities.
         */
        fun enableAutoStart(context: Context) {
            val starter = getInstance(context)
            starter.initialize()
        }
    }

    private val printerQueue by lazy { PrinterQueue.getInstance(context) }
    private var isRegistered = false

    /**
     * Initialize the queue auto-starter.
     * This will start the printer queue service and register for lifecycle events.
     */
    fun initialize() {
        Log.d(TAG, "Initializing QueueAutoStarter")
        startQueueService()
        if (!isRegistered) {
            registerReceivers()
        }
    }

    /**
     * Start the printer queue service.
     * This is the preferred method for starting the queue in a way that
     * will continue running even when the app is in the background.
     */
    fun startQueueService() {
        Log.d(TAG, "Starting printer queue service")
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
            // Fallback to direct queue start if service fails
            startQueueDirectly()
        }
    }

    /**
     * Start the printer queue directly without using a service.
     * This is a fallback method and should only be used if the service approach fails.
     */
    fun startQueueDirectly() {
        Log.d(TAG, "Auto-starting printer queue directly (fallback)")
        printerQueue.startQueue()
    }

    /**
     * Stop the printer queue service.
     */
    fun stopQueueService() {
        Log.d(TAG, "Stopping printer queue service")
        try {
            val serviceIntent = Intent(context, PrinterQueueService::class.java).apply {
                action = PrinterQueueService.ACTION_STOP_SERVICE
            }
            context.startService(serviceIntent)
            Log.d(TAG, "Printer queue service stop request sent")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping printer queue service: ${e.message}")
            // Fallback to direct queue stop if service stop fails
            printerQueue.stopQueue()
        }
    }

    private fun registerReceivers() {
        try {
            val filter = IntentFilter().apply {
                addAction(Intent.ACTION_BOOT_COMPLETED)
                addAction(Intent.ACTION_MY_PACKAGE_REPLACED)
            }

            context.registerReceiver(appLifecycleReceiver, filter)
            isRegistered = true
            Log.d(TAG, "Registered for app lifecycle events")
        } catch (e: Exception) {
            Log.e(TAG, "Error registering receivers: ${e.message}")
        }
    }

    fun cleanup() {
        try {
            if (isRegistered) {
                context.unregisterReceiver(appLifecycleReceiver)
                isRegistered = false
                Log.d(TAG, "Unregistered app lifecycle events")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error unregistering receivers: ${e.message}")
        }
    }

    private val appLifecycleReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                Intent.ACTION_BOOT_COMPLETED -> {
                    Log.d(TAG, "Device boot completed, starting printer queue service")
                    startQueueService()
                }
                Intent.ACTION_MY_PACKAGE_REPLACED -> {
                    Log.d(TAG, "App updated, starting printer queue service")
                    startQueueService()
                }
            }
        }
    }
}
