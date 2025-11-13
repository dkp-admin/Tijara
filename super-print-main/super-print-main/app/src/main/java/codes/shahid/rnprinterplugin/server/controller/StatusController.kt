package codes.shahid.rnprinterplugin.server.controller

import android.content.Context
import android.util.Log
import codes.shahid.rnprinterplugin.queue.PrinterQueue
import fi.iki.elonen.NanoHTTPD
import fi.iki.elonen.NanoHTTPD.Response.Status
import org.json.JSONObject

class StatusController : BaseController {
    companion object {
        private const val TAG = "StatusController"
    }

    override fun handle(session: NanoHTTPD.IHTTPSession, context: Context): NanoHTTPD.Response {
        return when (session.method) {
            NanoHTTPD.Method.GET -> handleGetStatus(context)
            NanoHTTPD.Method.POST -> handleRefreshQueues(context)
            else -> {
                Log.w(TAG, "Invalid method: ${session.method}")
                createResponse(Status.METHOD_NOT_ALLOWED, "Method Not Allowed")
            }
        }
    }

    private fun handleGetStatus(context: Context): NanoHTTPD.Response {
        return try {
            val printerQueue = PrinterQueue.getInstance(context)
            val status = printerQueue.getQueueStatus()

            createJsonResponse(
                Status.OK,
                JSONObject().apply {
                    put("isRunning", status["isRunning"])
                    put("totalJobs", status["totalJobs"])
                    put("pendingJobs", status["pendingJobs"])
                    put("processingJobs", status["processingJobs"])
                    put("completedJobs", status["completedJobs"])
                    put("failedJobs", status["failedJobs"])
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error getting queue status: ${e.message}", e)
            createResponse(Status.INTERNAL_ERROR, "Error getting queue status")
        }
    }

    private fun handleRefreshQueues(context: Context): NanoHTTPD.Response {
        return try {
            val printerQueue = PrinterQueue.getInstance(context)
            val result = printerQueue.refreshPrinterQueues()

            createJsonResponse(
                Status.OK,
                JSONObject().apply {
                    put("success", result["success"])
                    put("message", result["message"])
                    if (result.containsKey("activeQueues")) {
                        put("activeQueues", result["activeQueues"])
                    }
                    if (result.containsKey("error")) {
                        put("error", result["error"])
                    }
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error refreshing printer queues: ${e.message}", e)
            createResponse(Status.INTERNAL_ERROR, "Error refreshing printer queues")
        }
    }

    private fun handleClearStuckJobs(context: Context): NanoHTTPD.Response {
        return try {
            val printerQueue = PrinterQueue.getInstance(context)
            val result = printerQueue.clearStuckJobsAndResetLanConnections()

            createJsonResponse(
                Status.OK,
                JSONObject().apply {
                    put("success", result["success"])
                    put("message", result["message"])
                    if (result.containsKey("clearedJobs")) {
                        put("clearedJobs", result["clearedJobs"])
                    }
                    if (result.containsKey("resetPrinters")) {
                        put("resetPrinters", result["resetPrinters"])
                    }
                    if (result.containsKey("error")) {
                        put("error", result["error"])
                    }
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing stuck jobs: ${e.message}", e)
            createResponse(Status.INTERNAL_ERROR, "Error clearing stuck jobs")
        }
    }

    private fun createResponse(status: Status, message: String): NanoHTTPD.Response {
        val response = NanoHTTPD.newFixedLengthResponse(status, NanoHTTPD.MIME_PLAINTEXT, message)
        addCommonHeaders(response)
        return response
    }

    private fun createJsonResponse(status: Status, json: JSONObject): NanoHTTPD.Response {
        val response = NanoHTTPD.newFixedLengthResponse(status, "application/json", json.toString())
        addCommonHeaders(response)
        return response
    }

    private fun addCommonHeaders(response: NanoHTTPD.Response) {
        response.addHeader("Connection", "close")
        response.addHeader("Content-Encoding", "identity")
        response.setChunkedTransfer(false)
    }
} 