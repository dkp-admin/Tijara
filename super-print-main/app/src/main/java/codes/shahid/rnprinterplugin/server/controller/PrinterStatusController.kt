package codes.shahid.rnprinterplugin.server.controller

import android.content.Context
import android.util.Log
import codes.shahid.rnprinterplugin.database.PrinterDao
import codes.shahid.rnprinterplugin.printer.PrinterManager
import codes.shahid.rnprinterplugin.types.Printer
import fi.iki.elonen.NanoHTTPD
import fi.iki.elonen.NanoHTTPD.Response.Status
import org.json.JSONArray
import org.json.JSONObject

class PrinterStatusController : BaseController {
    companion object {
        private const val TAG = "PrinterStatusController"
    }

    override fun handle(session: NanoHTTPD.IHTTPSession, context: Context): NanoHTTPD.Response {
        return when (session.method) {
            NanoHTTPD.Method.GET -> handleGetPrinters(context)
            else -> {
                Log.w(TAG, "Invalid method: ${session.method}")
                createResponse(Status.METHOD_NOT_ALLOWED, "Method Not Allowed")
            }
        }
    }

    private fun handleGetPrinters(context: Context): NanoHTTPD.Response {
        return try {
            val printerDao = PrinterDao(context)
            val printerManager = PrinterManager(context)
            val printers = printerDao.getAllPrinters()
            
            Log.d(TAG, "Found ${printers.size} configured printers")
            
            val printersArray = JSONArray()
            
            for (printer in printers) {
                val printerJson = JSONObject().apply {
                    put("id", printer.id)
                    put("name", printer.name)
                    put("deviceName", printer.deviceName)
                    put("deviceId", printer.deviceId)
                    put("productId", printer.productId)
                    put("vendorId", printer.vendorId)
                    put("macAddress", printer.macAddress)
                    put("printerType", printer.printerType)
                    put("printerSize", printer.printerSize)
                    put("ip", printer.ip)
                    put("port", printer.port)
                    put("enableReceipts", printer.enableReceipts)
                    put("enableKOT", printer.enableKOT)
                    put("enableBarcodes", printer.enableBarcodes)
                    put("printerWidthMM", printer.printerWidthMM)
                    put("charsPerLine", printer.charsPerLine)
                    put("kitchenRef", printer.kitchenRef ?: "")
                    put("kitchenIds", printer.kitchenIds)
                    put("model", printer.model)
                    put("numberOfPrints", printer.numberOfPrints)
                    put("numberOfKotPrints", printer.numberOfKotPrints)
                    
                    // Get printer status
                    val statusInfo = getPrinterStatus(printer, printerManager)
                    put("status", statusInfo["status"])
                    put("statusMessage", statusInfo["message"])
                    put("isConnected", statusInfo["isConnected"])
                    put("lastChecked", System.currentTimeMillis())
                }
                printersArray.put(printerJson)
            }
            
            createJsonResponse(
                Status.OK,
                JSONObject().apply {
                    put("success", true)
                    put("printers", printersArray)
                    put("totalCount", printers.size)
                    put("timestamp", System.currentTimeMillis())
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error getting printer status: ${e.message}", e)
            createJsonResponse(
                Status.INTERNAL_ERROR,
                JSONObject().apply {
                    put("success", false)
                    put("error", "Error getting printer status: ${e.message}")
                    put("timestamp", System.currentTimeMillis())
                }
            )
        }
    }

    private fun getPrinterStatus(printer: Printer, printerManager: PrinterManager): Map<String, Any> {
        return try {
            val printerInstance = printerManager.createPrinter(printer)
            
            if (printerInstance == null) {
                mapOf(
                    "status" to "unknown_type",
                    "message" to "Unknown printer type: ${printer.printerType}",
                    "isConnected" to false
                )
            } else {
                val statusMessage = printerInstance.getPrinterStatus()
                val isConnected = statusMessage.contains("Connected", ignoreCase = true)
                
                mapOf(
                    "status" to if (isConnected) "connected" else "disconnected",
                    "message" to statusMessage,
                    "isConnected" to isConnected
                )
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error checking status for printer ${printer.name}: ${e.message}")
            mapOf(
                "status" to "error",
                "message" to "Error checking status: ${e.message}",
                "isConnected" to false
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
        response.addHeader("Access-Control-Allow-Origin", "*")
        response.addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.setChunkedTransfer(false)
    }
}
