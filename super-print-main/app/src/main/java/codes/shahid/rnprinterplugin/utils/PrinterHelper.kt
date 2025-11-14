package codes.shahid.rnprinterplugin.utils

import android.content.Context
import android.graphics.Typeface
import android.text.Layout
import android.util.Log
import com.dantsu.escposprinter.EscPosPrinter
import com.dantsu.escposprinter.textparser.PrinterTextParserImg
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Helper class for printer-related formatting and utility functions
 */
object PrinterHelper {
    private const val TAG = "PrinterHelper"



    fun isArabicText(text: String?): Boolean {
        if (text.isNullOrEmpty()) return false

        val arabicPattern = Regex("[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]")
        return arabicPattern.containsMatchIn(text)
    }




    /**
     * Format text with proper spacing for printer output
     * @param text The text to format (in the format "label:value")
     * @param is2Inch Whether the printer is a 2-inch printer
     * @return Formatted text with proper spacing
     */
    fun formatPrinterText(text: String, is2Inch: Boolean): String {
        val baseLength = if (!is2Inch) {
            "Total Taxable Amount                               SAR14.00".length
        } else {
            "Total Taxable Amount         SAR14.00".length
        }

        // Split the text into label and value using ':'
        val matches = text.split(":")
        if (matches.size != 2) {
            return text // Return as is if no price pattern found
        }

        val label = matches[0].trim()
        val value = matches[1].trim()

        val labelLength = label.length
        val valueLength = value.length
        var spaces = baseLength - labelLength - valueLength

        val referenceLabel = "Total Taxable Amount"
        if (labelLength < referenceLabel.length) {
            spaces += referenceLabel.length - labelLength
        }

        return "$label${" ".repeat(spaces)}$value"
    }

    /**
     * Convert text to bitmap for printer
     * @param context The context
     * @param printer The printer instance
     * @param text The text to convert
     * @param alignment The alignment (L, C, R)
     * @param fontSize The font size
     * @return Hexadecimal string representation of the bitmap
     */
    fun convertAmountInternal(
        context: Context,
        printer: EscPosPrinter,
        text: String,
        alignment: String,
        fontSize: String
    ): String {
        val bitmap = BitmapUtils.getBitmap(
            context,
            text,
            fontSize.toIntOrNull() ?: 28,
            Typeface.DEFAULT,
            Layout.Alignment.ALIGN_NORMAL
        )
        return PrinterTextParserImg.bitmapToHexadecimalString(printer, bitmap)
    }

    /**
     * Convert Arabic text to bitmap for printer
     * @param context The context
     * @param printer The printer instance
     * @param text The Arabic text
     * @return Hexadecimal string representation of the bitmap
     */
    fun imageToHexTcp(context: Context, printer: EscPosPrinter, text: String): String {
        val bitmap = BitmapUtils.getBitmap(
            context,
            text,
            28,
            Typeface.DEFAULT_BOLD,
            Layout.Alignment.ALIGN_OPPOSITE
        )
        return PrinterTextParserImg.bitmapToHexadecimalString(printer, bitmap)
    }

    /**
     * Format a printer line with Arabic text
     * @param context The context
     * @param printer The printer instance
     * @param label The label in English
     * @param arLabel The label in Arabic
     * @param value The value
     * @param isBold Whether the text should be bold
     * @param currency The currency symbol
     * @return Formatted printer line
     */
    fun formatPrinterLine(
        context: Context,
        printer: EscPosPrinter,
        label: String,
        arLabel: String,
        value: String,
        isBold: Boolean = false,
        currency: String = "SAR"
    ): String {
        val formattedValue = if (value.toDoubleOrNull() != null) {
            "$currency ${String.format("%.2f", value.toDouble())}"
        } else {
            if (value.contains(currency)) value else "$currency $value"
        }

        val boldStart = if (isBold) "<b>" else ""
        val boldEnd = if (isBold) "</b>" else ""

        val formattedText = formatPrinterText("$label:$formattedValue", false)
        Log.d(TAG, "Formatted text: $formattedText");

        return try {
            var printContent = ""

            val convertedAmount = convertAmountInternal(context, printer, formattedText, "R", "34")
            printContent += "[L]<img>$convertedAmount</img>\n"

            if (arLabel.isNotEmpty()) {
                printContent += "[L]<img>${imageToHexTcp(context, printer, arLabel)}</img>\n"
            }

            printContent
        } catch (e: Exception) {
            Log.e(TAG, "Error formatting printer line: ${e.message}")
            // Fallback to the old method if there's an error
            "[L]$boldStart$label$boldEnd[R]$formattedValue\n" +
            "[L]<img>${imageToHexTcp(context, printer, arLabel)}</img>\n"
        }
    }

    /**
     * Format date for printer output
     * @param date The date to format (Date object from Gson parsing)
     * @return Formatted date string in local timezone
     */
    fun formatDate(date: Date): String {
        val deviceTimeZone = TimeZone.getDefault()
        val sdf = SimpleDateFormat("dd-MM-yyyy, hh:mm a", Locale.getDefault())
        sdf.timeZone = deviceTimeZone

        Log.d("DEBUG_TIMEZONE", "Device timezone: ${deviceTimeZone.id}")
        Log.d("DEBUG_TIMEZONE", "Device timezone offset: ${deviceTimeZone.getOffset(date.time) / (1000 * 60 * 60)} hours")
        Log.d("DEBUG_TIMEZONE", "Input date: $date")
        Log.d("DEBUG_TIMEZONE", "Input date timestamp: ${date.time}")

        val formattedDate = sdf.format(date)
        Log.d("DEBUG_TIMEZONE", "Formatted date (local): $formattedDate")

        return formattedDate
    }




    /**
     * Format currency for printer output
     * @param amount The amount to format
     * @return Formatted currency string
     */
    fun formatCurrency(amount: Double): String {
        return String.format("%.2f", amount)
    }

    /**
     * Center text for printer output
     * @param text The text to center
     * @param width The width of the printer
     * @return Centered text
     */
    fun centerText(text: String, width: Int = 40): String {
        if (text.length >= width) return text
        val padding = (width - text.length) / 2
        return " ".repeat(padding) + text
    }

    /**
     * Align text to the right for printer output
     * @param text The text to align
     * @param width The width of the printer
     * @return Right-aligned text
     */
    fun alignRight(text: String, width: Int = 12): String {
        if (text.length >= width) return text
        val padding = width - text.length
        return " ".repeat(padding) + text
    }

    /**
     * Truncate text for printer output
     * @param text The text to truncate
     * @param maxLength The maximum length
     * @return Truncated text
     */
    fun truncateText(text: String, maxLength: Int): String {
        return if (text.length <= maxLength) text else text.substring(0, maxLength - 3) + "..."
    }

    /**
     * Create a dashed line for printer output
     * @param width The width of the printer
     * @return Dashed line
     */
    fun dashedLine(width: Int = 40): String {
        return "-".repeat(width)
    }

    /**
     * Get validity period for proforma invoices
     * @return Validity period in days
     */
    fun getValidityPeriod(): Int {
        return 30
    }
}
