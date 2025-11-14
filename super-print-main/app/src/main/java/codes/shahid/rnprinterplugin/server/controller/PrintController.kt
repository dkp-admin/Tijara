package codes.shahid.rnprinterplugin.server.controller

import android.content.Context
import android.util.Log
import codes.shahid.rnprinterplugin.queue.PrintJobType
import codes.shahid.rnprinterplugin.queue.PrinterQueue
import codes.shahid.rnprinterplugin.types.Order
import codes.shahid.rnprinterplugin.database.PrinterDao
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializer
import com.google.gson.reflect.TypeToken
import fi.iki.elonen.NanoHTTPD
import fi.iki.elonen.NanoHTTPD.Response.Status
import org.json.JSONObject
import readUtf8Body
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class PrintController : BaseController {
    companion object {
        private const val TAG = "PrintController"
    }

    override fun handle(session: NanoHTTPD.IHTTPSession, context: Context): NanoHTTPD.Response {
        if (session.method != NanoHTTPD.Method.POST) {
            Log.w(TAG, "Invalid method: ${session.method}")
            return createResponse(Status.METHOD_NOT_ALLOWED, "Method Not Allowed")
        }

        val files = HashMap<String, String>()
        return try {

            val body = readUtf8Body(session) // ✅ reads and decodes correctly
            Log.d("PrintController", "Body: $body") // Arabic text should print fine here

            val json = JSONObject(body)
            val orderJson = json.optString("order", "")
            val printType = json.optString("type", "RECEIPT")


            Log.d(TAG, "Print request received: type=$printType")
            Log.d(TAG, "Order data: $orderJson")
            
            try {
                // Create Gson instance with custom date deserializer for proper UTC handling
                val gson = GsonBuilder()
                    .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
                    .registerTypeAdapter(Date::class.java, JsonDeserializer<Date> { json, _, _ ->
                        try {
                            val dateString = json.asString
                            val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                            format.timeZone = TimeZone.getTimeZone("UTC")
                            format.parse(dateString)
                        } catch (e: Exception) {
                            Log.e(TAG, "Error parsing date: ${json.asString}", e)
                            Date()
                        }
                    })
                    .setLenient()
                    .create()
                
                // Parse the complete order object
                val order: Order? = if (!orderJson.isNullOrBlank()) {
                    gson.fromJson(orderJson, Order::class.java)
                } else null

                val transactionJson = json.optString("transactionData", null)
                val transactionData: Map<String, Any>? = if (!transactionJson.isNullOrBlank()) {
                    val type = object : TypeToken<Map<String, Any>>() {}.type
                    gson.fromJson<Map<String, Any>>(transactionJson, type)
                } else null

                Log.d(TAG, "Parsed order: $order")
                
                // Determine print job type
                val jobType = when (printType.uppercase()) {
                    "RECEIPT" -> PrintJobType.RECEIPT
                    "REFUND_RECEIPT" -> PrintJobType.REFUND_RECEIPT
                    "KOT" -> PrintJobType.KOT
                    "PROFORMA" -> PrintJobType.PROFORMA
                    "TRANSACTION_REPORT"->PrintJobType.TRANSACTION_REPORT
                    else -> PrintJobType.RECEIPT
                }
                
                // Add to print queue
                val printerQueue = PrinterQueue.getInstance(context)
                
                // Check if printers exist before trying to add to queue
                val printerDao = codes.shahid.rnprinterplugin.database.PrinterDao(context)
                val printers = printerDao.getAllPrinters()
                
                if (printers.isEmpty()) {
                    Log.w(TAG, "No printers configured in the system")
                    return createJsonResponse(
                        Status.BAD_REQUEST,
                        JSONObject().apply {
                            put("success", false)
                            put("error", "No printers configured. Please add a printer first.")
                        }
                    )
                }

                // For KOT prints, filter printers based on items' printer IDs
                val targetPrinters = if (jobType == PrintJobType.KOT) {
                    // Extract unique printer IDs from order items
                    val orderJson = JSONObject(orderJson)
                    val items = orderJson.optJSONArray("items") ?: JSONObject().optJSONArray("items") ?: org.json.JSONArray()
                    val printerIds = mutableSetOf<String>()
                    
                    for (i in 0 until items.length()) {
                        val item = items.getJSONObject(i)
                        val printerId = item.optString("printerId")
                        if (!printerId.isNullOrEmpty()) {
                            printerIds.add(printerId)
                        }
                    }

                    Log.d(TAG, "Found printer IDs in order items: $printerIds")

                    if (printerIds.isEmpty()) {
                        // If no printer IDs specified, use all KOT-enabled printers
                        printers.filter { it.enableKOT }
                    } else {
                        // Filter printers based on kitchen IDs
                        printers.filter { printer ->
                            printer.enableKOT && (
                                printer.kitchenIds.isEmpty() || // If no kitchen IDs specified, use for all
                                printer.kitchenIds.split(",").map { it.trim() }.any { it in printerIds }
                            )
                        }
                    }
                } else {
                    // For non-KOT prints, use all printers
                    printers
                }

                if (targetPrinters.isEmpty()) {
                    Log.w(TAG, "No suitable printers found for this print job")
                    return createJsonResponse(
                        Status.BAD_REQUEST,
                        JSONObject().apply {
                            put("success", false)
                            put("error", "No suitable printers found for this print job")
                        }
                    )
                }
                
                // For KOT prints, we'll need to group items by printer
                val result = when (jobType) {
                    PrintJobType.KOT -> {
                    val orderObj = JSONObject(orderJson)
                    val items = orderObj.optJSONArray("items") ?: org.json.JSONArray()
                    val itemsByPrinter = mutableMapOf<String?, MutableList<JSONObject>>()
                    
                    // Group items by printer ID
                    for (i in 0 until items.length()) {
                        val item = items.getJSONObject(i)
                        val printerId = item.optString("printerId", null)
                        itemsByPrinter.getOrPut(printerId) { mutableListOf() }.add(item)
                    }
                    
                    // Create separate print jobs for each printer's items
                    var overallSuccess = true
                    val allJobIds = mutableListOf<String>()
                    val allAddedJobs = mutableListOf<Map<String, Any>>()
                    
                    // First handle items with specific printer IDs
                    itemsByPrinter.forEach { (printerId, printerItems) ->
                        if (printerId != null) {
                            // Find printers that match this printer ID (supports comma-separated kitchen IDs)
                            val matchingPrinters = printers.filter { printer ->
                                printer.enableKOT && (
                                    printer.kitchenIds.split(",").map { it.trim() }.contains(printerId) || // Check if printer's kitchen IDs contain this printerId
                                    printer.kitchenRef == printerId    // Also check kitchenRef for backward compatibility
                                )
                            }

                            if (matchingPrinters.isNotEmpty()) {
                                // Create a new order object with only this printer's items
                                val printerOrder = orderObj.copy()
                                printerOrder.put("items", org.json.JSONArray(printerItems))

                                // Add to queue for each matching printer
                                matchingPrinters.forEach { printer ->
                                    val printerResult = printerQueue.addToQueue(printer.id, jobType, gson.fromJson(printerOrder.toString(), Order::class.java), null, printerId)
                                        
                                        if (printerResult["success"] as Boolean) {
                                            val jobId = printerResult["jobId"]?.toString() ?: ""
                                            allJobIds.add(jobId)
                                            allAddedJobs.add(mapOf<String, Any>(
                                                "jobId" to jobId,
                                                "printerId" to printer.id,
                                                "printerName" to printer.name,
                                                "kitchenId" to (null as? String ?: "")
                                            ))
                                        } else {
                                            overallSuccess = false
                                        }
                                    }
                                } else {
                                    overallSuccess = false
                                }
                            }
                        }

                        // Then handle items without printer IDs (send to all KOT-enabled printers without kitchen assignments)
                        val unassignedItems = itemsByPrinter[null]
                        if (!unassignedItems.isNullOrEmpty()) {
                            // Get all KOT-enabled printers that don't have kitchen assignments
                            val defaultKotPrinters = printers.filter { printer -> 
                                printer.enableKOT && 
                                (printer.kitchenIds.isNullOrEmpty() || printer.kitchenIds.isBlank()) &&
                                (printer.kitchenRef.isNullOrEmpty() || printer.kitchenRef.isBlank())
                            }

                            if (defaultKotPrinters.isNotEmpty()) {
                                val unassignedOrder = orderObj.copy()
                                unassignedOrder.put("items", org.json.JSONArray(unassignedItems))
                                
                                // Add to queue for each default KOT printer
                                defaultKotPrinters.forEach { printer ->
                                    val printerResult = printerQueue.addToQueue(printer.id, jobType, gson.fromJson(unassignedOrder.toString(), Order::class.java), null, null)
                                    
                                    if (printerResult["success"] as Boolean) {
                                        val jobId = printerResult["jobId"]?.toString() ?: ""
                                        allJobIds.add(jobId)
                                        allAddedJobs.add(mapOf<String, Any>(
                                            "jobId" to jobId,
                                            "printerId" to printer.id,
                                            "printerName" to printer.name,
                                            "kitchenId" to (null as? String ?: "")
                                        ))
                                    } else {
                                        overallSuccess = false
                                    }
                                }
                            } else {
                                Log.w(TAG, "No default KOT printers found (printers without kitchen assignments)")
                            overallSuccess = false
                        }
                    }
                    
                    mapOf(
                        "success" to overallSuccess,
                        "jobIds" to allJobIds,
                        "addedJobs" to allAddedJobs
                    )
                }
                    PrintJobType.TRANSACTION_REPORT -> {
                    Log.d(TAG,"adding to queue $transactionData.toString()")
                        val queueResult = printerQueue.addToQueue(jobType, null, transactionData, null)
                        mapOf(
                            "success" to (queueResult["success"] as Boolean),
                            "jobIds" to listOfNotNull(queueResult["jobId"]),
                            "addedJobs" to listOf(mapOf(
                                "jobId" to (queueResult["jobId"] ?: ""),
                                "error" to (queueResult["error"] ?: "")
                            ))
                        )
                }
                    else -> {
                    // For non-KOT prints, process normally
                        val queueResult = printerQueue.addToQueue(jobType, order!!, null)
                        mapOf(
                            "success" to (queueResult["success"] as Boolean),
                            "jobIds" to listOfNotNull(queueResult["jobId"]),
                            "addedJobs" to listOf(mapOf(
                                "jobId" to (queueResult["jobId"] ?: ""),
                                "error" to (queueResult["error"] ?: "")
                            ))
                        )
                    }
                }
                
                return createJsonResponse(
                    Status.OK,
                    JSONObject().apply {
                        put("success", result["success"])
                        if (result["success"] as Boolean) {
                            put("message", "Print job added to queue")
                            put("jobIds", result["jobIds"])
                            put("addedJobs", result["addedJobs"])
                        } else {
                            put("error", result["error"])
                        }
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error processing print request: ${e.message}", e)
                return createResponse(Status.BAD_REQUEST, "Invalid order data: ${e.message}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing POST: ${e.message}", e)
            return createResponse(Status.BAD_REQUEST, "Invalid Request")
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

    // Extension function to copy a JSONObject
    private fun JSONObject.copy(): JSONObject {
        return JSONObject(this.toString())
    }
} 