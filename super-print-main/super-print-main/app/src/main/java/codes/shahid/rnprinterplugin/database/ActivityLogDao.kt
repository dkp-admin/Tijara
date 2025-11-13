package codes.shahid.rnprinterplugin.database

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.util.Log
import codes.shahid.rnprinterplugin.types.ActivityLog
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ActivityLogDao(context: Context) {
    private val dbHelper = DatabaseHelper(context)
    private val TAG = "ActivityLogDao"
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())

    /**
     * Insert a new activity log entry into the database
     * @param activityLog The activity log to insert
     * @return true if insertion was successful, false otherwise
     */
    fun insertActivityLog(activityLog: ActivityLog): Boolean {
        val db = dbHelper.writableDatabase
        val values = createContentValues(activityLog)

        try {
            val result = db.insert(DatabaseHelper.TABLE_ACTIVITY_LOGS, null, values)
            return result != -1L
        } catch (e: Exception) {
            Log.e(TAG, "Error inserting activity log: ${e.message}")
            return false
        } finally {
            db.close()
        }
    }

    /**
     * Get activity logs by order ID (exact match)
     * @param orderId The ID of the order to get logs for
     * @return List of activity logs for the order
     */
    fun getActivityLogsByOrderId(orderId: String): List<ActivityLog> {
        val logs = mutableListOf<ActivityLog>()
        val db = dbHelper.readableDatabase

        try {
            val cursor = db.query(
                DatabaseHelper.TABLE_ACTIVITY_LOGS,
                null,
                "${DatabaseHelper.COLUMN_ORDER_ID} = ?",
                arrayOf(orderId),
                null,
                null,
                "${DatabaseHelper.COLUMN_TIMESTAMP} DESC"
            )

            if (cursor.moveToFirst()) {
                do {
                    val log = cursorToActivityLog(cursor)
                    logs.add(log)
                } while (cursor.moveToNext())
            }
            cursor.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error getting activity logs by order ID: ${e.message}")
        } finally {
            db.close()
        }

        return logs
    }

    /**
     * Get activity logs by partial order ID (partial match using LIKE)
     * @param partialOrderId Partial order ID to search for
     * @param limit Maximum number of logs to return
     * @return List of activity logs matching the partial order ID
     */
    fun getActivityLogsByPartialOrderId(partialOrderId: String, limit: Int = 500): List<ActivityLog> {
        Log.d(TAG, "=== GET ACTIVITY LOGS BY PARTIAL ORDER ID START ===")
        Log.d(TAG, "Partial Order ID: '$partialOrderId', Limit: $limit")
        val logs = mutableListOf<ActivityLog>()
        val db = dbHelper.readableDatabase

        try {
            Log.d(TAG, "Executing partial search query on table: ${DatabaseHelper.TABLE_ACTIVITY_LOGS}")
            val cursor = db.query(
                DatabaseHelper.TABLE_ACTIVITY_LOGS,
                null,
                "${DatabaseHelper.COLUMN_ORDER_ID} LIKE ?",
                arrayOf("%$partialOrderId%"),
                null,
                null,
                "${DatabaseHelper.COLUMN_TIMESTAMP} DESC",
                limit.toString()
            )
            Log.d(TAG, "Partial search query executed, cursor count: ${cursor.count}")

            if (cursor.moveToFirst()) {
                var count = 0
                do {
                    val log = cursorToActivityLog(cursor)
                    logs.add(log)
                    count++
                    if (count <= 3) { // Log first 3 entries for debugging
                        Log.d(TAG, "Partial match log $count: id=${log.id}, orderId=${log.orderId}, action=${log.action}")
                    }
                } while (cursor.moveToNext())
                Log.d(TAG, "Processed $count logs from partial search cursor")
            } else {
                Log.d(TAG, "No logs found matching partial order ID: '$partialOrderId'")
            }
            cursor.close()
            Log.d(TAG, "Cursor closed")
        } catch (e: Exception) {
            Log.e(TAG, "Error getting activity logs by partial order ID: ${e.message}", e)
            Log.e(TAG, "Stack trace: ${e.stackTraceToString()}")
        } finally {
            db.close()
            Log.d(TAG, "Database connection closed")
        }

        Log.d(TAG, "Returning ${logs.size} logs for partial order ID search")
        Log.d(TAG, "=== GET ACTIVITY LOGS BY PARTIAL ORDER ID END ===")
        return logs
    }

    /**
     * Get activity logs by job ID
     * @param jobId The ID of the print job to get logs for
     * @return List of activity logs for the job
     */
    fun getActivityLogsByJobId(jobId: String): List<ActivityLog> {
        val logs = mutableListOf<ActivityLog>()
        val db = dbHelper.readableDatabase

        try {
            val cursor = db.query(
                DatabaseHelper.TABLE_ACTIVITY_LOGS,
                null,
                "${DatabaseHelper.COLUMN_JOB_ID} = ?",
                arrayOf(jobId),
                null,
                null,
                "${DatabaseHelper.COLUMN_TIMESTAMP} DESC"
            )

            if (cursor.moveToFirst()) {
                do {
                    val log = cursorToActivityLog(cursor)
                    logs.add(log)
                } while (cursor.moveToNext())
            }
            cursor.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error getting activity logs by job ID: ${e.message}")
        } finally {
            db.close()
        }

        return logs
    }

    /**
     * Get activity logs by date range
     * @param startDate Start date for the range
     * @param endDate End date for the range
     * @return List of activity logs within the date range
     */
    fun getActivityLogsByDateRange(startDate: Date, endDate: Date): List<ActivityLog> {
        val logs = mutableListOf<ActivityLog>()
        val db = dbHelper.readableDatabase

        try {
            val startDateStr = dateFormat.format(startDate)
            val endDateStr = dateFormat.format(endDate)

            val cursor = db.query(
                DatabaseHelper.TABLE_ACTIVITY_LOGS,
                null,
                "${DatabaseHelper.COLUMN_TIMESTAMP} BETWEEN ? AND ?",
                arrayOf(startDateStr, endDateStr),
                null,
                null,
                "${DatabaseHelper.COLUMN_TIMESTAMP} DESC"
            )

            if (cursor.moveToFirst()) {
                do {
                    val log = cursorToActivityLog(cursor)
                    Log.d(TAG,log.toString())
                    logs.add(log)
                } while (cursor.moveToNext())
            }
            cursor.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error getting activity logs by date range: ${e.message}")
        } finally {
            db.close()
        }

        return logs
    }

    /**
     * Get recent activity logs
     * @param limit Maximum number of logs to return
     * @return List of recent activity logs
     */
    fun getRecentActivityLogs(limit: Int = 100): List<ActivityLog> {
        Log.d(TAG, "=== GET RECENT ACTIVITY LOGS START ===")
        Log.d(TAG, "Requested limit: $limit")
        val logs = mutableListOf<ActivityLog>()
        val db = dbHelper.readableDatabase
        Log.d(TAG, "Database connection obtained")

        try {
            Log.d(TAG, "Executing query on table: ${DatabaseHelper.TABLE_ACTIVITY_LOGS}")
            val cursor = db.query(
                DatabaseHelper.TABLE_ACTIVITY_LOGS,
                null,
                null,
                null,
                null,
                null,
                "${DatabaseHelper.COLUMN_TIMESTAMP} DESC",
                limit.toString()
            )
            Log.d(TAG, "Query executed, cursor count: ${cursor.count}")

            if (cursor.moveToFirst()) {
                var count = 0
                do {
                    val log = cursorToActivityLog(cursor)
                    logs.add(log)
                    count++
                    if (count <= 3) { // Log first 3 entries for debugging
                        Log.d(TAG, "Log $count: id=${log.id}, action=${log.action}, status=${log.status}, message=${log.message}")
                    }
                } while (cursor.moveToNext())
                Log.d(TAG, "Processed $count logs from cursor")
            } else {
                Log.d(TAG, "No logs found in database")
            }
            cursor.close()
            Log.d(TAG, "Cursor closed")
        } catch (e: Exception) {
            Log.e(TAG, "Error getting recent activity logs: ${e.message}", e)
            Log.e(TAG, "Stack trace: ${e.stackTraceToString()}")
        } finally {
            db.close()
            Log.d(TAG, "Database connection closed")
        }

        Log.d(TAG, "Returning ${logs.size} logs")
        Log.d(TAG, "=== GET RECENT ACTIVITY LOGS END ===")
        return logs
    }

    /**
     * Delete old activity logs to maintain database size
     * @param daysToKeep Number of days of logs to keep
     * @return Number of logs deleted
     */
    fun deleteOldActivityLogs(daysToKeep: Int = 30): Int {
        val db = dbHelper.writableDatabase
        
        try {
            val calendar = java.util.Calendar.getInstance()
            calendar.add(java.util.Calendar.DAY_OF_YEAR, -daysToKeep)
            val cutoffDate = dateFormat.format(calendar.time)
            
            return db.delete(
                DatabaseHelper.TABLE_ACTIVITY_LOGS,
                "${DatabaseHelper.COLUMN_TIMESTAMP} < ?",
                arrayOf(cutoffDate)
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting old activity logs: ${e.message}")
            return 0
        } finally {
            db.close()
        }
    }

    /**
     * Limit the total number of activity logs by keeping only the most recent ones
     * @param maxLogs Maximum number of logs to keep
     * @return Number of logs deleted
     */
    fun limitLogsCount(maxLogs: Int = 10000): Int {
        val db = dbHelper.writableDatabase
        
        try {
            // First, check if we have more than maxLogs
            val cursor = db.rawQuery("SELECT COUNT(*) FROM ${DatabaseHelper.TABLE_ACTIVITY_LOGS}", null)
            cursor.moveToFirst()
            val totalLogs = cursor.getInt(0)
            cursor.close()
            
            if (totalLogs <= maxLogs) {
                // No need to delete anything
                return 0
            }
            
            // Calculate how many logs to delete
            val logsToDelete = totalLogs - maxLogs
            
            // Get the timestamp of the nth oldest log (where n is the number to delete)
            val cutoffCursor = db.rawQuery(
                "SELECT ${DatabaseHelper.COLUMN_TIMESTAMP} FROM ${DatabaseHelper.TABLE_ACTIVITY_LOGS} " +
                "ORDER BY ${DatabaseHelper.COLUMN_TIMESTAMP} ASC LIMIT 1 OFFSET $logsToDelete", 
                null
            )
            
            if (!cutoffCursor.moveToFirst()) {
                cutoffCursor.close()
                return 0
            }
            
            val cutoffTime = cutoffCursor.getString(0)
            cutoffCursor.close()
            
            // Delete all logs older than or equal to the cutoff time
            val deleted = db.delete(
                DatabaseHelper.TABLE_ACTIVITY_LOGS,
                "${DatabaseHelper.COLUMN_TIMESTAMP} < ?",
                arrayOf(cutoffTime)
            )
            
            Log.d(TAG, "Capped activity logs collection to $maxLogs entries, deleted $deleted logs")
            return deleted
            
        } catch (e: Exception) {
            Log.e(TAG, "Error limiting activity logs count: ${e.message}")
            return 0
        } finally {
            db.close()
        }
    }

    /**
     * Convert database cursor to ActivityLog object
     */
    private fun cursorToActivityLog(cursor: Cursor): ActivityLog {
        val timestampStr = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TIMESTAMP))
        val timestamp = try {
            dateFormat.parse(timestampStr) ?: Date()
        } catch (e: Exception) {
            Date()
        }

        return ActivityLog(
            id = cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_ID)),
            jobId = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_JOB_ID)),
            orderId = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_ORDER_ID)),
            printerId = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PRINTER_ID)),
            printerName = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PRINTER_NAME)),
            action = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_ACTION)),
            status = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_STATUS)),
            message = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_MESSAGE)),
            errorDetails = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_ERROR_DETAILS)),
            timestamp = timestamp
        )
    }

    /**
     * Convert ActivityLog object to ContentValues for database operations
     */
    private fun createContentValues(activityLog: ActivityLog): ContentValues {
        val values = ContentValues()
        
        // Don't set ID for new inserts, SQLite will auto-increment
        if (activityLog.id > 0) {
            values.put(DatabaseHelper.COLUMN_ID, activityLog.id)
        }
        
        values.put(DatabaseHelper.COLUMN_JOB_ID, activityLog.jobId)
        values.put(DatabaseHelper.COLUMN_ORDER_ID, activityLog.orderId)
        values.put(DatabaseHelper.COLUMN_PRINTER_ID, activityLog.printerId)
        values.put(DatabaseHelper.COLUMN_PRINTER_NAME, activityLog.printerName)
        values.put(DatabaseHelper.COLUMN_ACTION, activityLog.action)
        values.put(DatabaseHelper.COLUMN_STATUS, activityLog.status)
        values.put(DatabaseHelper.COLUMN_MESSAGE, activityLog.message)
        values.put(DatabaseHelper.COLUMN_ERROR_DETAILS, activityLog.errorDetails)
        values.put(DatabaseHelper.COLUMN_TIMESTAMP, dateFormat.format(activityLog.timestamp))
        
        return values
    }
} 