package codes.shahid.rnprinterplugin.templates

import com.dantsu.escposprinter.EscPosPrinter
import com.dantsu.escposprinter.textparser.PrinterTextParserImg
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class TransactionReportTemplate {

    fun getTransactionReport(printer: EscPosPrinter, transactionData: Map<String, Any>): String {
        val is2Inch = (transactionData["printerSize"] as? String) == "2-inch"
        val dividerLength = if (is2Inch) 32 else 48
        val textSize = if (is2Inch) 16 else 20
        val headerTextSize = if (is2Inch) 16 else 22
        val charsPerLine = if (is2Inch) 32 else 44
        
        val builder = StringBuilder()
        
        // Header
        builder.append("[C]<b>${transactionData["userName"]}</b>\n")
        builder.append("[L]\n")
        builder.append("[C]<b>${transactionData["locationName"]}</b>\n")
        builder.append("[C]${"-".repeat(dividerLength)}\n")
        
        // Date range
        builder.append("[L]Sales Summary[R]${transactionData["startDate"]}\nto ${transactionData["endDate"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage("ملخص المبيعات", "left", textSize)}</img>\n")
        builder.append("[C]${"-".repeat(dividerLength)}\n")
        
        // Sales details
        builder.append("[C]<b>Sales Details</b>\n")
        builder.append("[C]<img>${getArabicTextAsImage("ملخص المبيعات" + " ".repeat(if (is2Inch) 20 else 40), "center", headerTextSize)}</img>\n")
        builder.append("[L]Total Sales[R]SAR ${transactionData["totalRevenue"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage("إجمالي المبيعات", "left", textSize)}</img>\n")
        builder.append("[L]Net Sales[R]SAR ${transactionData["netSales"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage("صافي المبيعات", "left", textSize)}</img>\n")
        builder.append("[L]Total VAT[R]SAR ${transactionData["totalVat"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage("إجمالي الضريبة", "left", textSize)}</img>\n")
        builder.append("[L]Discounts[R]SAR ${transactionData["discount"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage("الخصومات", "left", textSize)}</img>\n")
        
        // Transaction details
        builder.append("[C]${"-".repeat(dividerLength)}\n")
        builder.append("[C]<b>Transaction Details</b>\n")
        builder.append("[C]<img>${getArabicTextAsImage("تفاصيل المعاملة" + " ".repeat(if (is2Inch) 20 else 40), "center", headerTextSize)}</img>\n")
        
        // Process transaction types
        val txnStats = transactionData["txnStats"] as? List<Map<String, Any>> ?: emptyList()
        val paymentTypes = transactionData["paymentTypes"] as? List<Map<String, Any>> ?: emptyList()
        
        val transactionTypes = listOf(
            mapOf("key" to "card", "en" to "Card Transaction", "ar" to "معاملات البطاقة"),
            mapOf("key" to "cash", "en" to "Cash Transaction", "ar" to "نقداً المحفظة"),
            mapOf("key" to "wallet", "en" to "Wallet Transaction", "ar" to "معاملات المحفظة"),
            mapOf("key" to "hungerstation", "en" to "HungerStation Transaction", "ar" to "امعاملة هنقرستيشن"),
            mapOf("key" to "jahez", "en" to "Jahez Transaction", "ar" to "معاملة جاهز"),
            mapOf("key" to "toyou", "en" to "ToYou Transaction", "ar" to "معاملة تويو"),
            mapOf("key" to "barakah", "en" to "Barakah Transaction", "ar" to "معاملة بركة"),
            mapOf("key" to "careem", "en" to "Careem Transaction", "ar" to "معاملة كريم"),
            mapOf("key" to "ninja", "en" to "Ninja Transaction", "ar" to "معاملة نينجا"),
            mapOf("key" to "thechef", "en" to "The Chef Transaction", "ar" to "معاملة ذا شيف"),
            mapOf("key" to "nearpay", "en" to "Nearpay Transaction", "ar" to "معاملات نيرباي"),
            mapOf("key" to "stcpay", "en" to "STC Pay Transaction", "ar" to "معاملات إس تي سي")
        )
        
        for (type in transactionTypes) {
            val key = type["key"] as String
            val paymentType = paymentTypes.find { payment ->
                (payment["name"] as? String)?.toLowerCase() == key ||
                (key == "thechef" && (payment["name"] as? String) == "The Chef")
            }
            
            if (paymentType != null && (paymentType["status"] as? Boolean) == true) {
                val txnData = txnStats.find { d ->
                    (d["paymentName"] as? String)?.toLowerCase() == key.toLowerCase()
                }
                
                val amount = (txnData?.get("balanceAmount") as? Number)?.toDouble() ?: 0.0
                val count = when (val noOfPayments = txnData?.get("noOfPayments")) {
                    is Number -> noOfPayments.toInt()
                    is String -> noOfPayments.toIntOrNull() ?: 0
                    else -> 0
                }
                
                builder.append("[L]${type["en"]}[R]SAR ${String.format("%.2f", amount)}, Count: $count\n")
                builder.append("[L]<img>${getArabicTextAsImage(type["ar"] as String, "left", textSize)}</img>\n")
            }
        }
        
        // Refund details
        builder.append("[C]${"-".repeat(dividerLength)}\n")
        builder.append("[C]<b>Refund Details</b>\n")
        builder.append("[C]<img>${getArabicTextAsImage("تفاصيل استرداد الأموال" + " ".repeat(if (is2Inch) 15 else 30), "center", headerTextSize)}</img>\n")
        
        val refundTypes = listOf(
            mapOf("key" to "card", "en" to "Card Refund", "ar" to "المسترجع بالبطاقة"),
            mapOf("key" to "cash", "en" to "Cash Refund", "ar" to "المسترجع نقداً"),
            mapOf("key" to "wallet", "en" to "Wallet Refund", "ar" to "استرداد المحفظة"),
            mapOf("key" to "hungerstation", "en" to "HungerStation Refund", "ar" to "امعاملة هنقرستيشن"),
            mapOf("key" to "jahez", "en" to "Jahez Refund", "ar" to "معاملة جاهز"),
            mapOf("key" to "toyou", "en" to "ToYou Refund", "ar" to "معاملة تويو"),
            mapOf("key" to "barakah", "en" to "Barakah Refund", "ar" to "معاملة بركة"),
            mapOf("key" to "careem", "en" to "Careem Refund", "ar" to "معاملة كريم"),
            mapOf("key" to "ninja", "en" to "Ninja Refund", "ar" to "معاملة نينجا"),
            mapOf("key" to "thechef", "en" to "The Chef Refund", "ar" to "معاملة ذا شيف"),
            mapOf("key" to "nearpay", "en" to "Nearpay Refund", "ar" to "معاملات نيرباي"),
            mapOf("key" to "stcpay", "en" to "STC Pay Refund", "ar" to "معاملات إس تي سي")
        )
        
        for (type in refundTypes) {
            val key = type["key"] as String
            val paymentType = paymentTypes.find { payment ->
                (payment["name"] as? String)?.toLowerCase() == key ||
                (key == "thechef" && (payment["name"] as? String) == "The Chef")
            }
            
            if (paymentType != null && (paymentType["status"] as? Boolean) == true) {
                var refundAmount = "0.00"
                var refundCount = 0
                
                if (listOf("card", "cash", "wallet", "credit", "nearpay", "stcpay").contains(key)) {
                    val capKey = key.capitalize()
                    refundAmount = (transactionData["refundIn$capKey"] as? String) ?: "0.00"
                    refundCount = (transactionData["refundCountIn$capKey"] as? Number)?.toInt() ?: 0
                } else {
                    val refundData = transactionData["refundData"] as? List<Map<String, Any>> ?: emptyList()
                    val refundInfo = refundData.find { r -> (r["refundType"] as? String) == key }
                    if (refundInfo != null) {
                        val totalRefund = (refundInfo["totalRefund"] as? Number)?.toDouble() ?: 0.0
                        refundAmount = String.format("%.2f", totalRefund)
                        refundCount = (refundInfo["refundCount"] as? Number)?.toInt() ?: 0
                    }
                }
                
                builder.append("[L]${type["en"]}[R]SAR $refundAmount, Count: $refundCount\n")
                builder.append("[L]<img>${getArabicTextAsImage(type["ar"] as String, "left", textSize)}</img>\n")
            }
        }
        
        // Footer
        builder.append("[C]${"-".repeat(dividerLength)}\n")
        builder.append("[L]Printed on[R]${transactionData["printedOn"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage("طبع على", "left", textSize)}</img>\n")
        builder.append("[L]Printed by[R]${transactionData["printedBy"]}\n")
        builder.append("[L]<img>${getArabicTextAsImage("طبع بواسطة", "left", textSize)}</img>\n")
        builder.append("[C]${"-".repeat(dividerLength)}\n")
        builder.append("[C]${transactionData["footer"]}\n")
        builder.append("[C]Powered by Tijarah360\n")
        builder.append("${if (is2Inch) "\n\n" else "[L]\n[L]\n[L]\n"}")
        
        return builder.toString()
    }
    
    private fun getArabicTextAsImage(text: String, align: String, textSize: Int): String {
        // This is a placeholder - in a real implementation, you would convert Arabic text to an image
        // and return it in the format expected by the printer library
        return "ARABIC_TEXT_IMAGE_PLACEHOLDER"
    }
    
    private fun String.capitalize(): String {
        return if (this.isEmpty()) this else this.substring(0, 1).toUpperCase() + this.substring(1)
    }
} 