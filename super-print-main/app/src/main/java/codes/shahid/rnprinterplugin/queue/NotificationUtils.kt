package codes.shahid.rnprinterplugin.queue

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import codes.shahid.rnprinterplugin.MainActivity
import codes.shahid.rnprinterplugin.R

/**
 * Utility class for managing notifications related to the printer queue.
 */
object NotificationUtils {
    private const val TAG = "NotificationUtils"
    const val QUEUE_CHANNEL_ID = "codes_shahid_rnprinterplugin_queue_channel"
    const val QUEUE_NOTIFICATION_ID = 1001

    /**
     * Create all notification channels used by the app.
     */
    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createQueueChannel(context)
        }
    }

    /**
     * Create a notification for the printer queue service.
     * This notification is used for the foreground service.
     */
    fun createQueueNotification(
        context: Context,
        pendingJobs: Int = 0,
        processingJobs: Int = 0
    ): Notification {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createQueueChannel(context)
        }

        // Create content text based on queue status
        val contentText = when {
            processingJobs > 0 -> context.getString(R.string.notification_queue_processing, processingJobs)
            pendingJobs > 0 -> context.getString(R.string.notification_queue_pending, pendingJobs)
            else -> context.getString(R.string.notification_queue_idle)
        }

        // Create pending intent for notification click
        val contentIntent = PendingIntent.getActivity(
            context,
            0,
            Intent(context, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or
                (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        // Build the notification
        val builder = NotificationCompat.Builder(context, QUEUE_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(context.getString(R.string.notification_queue_title))
            .setContentText(contentText)
            .setContentIntent(contentIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setOngoing(true)

        return builder.build()
    }

    fun updateQueueNotification(
        context: Context,
        pendingJobs: Int,
        processingJobs: Int
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = createQueueNotification(context, pendingJobs, processingJobs)
        notificationManager.notify(QUEUE_NOTIFICATION_ID, notification)
    }

    fun cancelQueueNotification(context: Context) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(QUEUE_NOTIFICATION_ID)
    }

    /**
     * Create a PendingIntent for stopping the queue service.
     * This is used in the notification action.
     */
    private fun getStopQueueIntent(context: Context): PendingIntent? {
        try {
            val intent = Intent(context, QueueStopReceiver::class.java)
            intent.action = QueueStopReceiver.ACTION_STOP_QUEUE

            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }

            return PendingIntent.getBroadcast(context, 0, intent, flags)
        } catch (e: Exception) {
            Log.e(TAG, "Error creating stop queue intent: ${e.message}")
            return null
        }
    }

    @androidx.annotation.RequiresApi(Build.VERSION_CODES.O)
    private fun createQueueChannel(context: Context) {
        try {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val existingChannel = notificationManager.getNotificationChannel(QUEUE_CHANNEL_ID)
            if (existingChannel != null) {
                return
            }
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(
                QUEUE_CHANNEL_ID,
                context.getString(R.string.notification_queue_channel_name),
                importance
            ).apply {
                description = context.getString(R.string.notification_queue_channel_description)
                setShowBadge(false)
            }
            notificationManager.createNotificationChannel(channel)
            Log.d(TAG, "Created queue notification channel")
        } catch (e: Exception) {
            Log.e(TAG, "Error creating notification channel: ${e.message}")
        }
    }
}
