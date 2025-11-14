package codes.shahid.rnprinterplugin.types

data class PaymentType(
    val name: String,
    val status: Boolean
)

data class TransactionStat(
    val paymentName: String,
    val balanceAmount: Double,
    val noOfPayments: Int
)

data class RefundInfo(
    val refundType: String,
    val totalRefund: Double,
    val refundCount: Int
)

data class TransactionData(
    val printerSize: String,
    val userName: String,
    val locationName: String,
    val startDate: String,
    val endDate: String,
    val totalRevenue: Double,
    val netSales: Double,
    val totalVat: Double,
    val discount: Double,
    val txnStats: List<TransactionStat>,
    val paymentTypes: List<PaymentType>,
    val refundData: List<RefundInfo>? = emptyList(),
    val refundInCard: String? = "0.00",
    val refundCountInCard: Int? = 0,
    val refundInCash: String? = "0.00",
    val refundCountInCash: Int? = 0,
    val refundInWallet: String? = "0.00",
    val refundCountInWallet: Int? = 0,
    val refundInCredit: String? = "0.00",
    val refundCountInCredit: Int? = 0,
    val refundInNearpay: String? = "0.00",
    val refundCountInNearpay: Int? = 0,
    val refundInStcpay: String? = "0.00",
    val refundCountInStcpay: Int? = 0,
    val printedOn: String,
    val printedBy: String,
    val footer: String
)
