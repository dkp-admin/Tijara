package codes.shahid.rnprinterplugin.printer.sunmi.templates

import android.content.Context
import android.util.Log
import com.dantsu.escposprinter.EscPosPrinter
import codes.shahid.rnprinterplugin.templates.Templates
import codes.shahid.rnprinterplugin.types.Order
import codes.shahid.rnprinterplugin.utils.PrinterHelper
import java.util.Date

class SunmiTemplates(private val context: Context): Templates {

    companion object {
        private const val TAG = "Templates"
    }

    override fun getTransactionReceipt(printer: EscPosPrinter, transactionData: Map<String, Any>): String {
        val sb = StringBuilder()

        // Header Section
        sb.append("[C]<FH>${transactionData["userName"]}\n")
        sb.append("[C]<FH>${transactionData["locationName"]}\n")
        sb.append("[C]--------------------------------\n")

        // Date Range
        sb.append("[L]<FB>Sales Summary\n")
        sb.append("[L]${transactionData["startDate"]} to ${transactionData["endDate"]}\n")
        sb.append("[C]--------------------------------\n")

        // Sales Details
        sb.append("[C]<FB>Sales Details\n")
        val totalRevenue = transactionData["totalRevenue"] as? Number ?: 0.0
        val netSales = transactionData["netSales"] as? Number ?: 0.0
        val totalVat = transactionData["totalVat"] as? Number ?: 0.0
        val discount = transactionData["discount"] as? Number ?: 0.0

        sb.append("[L]Total Sales: SAR ${String.format("%.2f", totalRevenue)}\n")
        sb.append("[L]Net Sales: SAR ${String.format("%.2f", netSales)}\n")
        sb.append("[L]Total VAT: SAR ${String.format("%.2f", totalVat)}\n")
        sb.append("[L]Discounts: SAR ${String.format("%.2f", discount)}\n")
        sb.append("[C]--------------------------------\n")

        // Transaction Details
        sb.append("[C]<FB>Transaction Details\n")

        // Process transaction types
        val txnStats = transactionData["txnStats"] as? List<Map<String, Any>> ?: emptyList()
        val paymentTypes = transactionData["paymentTypes"] as? List<Map<String, Any>> ?: emptyList()

        for (paymentType in paymentTypes) {
            val name = paymentType["name"] as? String ?: continue
            val status = paymentType["status"] as? Boolean ?: false
            if (!status) continue

            val txnData = txnStats.find { it["paymentName"] as? String == name }
            val amount = txnData?.get("balanceAmount") as? Number ?: 0.0
            val count = when (val noOfPayments = txnData?.get("noOfPayments")) {
                is Number -> noOfPayments.toInt()
                is String -> noOfPayments.toIntOrNull() ?: 0
                else -> 0
            }

            sb.append("[L]$name Transaction: SAR ${String.format("%.2f", amount)}, Count: $count\n")
        }

        sb.append("[C]--------------------------------\n")

        // Refund Details
        sb.append("[C]<FB>Refund Details\n")

        // Process refunds
        val refundTypes = listOf("card", "cash", "wallet", "credit", "nearpay", "stcpay")
        for (type in refundTypes) {
            val refundAmount = transactionData["refundIn${type.capitalize()}"] as? String ?: "0.00"
            val refundCount = transactionData["refundCountIn${type.capitalize()}"] as? Number ?: 0
            if (refundAmount != "0.00" || refundCount != 0) {
                sb.append("[L]${type.capitalize()} Refund: SAR $refundAmount, Count: $refundCount\n")
            }
        }

        // Footer
        sb.append("[C]--------------------------------\n")
        sb.append("[L]Printed on: ${transactionData["printedOn"]}\n")
        sb.append("[L]Printed by: ${transactionData["printedBy"]}\n")
        sb.append("[C]--------------------------------\n")
        sb.append("[C]${transactionData["footer"]}\n")
        sb.append("[C]Powered by Tijarah360\n")
        sb.append("\n\n\n\n")

        return sb.toString()
    }


    override fun getReceipt(printer: EscPosPrinter, order: Order): String {
       return  "Testing Receipt"
           }


