package codes.shahid.rnprinterplugin.server.controller

import android.content.Context
import android.util.Log
import android.os.Handler
import android.os.Looper
import com.example.tscdll.TSCUSBActivity
import fi.iki.elonen.NanoHTTPD
import fi.iki.elonen.NanoHTTPD.Response.Status
import org.json.JSONObject
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine
import kotlinx.coroutines.runBlocking

class LabelPrintController : BaseController {
    companion object {
        private const val TAG = "LabelPrintController"
    }

    override fun handle(session: NanoHTTPD.IHTTPSession, context: Context): NanoHTTPD.Response {
        if (session.method != NanoHTTPD.Method.POST) {
            Log.w(TAG, "Invalid method: ${session.method}")
            return createResponse(Status.METHOD_NOT_ALLOWED, "Method Not Allowed")
        }

        val files = HashMap<String, String>()
        return try {
            session.parseBody(files)
            val body = files["postData"] ?: return createResponse(Status.BAD_REQUEST, "No POST data")

            val json = JSONObject(body)
            val command = json.optString("command", "")

            if (command.isEmpty()) {
                return createJsonResponse(
                    Status.BAD_REQUEST,
                    JSONObject().apply {
                        put("success", false)
                        put("error", "Missing command")
                    }
                )
            }

            Log.d(TAG, "Label print request received")
            
            try {
                // Get printers that have barcodes enabled
                val printerDao = codes.shahid.rnprinterplugin.database.PrinterDao(context)
                val barcodePrinters = printerDao.getAllPrinters().filter { it.enableBarcodes }
                
                if (barcodePrinters.isEmpty()) {
                    return createJsonResponse(
                        Status.BAD_REQUEST,
                        JSONObject().apply {
                            put("success", false)
                            put("error", "No printers with barcode printing enabled")
                        }
                    )
                }

                // Get USB manager
                val usbManager = context.getSystemService(Context.USB_SERVICE) as android.hardware.usb.UsbManager
                val connectedDevices = usbManager.deviceList
                
                var printedCount = 0
                val errors = mutableListOf<String>()

                // Run the printing operations on the main thread
                runBlocking {
                    suspendCoroutine { continuation ->
                        Handler(Looper.getMainLooper()).post {
                            try {
                                // Try to print on each barcode-enabled printer
                                barcodePrinters.forEach { printer ->
                                    try {
                                        // Find matching USB device
                                        val device = connectedDevices.values.find { it.vendorId.toString() == printer.vendorId }
                                        if (device != null) {
                                            val TscUsb = TSCUSBActivity()
                                            TscUsb.openport(usbManager, device)
                                            TscUsb.sendcommand(command)
                                            TscUsb.closeport(3000)
                                            printedCount++
                                        } else {
                                            errors.add("USB device not connected for printer: ${printer.name}")
                                        }
                                    } catch (e: Exception) {
                                        Log.e(TAG, "Error printing on ${printer.name}: ${e.message}", e)
                                        errors.add("Failed to print on ${printer.name}: ${e.message}")
                                    }
                                }
                                continuation.resume(Unit)
                            } catch (e: Exception) {
                                Log.e(TAG, "Error in main thread execution: ${e.message}", e)
                                errors.add("Main thread execution error: ${e.message}")
                                continuation.resume(Unit)
                            }
                        }
                    }
                }

                return createJsonResponse(
                    if (printedCount > 0) Status.OK else Status.BAD_REQUEST,
                    JSONObject().apply {
                        put("success", printedCount > 0)
                        put("printersTotal", barcodePrinters.size)
                        put("printersSucceeded", printedCount)
                        put("printersFailed", barcodePrinters.size - printedCount)
                        if (errors.isNotEmpty()) {
                            put("errors", errors)
                        }
                    }
                )

            } catch (e: Exception) {
                Log.e(TAG, "Error printing label: ${e.message}", e)
                return createJsonResponse(
                    Status.INTERNAL_ERROR,
                    JSONObject().apply {
                        put("success", false)
                        put("error", "Error printing label: ${e.message}")
                    }
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling request: ${e.message}", e)
            return createJsonResponse(
                Status.INTERNAL_ERROR,
                JSONObject().apply {
                    put("success", false)
                    put("error", "Internal server error: ${e.message}")
                }
            )
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