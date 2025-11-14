package codes.shahid.rnprinterplugin.utils

import android.util.Base64
import java.io.UnsupportedEncodingException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

fun getQRData(order: Map<String, Any?>): String {
    val company = order["company"] as? Map<*, *>
    val sellerName = company?.get("en") as? String ?: ""
    val vatNumber = order["vat"]?.toString() ?: "0"

    val createdAt = order["createdAt"]?.toString()
    val timestamp = parseToISO8601(createdAt) ?: "2022-01-02T10:30:00Z"

    val payment = order["payment"] as? Map<*, *>
    val total = payment?.get("total")?.toString() ?: "0"
    val vatTotal = payment?.get("vat")?.toString() ?: "0"

    return createQRData(
        sellerName = sellerName,
        vatNumber = vatNumber,
        timestamp = timestamp,
        total = total,
        vatTotal = vatTotal
    )
}

fun createQRData(
    sellerName: String,
    vatNumber: String,
    timestamp: String,
    total: String,
    vatTotal: String
): String {
    val fields = listOf(
        1 to sellerName,
        2 to vatNumber,
        3 to timestamp,
        4 to total,
        5 to vatTotal
    )

    val qrData = fields.joinToString("") { (tag, value) ->
        toTLV(tag, value)
    }

    return toBase64(qrData)
}

fun toTLV(tag: Int, value: String): String {
    return toHex(tag) + toHex(value.toByteArray(Charsets.UTF_8).size) + value
}

fun toHex(value: Int): String {
    var hex = Integer.toHexString(value)
    if (hex.length % 2 != 0) {
        hex = "0$hex"
    }
    return try {
        String(hex.chunked(2).map { it.toInt(16).toByte() }.toByteArray(), Charsets.UTF_8)
    } catch (e: UnsupportedEncodingException) {
        ""
    }
}

fun toBase64(value: String): String {
    return Base64.encodeToString(value.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
}

fun parseToISO8601(dateStr: String?): String? {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
        inputFormat.timeZone = TimeZone.getTimeZone("UTC")
        val date: Date = inputFormat.parse(dateStr ?: "") ?: return null

        val outputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
        outputFormat.timeZone = TimeZone.getTimeZone("UTC")
        outputFormat.format(date)
    } catch (e: Exception) {
        null
    }
}