    override fun getRefundReceipt(printer: EscPosPrinter,order: Order): String {
        Log.d(TAG, "Generating refund receipt template for order ${order._id}")

        // Check if refunds array exists and has elements
        if (order.refunds.isNullOrEmpty()) {
            Log.e(TAG, "No refunds found for order ${order._id}")
            return centerText("ERROR: No refund data available") + "\n\n"
        }

        val refund = order.refunds[0]
        val sb = StringBuilder()

        // Header
        sb.append(centerText(order.company.name.uppercase())).append("\n")
        sb.append(centerText(order.location.name.en)).append("\n")
        sb.append(centerText("*** REFUND RECEIPT ***")).append("\n\n")

        // Order info
        sb.append("Original Order #: ${order.orderNum}").append("\n")
        sb.append("Refund Date: ${refund.date ?: formatDate(Date())}").append("\n")
        sb.append("Refund Ref: ${refund.referenceNumber}").append("\n")
        if (refund.cashier != null) {
            sb.append("Cashier: ${refund.cashier.name}").append("\n")
        }
        sb.append("\n")

        // Refund reason
        sb.append("Reason: ${refund.reason}").append("\n\n")

        // Refunded items
        sb.append(dashedLine()).append("\n")
        sb.append(String.format("%-4s %-20s %8s %10s", "Qty", "Item", "Price", "Total")).append("\n")
        sb.append(dashedLine()).append("\n")

        for (item in refund.items) {
            sb.append(String.format("%-4d %-20s %8.2f %10.2f",
                item.qty,
                truncateText(item.nameEn, 20),
                item.amount / item.qty,
                item.amount
            )).append("\n")
        }

        sb.append(dashedLine()).append("\n\n")

        // Refund summary
        if (refund.discountAmount > 0) {
            sb.append("Discount:").append(alignRight(formatCurrency(refund.discountAmount))).append("\n")
        }

        // Add charges if any
        refund.charges.forEach { charge ->
            sb.append("${charge.name.en}:").append(alignRight(formatCurrency(charge.totalCharge))).append("\n")
        }

        sb.append("VAT:").append(alignRight(formatCurrency(refund.vat))).append("\n")
        sb.append(dashedLine()).append("\n")
        sb.append("Total Refunded:").append(alignRight(formatCurrency(refund.amount))).append("\n")
        sb.append(dashedLine()).append("\n\n")

        // Refund method
        sb.append("Refunded To:").append("\n")
        refund.refundedTo.forEach { refundPayment ->
            sb.append("${refundPayment.refundTo}: ${formatCurrency(refundPayment.amount)}").append("\n")
        }
        sb.append("\n")

        // Footer
        sb.append(centerText("Thank you for your understanding")).append("\n")

        return sb.toString()
    }


    override fun getKot(escPosPrinter: EscPosPrinter, order: Order, kitchenName: String?): String {
        Log.d(TAG, "Generating KOT template for order ${order._id}")

        val sb = StringBuilder()

        // Header
        sb.append(centerText("KITCHEN ORDER TICKET")).append("\n")
        sb.append(centerText(order.location.name.en)).append("\n\n")

        // Order info
        sb.append("Order #: ${order.orderNum}").append("\n")
        if (order.tokenNum != null) {
            sb.append("Token #: ${order.tokenNum}").append("\n")
        }
        sb.append("Date: ${formatDate(order.createdAt)}").append("\n")
        sb.append("Order Type: ${order.orderType ?: "Takeaway"}").append("\n")

        // Table info for dine-in
        if (order.orderType == "dine-in" && order.dineInData.tableRef.isNotEmpty()) {
            sb.append("Table: ${order.dineInData.table}").append("\n")
            sb.append("Guests: ${order.dineInData.noOfGuests}").append("\n")
        }
        sb.append("\n")

        // Items are already filtered by PrintController, so just use all items
        // The order object passed here contains only items relevant to this printer
        val items = order.items

        if (items.isEmpty()) {
            sb.append("No items for ${kitchenName ?: "any kitchen"}").append("\n")
            return sb.toString()
        }

        // Items
        sb.append(dashedLine()).append("\n")
        sb.append(String.format("%-4s %-30s", "Qty", "Item")).append("\n")
        sb.append(dashedLine()).append("\n")

        for (item in items) {
            sb.append(String.format("%-4d %-30s",
                item.qty,
                truncateText(item.name.en, 30)
            )).append("\n")

            // Add modifiers if any
            item.modifiers?.forEach { modifier ->
                sb.append(String.format("     %-29s",
                    truncateText("+ ${modifier.name}", 29)
                )).append("\n")
            }

            // Add note if any
            if (item.note.isNotEmpty()) {
                sb.append(String.format("     Note: %-24s",
                    truncateText(item.note, 24)
                )).append("\n")
            }
        }

        sb.append(dashedLine()).append("\n")

        // Special instructions
        if (!order.specialInstructions.isNullOrEmpty()) {
            sb.append("\nSpecial Instructions:").append("\n")
            sb.append(order.specialInstructions).append("\n")
        }

        return sb.toString()
    }

