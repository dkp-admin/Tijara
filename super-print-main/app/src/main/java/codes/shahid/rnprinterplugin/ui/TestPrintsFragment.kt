package codes.shahid.rnprinterplugin.ui

import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import codes.shahid.rnprinterplugin.R
import codes.shahid.rnprinterplugin.utils.ServerConfig
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class TestPrintsFragment : Fragment() {
    private val TAG = "TestPrintsFragment"

    private lateinit var tvStatus: TextView
    private lateinit var btnTestReceipt: Button
    private lateinit var btnTestKOT: Button
    private lateinit var btnTestProforma: Button
    private lateinit var btnTestRefund: Button
    private lateinit var btnTestLabel: Button
    private lateinit var btnTestTransactionReport: Button

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_test_prints, container, false)

        // Initialize views
        tvStatus = view.findViewById(R.id.tvStatus)
        btnTestReceipt = view.findViewById(R.id.btnTestReceipt)
        btnTestKOT = view.findViewById(R.id.btnTestKOT)
        btnTestProforma = view.findViewById(R.id.btnTestProforma)
        btnTestRefund = view.findViewById(R.id.btnTestRefund)
        btnTestLabel = view.findViewById(R.id.btnTestLabel)
        btnTestTransactionReport = view.findViewById(R.id.btnTestTransactionReport)

        // Set click listeners
        btnTestReceipt.setOnClickListener {
            sendPrintRequest("RECEIPT")
        }

        btnTestKOT.setOnClickListener {
            sendPrintRequest("KOT")
        }

        btnTestProforma.setOnClickListener {
            sendPrintRequest("PROFORMA")
        }

        btnTestRefund.setOnClickListener {
            sendPrintRequest("REFUND_RECEIPT")
        }

        btnTestLabel.setOnClickListener {
            sendLabelPrintRequest()
        }

        btnTestTransactionReport.setOnClickListener {
            sendTransactionReportRequest()
        }

        return view
    }



    private fun sendPrintRequest(type: String) {
        tvStatus.text = "Sending $type print request..."

        thread {
            try {
                // Create a sample order with minimal data
                val sampleOrder = createSampleOrder()

                // Log the refunds array specifically
                val refundsArray = sampleOrder.optJSONArray("refunds")
                Log.d(TAG, "Refunds array before request: ${refundsArray?.toString(2)}")
                Log.d(TAG, "Full sample order: ${sampleOrder.toString(2)}")

                // Create the complete JSON request body
                val requestBody = JSONObject().apply {
                    put("order", sampleOrder)
                    put("type", type)
                    // Add kitchen ID for KOT prints
                    if (type == "KOT") {
                        put("kitchenId", "1") // For testing, we'll use kitchen ID "1"
                    }
                }

                Log.d(TAG, "Full request body: ${requestBody.toString(2)}")

                val serverUrl = ServerConfig.getServerUrl(requireContext())
                Log.d(TAG, "Using server URL: $serverUrl")

                // First test if the server is reachable with a ping
                var pingSuccess = false
                try {
                    val pingUrl = URL("$serverUrl/ping")
                    val pingConnection = pingUrl.openConnection() as HttpURLConnection
                    pingConnection.connectTimeout = 3000
                    pingConnection.readTimeout = 3000
                    pingConnection.requestMethod = "GET"
                    pingConnection.setRequestProperty("Connection", "close")
                    pingConnection.useCaches = false

                    val pingResponseCode = pingConnection.responseCode
                    if (pingResponseCode == 200) {
                        pingSuccess = true
                        Log.d(TAG, "Server ping successful")
                    }
                    pingConnection.disconnect()
                } catch (e: Exception) {
                    Log.e(TAG, "Server ping failed: ${e.message}")
                }

                if (!pingSuccess) {
                    throw Exception("Could not connect to the print server")
                }

                // Send HTTP request to the local server
                val url = URL("$serverUrl/print")
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 5000
                connection.readTimeout = 5000
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                connection.setRequestProperty("Accept-Charset", "UTF-8")
                connection.setRequestProperty("Connection", "close")
                connection.useCaches = false
                connection.doOutput = true

                // Write the request body with UTF-8 encoding
                val outputStream = connection.outputStream
                val writer = OutputStreamWriter(outputStream, "UTF-8")
                writer.write(requestBody.toString())
                writer.flush()
                writer.close()

                // Get response safely
                var responseCode = 0
                var responseMessage = ""
                var responseBody = ""

                try {
                    responseCode = connection.responseCode
                    responseMessage = connection.responseMessage

                    // Try to read response body if available
                    try {
                        val inputStream = if (responseCode >= 400) connection.errorStream else connection.inputStream
                        if (inputStream != null) {
                            val reader = BufferedReader(InputStreamReader(inputStream, "UTF-8"))
                            val stringBuilder = StringBuilder()
                            var line: String?
                            while (reader.readLine().also { line = it } != null) {
                                stringBuilder.append(line).append("\n")
                            }
                            responseBody = stringBuilder.toString()
                            reader.close()
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error reading response body: ${e.message}")
                    }

                    // Log the response
                    Log.d(TAG, "Response code: $responseCode")
                    Log.d(TAG, "Response message: $responseMessage")
                    if (responseBody.isNotEmpty()) {
                        Log.d(TAG, "Response body: $responseBody")
                    }

                    // Try to parse response as JSON if possible
                    try {
                        val jsonResponse = JSONObject(responseBody)
                        Log.d(TAG, "Parsed response: ${jsonResponse.toString(2)}")

                        // If order was returned in response, check its refunds
                        if (jsonResponse.has("order")) {
                            val orderResponse = jsonResponse.getJSONObject("order")
                            val refundsInResponse = orderResponse.optJSONArray("refunds")
                            Log.d(TAG, "Refunds in response: ${refundsInResponse?.toString(2)}")
                        }
                    } catch (e: Exception) {
                        Log.d(TAG, "Response was not JSON: ${e.message}")
                    }

                } catch (e: Exception) {
                    Log.e(TAG, "Error getting response: ${e.message}", e)
                    responseMessage = "Connection error: ${e.message}"
                } finally {
                    // Always disconnect
                    try {
                        connection.disconnect()
                    } catch (e: Exception) {
                        Log.e(TAG, "Error disconnecting: ${e.message}")
                    }
                }

                // Update UI on main thread
                activity?.runOnUiThread {
                    if (responseCode == 200) {
                        tvStatus.text = "$type print request sent successfully!"
                    } else {
                        try {
                            // Try to parse error message from JSON response
                            if (responseBody.isNotEmpty() && responseBody.contains("error")) {
                                val jsonResponse = JSONObject(responseBody)
                                if (jsonResponse.has("error")) {
                                    tvStatus.text = "Error: ${jsonResponse.getString("error")}"
                                } else {
                                    tvStatus.text = "Error: $responseCode - $responseMessage"
                                }
                            } else {
                                tvStatus.text = "Error: $responseCode - $responseMessage"
                            }
                        } catch (e: Exception) {
                            tvStatus.text = "Error: $responseCode - $responseMessage"
                        }
                    }
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error sending test print: ${e.message}", e)

                activity?.runOnUiThread {
                    tvStatus.text = "Error: ${e.message}"
                }
            }
        }
    }

    private fun sendLabelPrintRequest() {
        tvStatus.text = "Sending label print request..."

        thread {
            try {
                // Create a sample TSC command for testing
                val sampleCommand = """
                    SIZE 4,3
                    GAP 0,0
                    DIRECTION 1
                    CLS
                    TEXT 100,100,"3",0,1,1,"Test Label"
                    BARCODE 100,200,"128",100,1,0,2,2,"12345678"
                    PRINT 1
                """.trimIndent()

                val serverUrl = ServerConfig.getServerUrl(requireContext())

                // First test if the server is reachable with a ping
                var pingSuccess = false
                try {
                    val pingUrl = URL("$serverUrl/ping")
                    val pingConnection = pingUrl.openConnection() as HttpURLConnection
                    pingConnection.connectTimeout = 3000
                    pingConnection.readTimeout = 3000
                    pingConnection.requestMethod = "GET"
                    pingConnection.setRequestProperty("Connection", "close")
                    pingConnection.useCaches = false

                    val pingResponseCode = pingConnection.responseCode
                    if (pingResponseCode == 200) {
                        pingSuccess = true
                        Log.d(TAG, "Server ping successful")
                    }
                    pingConnection.disconnect()
                } catch (e: Exception) {
                    Log.e(TAG, "Server ping failed: ${e.message}")
                }

                if (!pingSuccess) {
                    throw Exception("Could not connect to the print server")
                }

                // Send HTTP request to the local server
                val url = URL("$serverUrl/printLabel")
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 5000
                connection.readTimeout = 5000
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                connection.setRequestProperty("Accept-Charset", "UTF-8")
                connection.setRequestProperty("Connection", "close")
                connection.useCaches = false
                connection.doOutput = true

                // Create the request body
                val requestBody = JSONObject().apply {
                    put("command", sampleCommand)
                }

                // Write the request body
                val outputStream = connection.outputStream
                val writer = OutputStreamWriter(outputStream, "UTF-8")
                writer.write(requestBody.toString())
                writer.flush()
                writer.close()

                // Get the response
                val responseCode = connection.responseCode
                val responseMessage = connection.responseMessage

                // Read the response body
                val responseBody = try {
                    val reader = if (responseCode == HttpURLConnection.HTTP_OK) {
                        BufferedReader(InputStreamReader(connection.inputStream))
                    } else {
                        BufferedReader(InputStreamReader(connection.errorStream))
                    }
                    val response = StringBuilder()
                    var line: String?
                    while (reader.readLine().also { line = it } != null) {
                        response.append(line)
                    }
                    reader.close()
                    response.toString()
                } catch (e: Exception) {
                    ""
                }

                Log.d(TAG, "Response code: $responseCode")
                Log.d(TAG, "Response message: $responseMessage")
                Log.d(TAG, "Response body: $responseBody")

                // Update UI
                activity?.runOnUiThread {
                    if (responseCode == 200) {
                        try {
                            val jsonResponse = JSONObject(responseBody)
                            val printersTotal = jsonResponse.optInt("printersTotal", 0)
                            val printersSucceeded = jsonResponse.optInt("printersSucceeded", 0)
                            tvStatus.text = "Label printed successfully on $printersSucceeded out of $printersTotal printers"
                        } catch (e: Exception) {
                            tvStatus.text = "Label print request sent successfully!"
                        }
                    } else {
                        try {
                            val jsonResponse = JSONObject(responseBody)
                            if (jsonResponse.has("error")) {
                                tvStatus.text = "Error: ${jsonResponse.getString("error")}"
                            } else {
                                tvStatus.text = "Error: $responseCode - $responseMessage"
                            }
                        } catch (e: Exception) {
                            tvStatus.text = "Error: $responseCode - $responseMessage"
                        }
                    }
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error sending test label print: ${e.message}", e)

                activity?.runOnUiThread {
                    tvStatus.text = "Error: ${e.message}"
                }
            }
        }
    }

    private fun sendTransactionReportRequest() {
        tvStatus.text = "Sending transaction report print request..."

        thread {
            try {
                // Create sample transaction data
                val sampleTransactionData = createSampleTransactionData()

                Log.d(TAG, "Full transaction data: ${sampleTransactionData.toString(2)}")

                // Create the complete JSON request body
                val requestBody = JSONObject().apply {
                    put("transactionData", sampleTransactionData)
                    put("type", "TRANSACTION_REPORT")
                }

                Log.d(TAG, "Full request body: ${requestBody.toString(2)}")

                val serverUrl = ServerConfig.getServerUrl(requireContext())
                Log.d(TAG, "Using server URL: $serverUrl")

                // First test if the server is reachable with a ping
                var pingSuccess = false
                try {
                    val pingUrl = URL("$serverUrl/ping")
                    val pingConnection = pingUrl.openConnection() as HttpURLConnection
                    pingConnection.connectTimeout = 3000
                    pingConnection.readTimeout = 3000
                    pingConnection.requestMethod = "GET"
                    pingConnection.setRequestProperty("Connection", "close")
                    pingConnection.useCaches = false

                    val pingResponseCode = pingConnection.responseCode
                    if (pingResponseCode == 200) {
                        pingSuccess = true
                        Log.d(TAG, "Server ping successful")
                    }
                    pingConnection.disconnect()
                } catch (e: Exception) {
                    Log.e(TAG, "Server ping failed: ${e.message}")
                }

                if (!pingSuccess) {
                    throw Exception("Could not connect to the print server")
                }

                // Send HTTP request to the local server
                val url = URL("$serverUrl/print")
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 5000
                connection.readTimeout = 5000
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                connection.setRequestProperty("Accept-Charset", "UTF-8")
                connection.setRequestProperty("Connection", "close")
                connection.useCaches = false
                connection.doOutput = true

                // Write the request body with UTF-8 encoding
                val outputStream = connection.outputStream
                val writer = OutputStreamWriter(outputStream, "UTF-8")
                writer.write(requestBody.toString())
                writer.flush()
                writer.close()

                // Get the response
                val responseCode = connection.responseCode
                val responseMessage = connection.responseMessage

                // Read the response body
                val responseBody = if (responseCode == HttpURLConnection.HTTP_OK) {
                    val reader = BufferedReader(InputStreamReader(connection.inputStream))
                    val response = StringBuilder()
                    var line: String?
                    while (reader.readLine().also { line = it } != null) {
                        response.append(line)
                    }
                    reader.close()
                    response.toString()
                } else {
                    ""
                }

                // Update UI on main thread
                activity?.runOnUiThread {
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        tvStatus.text = "Transaction report print request sent successfully"
                    } else {
                        tvStatus.text = "Error sending transaction report print request: $responseMessage"
                    }
                }

                connection.disconnect()

            } catch (e: Exception) {
                Log.e(TAG, "Error sending transaction report print request: ${e.message}", e)
                activity?.runOnUiThread {
                    tvStatus.text = "Error: ${e.message}"
                }
            }
        }
    }

    private fun createSampleTransactionData(): JSONObject {
        return JSONObject().apply {
            put("printerSize", "3-inch")
            put("userName", "Test User")
            put("locationName", "Test Location")
            put("startDate", "2024-03-01")
            put("endDate", "2024-03-20")
            put("totalRevenue", 5000.00)
            put("netSales", 4500.00)
            put("totalVat", 500.00)
            put("discount", 100.00)

            // Transaction stats
            val txnStatsArray = org.json.JSONArray()
            txnStatsArray.put(JSONObject().apply {
                put("paymentName", "card")
                put("balanceAmount", 2000.00)
                put("noOfPayments", 5)
            })
            txnStatsArray.put(JSONObject().apply {
                put("paymentName", "cash")
                put("balanceAmount", 1500.00)
                put("noOfPayments", 3)
            })
            txnStatsArray.put(JSONObject().apply {
                put("paymentName", "wallet")
                put("balanceAmount", 1000.00)
                put("noOfPayments", 2)
            })
            put("txnStats", txnStatsArray)

            // Payment types
            val paymentTypesArray = org.json.JSONArray()
            paymentTypesArray.put(JSONObject().apply {
                put("name", "card")
                put("status", true)
            })
            paymentTypesArray.put(JSONObject().apply {
                put("name", "cash")
                put("status", true)
            })
            paymentTypesArray.put(JSONObject().apply {
                put("name", "wallet")
                put("status", true)
            })
            put("paymentTypes", paymentTypesArray)

            // Refund data
            put("refundInCard", "150.00")
            put("refundCountInCard", 1)
            put("refundInCash", "50.00")
            put("refundCountInCash", 1)
            put("refundInWallet", "0.00")
            put("refundCountInWallet", 0)

            put("printedOn", "2024-03-20 15:30:00")
            put("printedBy", "Test User")
            put("footer", "Thank you for your business!")
        }
    }

    private fun createSampleOrder(): JSONObject {
        return JSONObject().apply {
            put("_id", "test_${System.currentTimeMillis()}")
            put("orderNum", "TEST-${(Math.random() * 10000).toInt()}")
            put("company", JSONObject().apply {
                put("name", "Coffee House")
            })
            put("companyRef", "comp_87654321")
            put("location", JSONObject().apply {
                put("name", JSONObject().apply {
                    put("en", "Main Branch")
                    put("ar", "الفرع الرئيسي")
                })
                put("address", "King Fahd Road, Riyadh, Saudi Arabia")
                put("vat", "123456789")
                put("phone", "+966501234567")
                put("invoiceFooter", "Thank you for your visit!")
                put("returnPolicy", "Items can be returned within 14 days with receipt")
                put("customText", "Visit us again soon!")
            })
            put("locationRef", "loc_12345")
            put("customer", JSONObject().apply {
                put("name", "John Doe")
                put("vat", "123456789")
                put("phone", "+966501234567")
                put("address", JSONObject().apply {
                    put("street", "King Fahd Road")
                    put("city", "Riyadh")
                    put("country", "Saudi Arabia")
                })
            })
            put("customerRef", "cust_98765")
            put("cashier", JSONObject().apply {
                put("name", "Ahmed Ali")
            })
            put("cashierRef", "emp_54321")
            put("device", JSONObject().apply {
                put("deviceCode", "POS-001")
            })
            put("deviceRef", "dev_12345")
            put("tokenNum", "T45")
            put("orderType", "dine-in")
            put("orderStatus", "completed")
            put("qrOrdering", false)
            put("onlineOrdering", false)
            put("specialInstructions", "Please serve desserts after main course")
            put("table", "Table 5")
            put("kotId", "KOT-2023-0001")
            put("qrCode", "https://example.com/qr/ord_12345678")
            put("changeSize", false)

            // Items array
            val itemsArray = org.json.JSONArray().apply {
                put(JSONObject().apply {
                    put("itemSubTotal", 25.0)
                    put("isOpenPrice", false)
                    put("image", "https://example.com/images/cappuccino.jpg")
                    put("name", JSONObject().apply {
                        put("en", "Cappuccino")
                        put("ar", "كابتشينو")
                    })
                    put("contains", "Milk, Coffee")
                    put("category", JSONObject().apply {
                        put("name", "Hot Drinks")
                    })
                    put("sellingPrice", 25.0)
                    put("total", 20.0)
                    put("qty", 1)
                    put("note", "Extra hot")
                    put("kitchenName", "Bar")
                    put("kotId", "kot_12345")
                    put("printerId", "1")
                    put("modifiers", org.json.JSONArray().apply {
                        put(JSONObject().apply {
                            put("name", "Extra Shot")
                            put("subTotal", 5.0)
                            put("total", 5.75)
                        })
                    })
                })
                put(JSONObject().apply {
                    put("itemSubTotal", 35.0)
                    put("name", JSONObject().apply {
                        put("en", "Cheesecake")
                        put("ar", "تشيز كيك")
                    })
                    put("category", JSONObject().apply {
                        put("name", "Desserts")
                    })
                    put("sellingPrice", 35.0)
                    put("total", 35.0)
                    put("qty", 1)
                    put("note", "")
                    put("kitchenName", "Kitchen")
                    put("printerId", "1")
                    put("modifiers", org.json.JSONArray())
                })
            }
            put("items", itemsArray)

            // Payment info
            put("payment", JSONObject().apply {
                put("billing", JSONObject().apply {
                    put("total", 60.75)
                    put("subTotal", 55.0)
                    put("discount", 5.0)
                    put("discountPercentage", 8.33)
                    put("discountCode", "MORNING10")
                    put("vat", 9.0)
                    put("vatPercentage", 15.0)
                })
                put("charges", org.json.JSONArray().apply {
                    put(JSONObject().apply {
                        put("name", JSONObject().apply {
                            put("en", "Service Charge")
                            put("ar", "رسوم الخدمة")
                        })
                        put("total", 5.5)
                        put("vat", 0.83)
                        put("type", "percentage")
                        put("chargeType", "service")
                        put("value", 10.0)
                        put("chargeId", "charge_12345")
                    })
                })
                put("methods", org.json.JSONArray().apply {
                    put(JSONObject().apply {
                        put("name", "Cash")
                        put("amount", 60.75)
                    })
                })
            })

            // Dine in data
            put("dineInData", JSONObject().apply {
                put("noOfGuests", 2)
                put("tableRef", "table_12345")
                put("table", "Table 5")
                put("sectionRef", "section_12345")
            })

            // Refunds array
            val refundsArray = org.json.JSONArray().apply {
                put(JSONObject().apply {
                    put("reason", "Customer dissatisfaction")
                    put("amount", 20.0)
                    put("referenceNumber", "REF-2023-0001")
                    put("vat", 3.0)
                    put("discountAmount", 0.0)
                    put("discountPercentage", 0.0)
                    put("vatWithoutDiscount", 3.0)
                    put("charges", org.json.JSONArray().apply {
                        put(JSONObject().apply {
                            put("name", JSONObject().apply {
                                put("en", "Service Charge")
                                put("ar", "رسوم الخدمة")
                            })
                            put("chargeId", "charge_12345")
                            put("totalCharge", 2.0)
                            put("totalVatOnCharge", 0.3)
                        })
                    })
                    put("items", org.json.JSONArray().apply {
                        put(JSONObject().apply {
                            put("qty", 1)
                            put("unit", "cup")
                            put("vat", 3.0)
                            put("amount", 20.0)
                            put("nameEn", "Cappuccino")
                            put("nameAr", "كابتشينو")
                            put("kitchenName", "Bar")
                            put("kotId", "kot_12345")
                            put("modifiers", org.json.JSONArray())
                        })
                    })
                    put("refundedTo", org.json.JSONArray().apply {
                        put(JSONObject().apply {
                            put("amount", 20.0)
                            put("refundTo", "Cash")
                        })
                    })
                    put("cashier", JSONObject().apply {
                        put("name", "Ahmed Ali")
                    })
                    put("date", java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(java.util.Date()))
                })
            }
            put("refunds", refundsArray)

            // Additional fields
            put("createdAt", java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(java.util.Date()))
            put("updatedAt", java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(java.util.Date()))
            put("acceptedAt", java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(java.util.Date()))
            put("receivedAt", java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(java.util.Date()))
            put("source", "local")
            put("appliedDiscount", true)
            val paymentMethodArray = org.json.JSONArray().apply {
                put("Cash")
            }
            put("paymentMethod", paymentMethodArray)
            put("refundAvailable", true)
            put("currency", "SAR")
        }
    }

    private fun isEmulator(): Boolean {
        return (Build.PRODUCT.contains("sdk") || Build.PRODUCT.contains("gphone") || Build.PRODUCT.contains("emulator"))
    }
}