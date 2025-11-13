package codes.shahid.rnprinterplugin.server.controller

import android.content.Context
import android.util.Log
import codes.shahid.rnprinterplugin.queue.PrinterQueue
import fi.iki.elonen.NanoHTTPD
import fi.iki.elonen.NanoHTTPD.Response.Status
import org.json.JSONObject

class ClearStuckJobsController : BaseController {
    companion object {
        private const val TAG = "ClearStuckJobsController"
        private const val LAN_RECOVERY_DEBUG_TAG = "LAN_RECOVERY_DEBUG"
    }

    override fun handle(session: NanoHTTPD.IHTTPSession, context: Context): NanoHTTPD.Response {
        return when (session.method) {
            NanoHTTPD.Method.POST -> handleClearStuckJobs(context)
            else -> {
                Log.w(TAG, "Invalid method: ${session.method}")
                createResponse(Status.METHOD_NOT_ALLOWED, "Method Not Allowed")
            }
        }
    }

    private fun handleClearStuckJobs(context: Context): NanoHTTPD.Response {
        return try {
            Log.i(LAN_RECOVERY_DEBUG_TAG, "🚨 Manual recovery requested - clearing stuck jobs and resetting LAN connections")
            val printerQueue = PrinterQueue.getInstance(context)
            val result = printerQueue.clearStuckJobsAndResetLanConnections()

            Log.i(LAN_RECOVERY_DEBUG_TAG, "📊 Recovery result: ${result["message"]}")

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
            createResponse(Status.INTERNAL_ERROR, "Error clearing stuck jobs: ${e.message}")
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