    override fun getProforma(printer: EscPosPrinter,order: Order): String {
        Log.d(TAG, "Generating proforma template for order ${order._id}")

        val sb = StringBuilder()

        // Header
        sb.append(centerText(order.company.name.uppercase())).append("\n")
        sb.append(centerText(order.location.name.en)).append("\n")
        sb.append(centerText("PROFORMA INVOICE")).append("\n\n")

        // Order info
        sb.append("Order #: ${order.orderNum}").append("\n")
        sb.append("Date: ${formatDate(order.createdAt)}").append("\n")
        if (order.cashier != null) {
            sb.append("Prepared By: ${order.cashier.name}").append("\n")
        }
        sb.append("\n")

        // Customer info if available
        order.customer?.let {
            sb.append("Customer: ${it.name}").append("\n")
            if (it.phone != null) {
                sb.append("Phone: ${it.phone}").append("\n")
            }
            if (it.vat.isNotEmpty()) {
                sb.append("VAT #: ${it.vat}").append("\n")
            }
            sb.append("\n")
        }

        // Items
        sb.append(dashedLine()).append("\n")
        sb.append(String.format("%-4s %-20s %8s %10s", "Qty", "Item", "Price", "Total")).append("\n")
        sb.append(dashedLine()).append("\n")

        for (item in order.items) {
            sb.append(String.format("%-4d %-20s %8.2f %10.2f",
                item.qty,
                truncateText(item.name.en, 20),
                item.sellingPrice,
                item.total
            )).append("\n")

            // Add modifiers if any
            item.modifiers?.forEach { modifier ->
                sb.append(String.format("     %-19s %8.2f %10.2f",
                    truncateText("+ ${modifier.name}", 19),
                    modifier.subTotal,
                    modifier.total
                )).append("\n")
            }
        }

        sb.append(dashedLine()).append("\n\n")

        // Payment summary
        sb.append("Subtotal:").append(alignRight(formatCurrency(order.payment.subTotal))).append("\n")

        if (order.payment.discount > 0) {
            sb.append("Discount:").append(alignRight(formatCurrency(order.payment.discount))).append("\n")
        }

        // Add charges if any
        order.payment.charges.forEach { charge ->
            sb.append("${charge.name.en}:").append(alignRight(formatCurrency(charge.total))).append("\n")
        }

        sb.append("VAT (${order.payment.vatPercentage}%):").append(alignRight(formatCurrency(order.payment.vat))).append("\n")
        sb.append(dashedLine()).append("\n")
        sb.append("Total:").append(alignRight(formatCurrency(order.payment.total))).append("\n")
        sb.append(dashedLine()).append("\n\n")

        // Footer
        sb.append(centerText("This is not a tax invoice")).append("\n")
        sb.append(centerText("Valid for ${getValidityPeriod()} days")).append("\n")

        return sb.toString()
    }



    // Use helper functions from PrinterHelper
    private fun centerText(text: String, width: Int = 40): String {
        return PrinterHelper.centerText(text, width)
    }

    private fun alignRight(text: String, width: Int = 12): String {
        return PrinterHelper.alignRight(text, width)
    }

    private fun truncateText(text: String, maxLength: Int): String {
        return PrinterHelper.truncateText(text, maxLength)
    }

    private fun dashedLine(width: Int = 40): String {
        return PrinterHelper.dashedLine(width)
    }

    private fun formatDate(date: Date): String {
        return PrinterHelper.formatDate(date)
    }

    private fun formatCurrency(amount: Double): String {
        return PrinterHelper.formatCurrency(amount)
    }

    private fun getValidityPeriod(): Int {
        return PrinterHelper.getValidityPeriod()
    }
}
