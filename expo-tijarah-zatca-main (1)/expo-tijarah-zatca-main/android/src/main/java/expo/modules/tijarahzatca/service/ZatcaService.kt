package expo.modules.tijarahzatca.service

import android.content.Context
import android.util.Base64
import android.util.Log
import com.google.gson.Gson
import expo.modules.tijarahzatca.templates.SimplifiedTaxInvoiceTemplate
import expo.modules.tijarahzatca.types.Company
import expo.modules.tijarahzatca.types.DeviceInfo
import expo.modules.tijarahzatca.types.EGSUnitInfo
import expo.modules.tijarahzatca.types.EGSUnitLocation
import expo.modules.tijarahzatca.types.Location
import expo.modules.tijarahzatca.types.Order
import expo.modules.tijarahzatca.types.ZATCAInvoiceTypes
import expo.modules.tijarahzatca.types.ZATCAPaymentMethods
import expo.modules.tijarahzatca.types.ZATCASimplifiedInvoiceCancelation
import expo.modules.tijarahzatca.types.ZATCASimplifiedInvoiceLineItem
import expo.modules.tijarahzatca.utils.GenerateSignatureXMLParams
import expo.modules.tijarahzatca.utils.InvoiceHelper
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import expo.modules.tijarahzatca.utils.SigningUtils
import expo.modules.tijarahzatca.utils.addXMLElements
import expo.modules.tijarahzatca.utils.cleanUpCertificateString
import org.json.JSONObject
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class ZatcaService(private val context: Context) {
    companion object {
        private const val TAG = "TJZatca"
    }

    private val privateKeyCache = mutableMapOf<String, String>()
    private val gson = Gson()

    // Configuration properties
    private var baseHost: String = "qa-k8s.tisostudio.com"
    private var authToken: String = ""
    private var deviceCode: String = ""

    // Hardcoded Saudi timezone for ZATCA compliance
    private val SAUDI_TIMEZONE = "Asia/Riyadh"

    /**
     * Converts UTC date/time to Saudi timezone
     * @param utcDateTime UTC date time string in ISO format
     * @return Pair of (date, time) in Saudi timezone
     */
    private fun convertUtcToSaudiTime(utcDateTime: String): Pair<String, String> {
        return try {
            Log.d(TAG, "Converting UTC datetime: '$utcDateTime'")
            // Handle different UTC formats: with/without milliseconds and Z suffix
            val utcFormats = listOf(
                SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                },
                SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                },
                SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                },
                SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }
            )

            val saudiDateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
                timeZone = TimeZone.getTimeZone(SAUDI_TIMEZONE)
            }
            val saudiTimeFormat = SimpleDateFormat("HH:mm:ss", Locale.US).apply {
                timeZone = TimeZone.getTimeZone(SAUDI_TIMEZONE)
            }

            val date = if (utcDateTime.contains("T")) {
                // Try different UTC formats until one works
                var parsedDate: Date? = null
                for (format in utcFormats) {
                    try {
                        parsedDate = format.parse(utcDateTime)
                        Log.d(TAG, "Successfully parsed with format: ${format.toPattern()}")
                        break
                    } catch (e: Exception) {
                        Log.d(TAG, "Failed to parse with format: ${format.toPattern()}")
                    }
                }
                parsedDate
            } else {
                // If no time part, assume start of day in UTC
                val dateOnlyFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }
                dateOnlyFormat.parse(utcDateTime)
            }

            val saudiDate = saudiDateFormat.format(date ?: Date())
            val saudiTime = saudiTimeFormat.format(date ?: Date())

            Log.d(TAG, "Converted UTC '$utcDateTime' to Saudi date: '$saudiDate', time: '$saudiTime'")
            Pair(saudiDate, saudiTime)
        } catch (e: Exception) {
            Log.w(TAG, "Failed to convert UTC time to Saudi timezone: ${e.message}")
            // Fallback to current time in Saudi timezone
            val now = Date()
            val saudiDateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
                timeZone = TimeZone.getTimeZone(SAUDI_TIMEZONE)
            }
            val saudiTimeFormat = SimpleDateFormat("HH:mm:ss", Locale.US).apply {
                timeZone = TimeZone.getTimeZone(SAUDI_TIMEZONE)
            }
            Pair(saudiDateFormat.format(now), saudiTimeFormat.format(now))
        }
    }

    /**
     * Test function to verify timezone conversion
     * @param utcDateTime UTC datetime string to test
     * @return Map with conversion results
     */
    fun testTimezoneConversion(utcDateTime: String): Map<String, Any> {
        return try {
            val (saudiDate, saudiTime) = convertUtcToSaudiTime(utcDateTime)
            mapOf(
                "success" to true as Any,
                "input_utc" to utcDateTime as Any,
                "saudi_date" to saudiDate as Any,
                "saudi_time" to saudiTime as Any,
                "saudi_datetime" to "${saudiDate}T${saudiTime}" as Any,
                "timezone" to SAUDI_TIMEZONE as Any
            )
        } catch (e: Exception) {
            Log.e(TAG, "Timezone conversion test failed: ${e.message}")
            mapOf(
                "success" to false as Any,
                "error" to (e.message ?: "Unknown error") as Any,
                "input_utc" to utcDateTime as Any
            )
        }
    }

    /**
     * Initialize the ZATCA service with configuration
     * @param env Environment ("qa" or "production")
     * @param authToken Authentication token for API calls
     * @param deviceCode Device code for private key fetching
     */
    fun initializeConfig(env: String, authToken: String, deviceCode: String): Map<String, Any> {
        try {
            // Set host based on environment
            this.baseHost = when (env.lowercase()) {
                "qa" -> "qa-k8s.tisostudio.com"
                "production" -> "be.tijarah360.com"
                else -> throw IllegalArgumentException("Invalid environment. Use 'qa' or 'production'")
            }

            this.authToken = authToken
            this.deviceCode = deviceCode

            Log.i(TAG, "ZATCA service initialized with env: $env, host: ${this.baseHost}")

            // Fetch and store private key
            val privateKey = fetchPrivateKeyFromEndpoint(deviceCode)

            return mapOf(
                "success" to true,
                "environment" to env,
                "host" to this.baseHost,
                "deviceCode" to deviceCode,
                "privateKeyStored" to true
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize ZATCA config: ${e.message}")
            throw Exception("ZATCA_INIT_ERROR: ${e.message}", e)
        }
    }

    fun generateInvoice(
        invoiceType: ZATCAInvoiceTypes,
        egsunit: EGSUnitInfo,
        order: Order
    ): String {
        val openItemId = "default_open_item_id"

        val line_items = order.items.map { item ->
            val nameEn = item.name["en"] ?: ""
            val sellingPrice = (item.variant["sellingPrice"] as? Number)?.toDouble() ?: 0.0
            val vatPercentage = (item.billing["vatPercentage"] as? Number)?.toDouble() ?: 15.0

            ZATCASimplifiedInvoiceLineItem(
                id = item.productRef ?: openItemId,
                name = nameEn,
                quantity = item.quantity,
                tax_exclusive_price = sellingPrice,
                VAT_percent = vatPercentage,
                other_taxes = emptyList(),
                discounts = emptyList()
            )
        }

        val refund_items = if (order.refunds.isNotEmpty()) {
            order.refunds[0].items.map { refundItem ->
                val originalItem = order.items.find { it.productRef == refundItem._id }
                val nameEn = refundItem.name["en"] ?: ""
                val sellingPrice =
                    (originalItem?.variant?.get("sellingPrice") as? Number)?.toDouble()
                        ?: refundItem.amount
                val vatPercentage =
                    (originalItem?.billing?.get("vatPercentage") as? Number)?.toDouble() ?: 15.0

                ZATCASimplifiedInvoiceLineItem(
                    id = originalItem?.productRef ?: openItemId,
                    name = nameEn,
                    quantity = refundItem.qty,
                    tax_exclusive_price = sellingPrice,
                    VAT_percent = vatPercentage,
                    other_taxes = emptyList(),
                    discounts = emptyList()
                )
            }
        } else {
            emptyList()
        }

        // Convert UTC date/time to Saudi timezone for ZATCA compliance
        val (saudiDate, saudiTime) = convertUtcToSaudiTime(order.createdAt)
        val issueDate = saudiDate
        val issueTime = if (order.createdAtTime.isNullOrEmpty()) saudiTime else order.createdAtTime
        val previousInvoiceHash =
            order.previous_invoice_hash ?: "suHTSOXvxjYRs0sk041MZvMaxSJ9UWWWfMpS0mo/JKA="

        val cancellation = if (invoiceType == ZATCAInvoiceTypes.CREDIT_NOTE && order.refunds.isNotEmpty()) {
            val canceledInvoiceNumber = order.refunds.firstOrNull()?.referenceNumber?.toIntOrNull() ?: 0
            ZATCASimplifiedInvoiceCancelation(
                canceled_invoice_number = canceledInvoiceNumber,
                payment_method = ZATCAPaymentMethods.CREDIT, // Default to credit for refunds
                cancelation_type = ZATCAInvoiceTypes.CREDIT_NOTE,
                reason = order.refunds.firstOrNull()?.reason ?: "Refund"
            )
        } else null

        var invoice_xml = SimplifiedTaxInvoiceTemplate.populate(
            egsInfo = egsunit,
            invoiceCounterNumber = order.invoiceSequence,
            invoiceSerialNumber = order.orderNum,
            issueDate = issueDate,
            issueTime = issueTime,
            previousInvoiceHash = previousInvoiceHash,
            invoiceType = invoiceType,
            cancellation = cancellation
        )

        var total_taxes = 0.0
        var total_subtotal = 0.0
        val itemsArray =
            if (invoiceType == ZATCAInvoiceTypes.CREDIT_NOTE) refund_items else line_items

        val invoice_line_items = mutableListOf<Map<String, Any>>()
        itemsArray.forEach { line_item ->
            val result = InvoiceHelper.constructLineItem(line_item)
            total_taxes += String.format("%.2f", result.line_item_totals.taxes_total).toDouble()
            total_subtotal += String.format("%.2f", result.line_item_totals.subtotal).toDouble()
            invoice_line_items.add(result.line_item_xml)
        }

        total_taxes = String.format("%.2f", total_taxes).toDouble()
        total_subtotal = String.format("%.2f", total_subtotal).toDouble()

        val taxTotalArray = InvoiceHelper.constructTaxTotal(itemsArray)
        val legalMonetaryTotal =
            InvoiceHelper.constructLegalMonetaryTotal(total_subtotal, total_taxes)

        val customerParty = mapOf(
            "cac:Party" to mapOf(
                "cac:PartyLegalEntity" to mapOf(
                    "cbc:RegistrationName" to (order.customer?.name ?: "Demo Customer")
                )
            )
        )

        invoice_xml = addXMLElements(
            invoice_xml,
            taxTotalArray,
            legalMonetaryTotal,
            invoice_line_items,
            customerParty
        )

        return invoice_xml
    }

    fun preProcessZatcaInvoice(
        orderJson: String,
        companyJson: String,
        locationJson: String,
        deviceJson: String,
        invoiceSequence: Int,
        previousInvoiceHash: String?,
        refund: Boolean
    ): Map<String, Any?> {
        try {
            val order = gson.fromJson(orderJson, Order::class.java)
            val company = gson.fromJson(companyJson, Company::class.java)
            val location = gson.fromJson(locationJson, Location::class.java)
            val device = gson.fromJson(deviceJson, DeviceInfo::class.java)

            if (device.zatcaConfiguration.enableZatca.isEmpty() ||
                device.zatcaConfiguration.enableZatca == "inactive" ||
                order.orderNum.isEmpty()
            ) {
                Log.e(
                    TAG,
                    "ZATCA validation failed - enableZatca: ${device.zatcaConfiguration.enableZatca}, orderNum: ${order.orderNum}"
                )
                throw Exception("ZATCA_ORDER DEVICE NOT FOUND")
            }

            val jsonResp = device.zatcaConfiguration

            var issued_certificate = String(
                android.util.Base64.decode(
                    jsonResp.binarySecurityToken,
                    android.util.Base64.DEFAULT
                )
            )
            issued_certificate =
                "-----BEGIN CERTIFICATE-----\n${issued_certificate}\n-----END CERTIFICATE-----"

            val privateKeyString = fetchPrivateKeyFromEndpoint(device.deviceCode)

            val api_secret = jsonResp.secret
            val auth_headers = getAuthHeaders(issued_certificate, api_secret)
            val headers = mutableMapOf<String, String>().apply {
                putAll(auth_headers)
                put("Accept-Language", "en")
                put("Clearance-Status", "0")
            }

            val egs = EGSUnitInfo(
                uuid = device.zatcaConfiguration.zatcaId,
                custom_id = device.deviceCode,
                model = device.metadata.model,
                CRN_number = company.commercialRegistrationNumber.docNumber,
                VAT_name = company.name.en,
                VAT_number = company.vat.docNumber,
                solution_name = "Tijarah360",
                location = EGSUnitLocation(
                    city = location.address.city,
                    city_subdivision = location.address.state ?: "",
                    street = location.address.address1,
                    plot_identification = "2132343",
                    building = "45212",
                    postal_zone = location.address.postalCode
                ),
                branch_name = location.name.en,
                branch_industry = company.businessType
            )

            val previousHashValue = previousInvoiceHash ?: ""

            // Convert UTC date/time to Saudi timezone for ZATCA compliance
            val (saudiDate, saudiTime) = convertUtcToSaudiTime(order.createdAt)

            val createdAtTime = if (order.createdAtTime.isNullOrEmpty()) {
                saudiTime
            } else {
                order.createdAtTime
            }

            val formattedCreatedAt = saudiDate

            val formattedOrder = order.copy(
                invoiceSequence = invoiceSequence,
                previous_invoice_hash = previousHashValue,
                createdAtTime = createdAtTime,
                createdAt = formattedCreatedAt
            )

            val invoice = generateInvoice(
                if (refund) ZATCAInvoiceTypes.CREDIT_NOTE else ZATCAInvoiceTypes.INVOICE,
                egs,
                formattedOrder
            )


            val signingResult = SigningUtils.generateSignedXMLString(
                GenerateSignatureXMLParams(
                    invoice_xml = invoice,
                    certificate_string = issued_certificate,
                    private_key_string = privateKeyString
                )
            )


            val result = mapOf(
                "status" to "PENDING",
                "previous_invoice_hash" to previousInvoiceHash,
                "previous_refund_invoice_hash" to "",
                "signed_invoice_string" to signingResult.signed_invoice_string,
                "invoice_hash" to signingResult.invoice_hash,
                "qr" to signingResult.qr,
                "qr_code_string" to signingResult.qr,
                "headers" to headers,
                "refund" to refund,
                "device" to mapOf(
                    "deviceCode" to device.deviceCode,
                    "zatcaConfiguration" to mapOf(
                        "zatcaId" to device.zatcaConfiguration.zatcaId,
                        "enableZatca" to device.zatcaConfiguration.enableZatca,
                        "model" to device.metadata.model
                    )
                ),
                "order" to mapOf(
                    "orderNum" to formattedOrder.orderNum,
                    "createdAt" to formattedOrder.createdAt,
                    "createdAtTime" to formattedOrder.createdAtTime,
                    "invoiceSequence" to formattedOrder.invoiceSequence,
                    "previous_invoice_hash" to formattedOrder.previous_invoice_hash,
                    "customer" to formattedOrder.customer?.name,
                    "items_count" to formattedOrder.items.size,
                    "refunds_count" to formattedOrder.refunds.size
                ),
                "headers" to headers,
                "invoice_sequence" to invoiceSequence,
                "display_data" to mapOf(
                    "qr_code" to signingResult.qr,
                    "invoice_xml" to signingResult.signed_invoice_string,
                    "invoice_hash" to signingResult.invoice_hash
                )
            )
            return result

        } catch (e: Exception) {
            Log.e(TAG, "Error in preProcessZatcaInvoice: ${e.message}", e)
            throw e
        }
    }


    private fun fetchPrivateKeyFromEndpoint(deviceCode: String): String {
        // Check if private key is already cached in memory
        privateKeyCache[deviceCode]?.let { cachedKey ->
            return cachedKey
        }

        // Check if private key is saved locally
        val savedKey = getPrivateKeyFromLocalStorage(deviceCode)
        if (savedKey != null) {
            // Cache in memory for faster access
            privateKeyCache[deviceCode] = savedKey
            return savedKey
        }

        // Fetch from API if not cached or saved
        try {
            val url = URL("https://$baseHost/zatca/private-key?deviceCode=$deviceCode")
            val connection = url.openConnection() as HttpURLConnection

            connection.requestMethod = "GET"
            connection.setRequestProperty("Content-Type", "application/json")

            val authHeader = if (authToken.startsWith("Bearer ")) {
                authToken
            } else {
                "Bearer $authToken"
            }

            connection.setRequestProperty("Authorization", authHeader)
            connection.connectTimeout = 10000
            connection.readTimeout = 10000

            val responseCode = connection.responseCode

            if (responseCode == HttpURLConnection.HTTP_OK) {
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val response = reader.readText()
                reader.close()

                val jsonResponse = JSONObject(response)
                val privateKeyUrl = jsonResponse.getString("url")

                val privateKey = fetchPrivateKeyFromUrl(privateKeyUrl)

                // Save to local storage and cache in memory
                savePrivateKeyToLocalStorage(deviceCode, privateKey)
                privateKeyCache[deviceCode] = privateKey

                return privateKey
            } else {
                Log.e(TAG, "Failed to fetch private key. HTTP response code: $responseCode")
                throw Exception("Failed to fetch private key. HTTP response code: $responseCode")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching private key from endpoint: ${e.message}", e)
            throw Exception("Error fetching private key from endpoint: ${e.message}")
        }
    }

    private fun fetchPrivateKeyFromUrl(privateKeyUrl: String): String {
        try {
            val url = URL(privateKeyUrl)
            val connection = url.openConnection() as HttpURLConnection

            connection.requestMethod = "GET"
            connection.connectTimeout = 10000
            connection.readTimeout = 10000

            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val privateKey = reader.readText()
                reader.close()
                return privateKey
            } else {
                throw Exception("Failed to fetch private key from URL. HTTP response code: $responseCode")
            }
        } catch (e: Exception) {
            throw Exception("Error fetching private key from URL: ${e.message}")
        }
    }

    private fun getPrivateKeyFromLocalStorage(deviceCode: String): String? {
        return try {
            val fileName = "zatca_private_key_$deviceCode.pem"
            // Use a more generic path that works across different Android apps
            val cacheDir = File(System.getProperty("java.io.tmpdir") ?: "/tmp")
            val file = File(cacheDir, fileName)

            if (file.exists()) {
                file.readText()
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun savePrivateKeyToLocalStorage(deviceCode: String, privateKey: String) {
        try {
            val fileName = "zatca_private_key_$deviceCode.pem"
            // Use a more generic path that works across different Android apps
            val cacheDir = File(System.getProperty("java.io.tmpdir") ?: "/tmp")

            // Create directory if it doesn't exist
            if (!cacheDir.exists()) {
                cacheDir.mkdirs()
            }

            val file = File(cacheDir, fileName)
            file.writeText(privateKey)
        } catch (e: Exception) {
            // Log error but don't throw - caching is optional
            println("Warning: Failed to save private key to local storage: ${e.message}")
        }
    }

    fun clearPrivateKeyCache(deviceCode: String? = null) {
        if (deviceCode != null) {
            // Clear specific device key
            privateKeyCache.remove(deviceCode)

            // Remove from local storage
            try {
                val fileName = "zatca_private_key_$deviceCode.pem"
                val cacheDir = File(System.getProperty("java.io.tmpdir") ?: "/tmp")
                val file = File(cacheDir, fileName)
                if (file.exists()) {
                    file.delete()
                }
            } catch (e: Exception) {
                println("Warning: Failed to delete private key from local storage: ${e.message}")
            }
        } else {
            // Clear all cached keys
            privateKeyCache.clear()

            // Remove all private key files
            try {
                val cacheDir = File(System.getProperty("java.io.tmpdir") ?: "/tmp")
                cacheDir.listFiles()?.forEach { file ->
                    if (file.name.startsWith("zatca_private_key_") && file.name.endsWith(".pem")) {
                        file.delete()
                    }
                }
            } catch (e: Exception) {
                println("Warning: Failed to clear private keys from local storage: ${e.message}")
            }
        }
    }

    private fun getAuthHeaders(certificate: String?, secret: String?): Map<String, String> {
        if (certificate != null && secret != null) {
            val certificate_stripped = cleanUpCertificateString(certificate)
            val certificateBase64 =
                Base64.encodeToString(certificate_stripped.toByteArray(), Base64.NO_WRAP)
            val basicAuth = "$certificateBase64:$secret"
            val basic = Base64.encodeToString(basicAuth.toByteArray(), Base64.NO_WRAP)
            return mapOf("Authorization" to "Basic $basic")
        }
        return emptyMap()
    }
}
