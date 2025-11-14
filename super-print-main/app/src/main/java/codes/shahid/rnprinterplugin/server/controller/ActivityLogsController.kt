package codes.shahid.rnprinterplugin.server.controller

import android.content.Context
import android.util.Log
import codes.shahid.rnprinterplugin.database.ActivityLogDao
import codes.shahid.rnprinterplugin.types.ActivityLogStatus
import fi.iki.elonen.NanoHTTPD
import fi.iki.elonen.NanoHTTPD.Response.Status
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class ActivityLogsController : BaseController {
    companion object {
        private const val TAG = "ActivityLogsController"
    }

    override fun handle(session: NanoHTTPD.IHTTPSession, context: Context): NanoHTTPD.Response {
        Log.d(TAG, "=== ACTIVITY LOGS REQUEST START ===")
        Log.d(TAG, "Method: ${session.method}")
        Log.d(TAG, "URI: ${session.uri}")
        Log.d(TAG, "Headers: ${session.headers}")

        // Ensure we're only handling GET requests
        if (session.method != NanoHTTPD.Method.GET) {
            Log.w(TAG, "Invalid method: ${session.method}")
            return createResponse(Status.METHOD_NOT_ALLOWED, "Method Not Allowed")
        }

        try {
            val params = session.parameters
            Log.d(TAG, "Query parameters: $params")

            // Create the DAO
            val activityLogDao = ActivityLogDao(context)
            Log.d(TAG, "ActivityLogDao created successfully")

            // Extract query parameters
            val orderId = params["orderId"]?.firstOrNull() ?: ""
            val partialOrderId = params["partialOrderId"]?.firstOrNull() ?: ""
            val jobId = params["jobId"]?.firstOrNull() ?: ""
            val status = params["status"]?.firstOrNull() ?: ""
            val startDateStr = params["startDate"]?.firstOrNull() ?: ""
            val endDateStr = params["endDate"]?.firstOrNull() ?: ""
            val limit = params["limit"]?.firstOrNull()?.toIntOrNull() ?: 100

            Log.d(TAG, "Parsed parameters - orderId: '$orderId', partialOrderId: '$partialOrderId', jobId: '$jobId', status: '$status', startDate: '$startDateStr', endDate: '$endDateStr', limit: $limit")
            
            // Format for parsing dates
            val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            Log.d(TAG, "Date format created: $dateFormat")

            // Get the logs based on parameters
            Log.d(TAG, "Determining query type...")
            val logs = when {
                partialOrderId.isNotEmpty() -> {
                    Log.d(TAG, "Fetching logs for partial order ID: $partialOrderId")
                    val result = activityLogDao.getActivityLogsByPartialOrderId(partialOrderId, limit)
                    Log.d(TAG, "Retrieved ${result.size} logs for partial order ID")
                    result
                }
                orderId.isNotEmpty() -> {
                    Log.d(TAG, "Fetching logs for exact order ID: $orderId")
                    val result = activityLogDao.getActivityLogsByOrderId(orderId)
                    Log.d(TAG, "Retrieved ${result.size} logs for exact order ID")
                    result
                }
                jobId.isNotEmpty() -> {
                    Log.d(TAG, "Fetching logs for job ID: $jobId")
                    val result = activityLogDao.getActivityLogsByJobId(jobId)
                    Log.d(TAG, "Retrieved ${result.size} logs for job ID")
                    result
                }
                startDateStr.isNotEmpty() && endDateStr.isNotEmpty() -> {
                    try {
                        Log.d(TAG, "Parsing date range: $startDateStr to $endDateStr")
                        val startDate = dateFormat.parse(startDateStr) ?: Date(0)
                        val endDate = dateFormat.parse(endDateStr) ?: Date()

                        // Add one day to endDate to include the full day
                        val calendar = Calendar.getInstance()
                        calendar.time = endDate
                        calendar.add(Calendar.DAY_OF_MONTH, 1)
                        val adjustedEndDate = calendar.time

                        Log.d(TAG, "Fetching logs from $startDateStr to $endDateStr (adjusted: ${dateFormat.format(adjustedEndDate)})")
                        val result = activityLogDao.getActivityLogsByDateRange(startDate, adjustedEndDate)
                        Log.d(TAG, "Retrieved ${result.size} logs for date range")
                        result
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing dates: ${e.message}")
                        val result = activityLogDao.getRecentActivityLogs(limit)
                        Log.d(TAG, "Fallback: Retrieved ${result.size} recent logs")
                        result
                    }
                }
                else -> {
                    Log.d(TAG, "Fetching recent logs (limit: $limit)")
                    val result = activityLogDao.getRecentActivityLogs(limit)
                    Log.d(TAG, "Retrieved ${result.size} recent logs")
                    result
                }
            }
            
            // Filter by status if specified
            Log.d(TAG, "Applying status filter: '$status'")
            val filteredLogs = if (status.isNotEmpty()) {
                val filtered = logs.filter { it.status.equals(status, ignoreCase = true) }
                Log.d(TAG, "Filtered ${logs.size} logs to ${filtered.size} logs with status '$status'")
                filtered
            } else {
                Log.d(TAG, "No status filter applied, keeping all ${logs.size} logs")
                logs
            }

            // Convert logs to JSON
            Log.d(TAG, "Converting ${filteredLogs.size} logs to JSON...")
            val jsonArray = JSONArray()
            for ((index, log) in filteredLogs.withIndex()) {
                Log.d(TAG, "Processing log $index: id=${log.id}, action=${log.action}, status=${log.status}")
                val jsonLog = JSONObject().apply {
                    put("id", log.id)
                    put("jobId", log.jobId)
                    put("orderId", log.orderId)
                    put("printerId", log.printerId)
                    put("printerName", log.printerName)
                    put("action", log.action)
                    put("status", log.status)
                    put("message", log.message)
                    put("errorDetails", log.errorDetails)
                    put("timestamp", SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(log.timestamp))
                }
                jsonArray.put(jsonLog)
                if (index < 3) { // Log first 3 entries for debugging
                    Log.d(TAG, "JSON log $index: $jsonLog")
                }
            }
            Log.d(TAG, "JSON array created with ${jsonArray.length()} entries")

            // Create the response object
            val responseJson = JSONObject().apply {
                put("success", true)
                put("count", filteredLogs.size)
                put("logs", jsonArray)
            }
            Log.d(TAG, "Response JSON created - success: true, count: ${filteredLogs.size}")
            Log.d(TAG, "Response JSON string length: ${responseJson.toString().length}")
            Log.d(TAG, "Response JSON preview: ${responseJson.toString().take(200)}...")

            Log.d(TAG, "Creating JSON response with Status.OK")
            val response = createJsonResponse(Status.OK, responseJson)
            Log.d(TAG, "=== ACTIVITY LOGS REQUEST END - SUCCESS ===")
            return response
        } catch (e: Exception) {
            Log.e(TAG, "=== ACTIVITY LOGS REQUEST ERROR ===")
            Log.e(TAG, "Error handling activity logs request: ${e.message}", e)
            Log.e(TAG, "Stack trace: ${e.stackTraceToString()}")
            val errorJson = JSONObject().apply {
                put("success", false)
                put("error", e.message ?: "Unknown error")
            }
            Log.d(TAG, "Error response JSON: $errorJson")
            val errorResponse = createJsonResponse(Status.INTERNAL_ERROR, errorJson)
            Log.d(TAG, "=== ACTIVITY LOGS REQUEST END - ERROR ===")
            return errorResponse
        }
    }

    private fun createResponse(status: Status, message: String): NanoHTTPD.Response {
        Log.d(TAG, "Creating plain text response - Status: $status, Message: $message")
        val response = NanoHTTPD.newFixedLengthResponse(status, NanoHTTPD.MIME_PLAINTEXT, message)
        addCommonHeaders(response)
        Log.d(TAG, "Plain text response created")
        return response
    }

    private fun createJsonResponse(status: Status, json: JSONObject): NanoHTTPD.Response {
        Log.d(TAG, "Creating JSON response - Status: $status")
        Log.d(TAG, "JSON content length: ${json.toString().length}")
        Log.d(TAG, "JSON content preview: ${json.toString().take(100)}...")
        val response = NanoHTTPD.newFixedLengthResponse(status, "application/json", json.toString())
        addCommonHeaders(response)
        Log.d(TAG, "JSON response created with headers")
        return response
    }

    private fun addCommonHeaders(response: NanoHTTPD.Response) {
        Log.d(TAG, "Adding common headers...")
        response.addHeader("Access-Control-Allow-Origin", "*") // Enable CORS
        response.addHeader("Connection", "close")
        response.addHeader("Content-Encoding", "identity")
        response.addHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        response.addHeader("Pragma", "no-cache")
        response.addHeader("Expires", "0")
        response.addHeader("Content-Type", "application/json; charset=utf-8")
        response.setChunkedTransfer(false)
        Log.d(TAG, "Headers added: CORS=*, Connection=close, Content-Encoding=identity, Content-Type=application/json; charset=utf-8, ChunkedTransfer=false")
    }
} 