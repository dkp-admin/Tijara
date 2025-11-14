package codes.shahid.rnprinterplugin.types

import com.google.gson.annotations.SerializedName
import java.util.Date

// Base classes
data class Name(
    val en: String = "",
    val ar: String = ""
)

data class CompanyInfo(
    val name: String = ""
)

data class LocationInfo(
    val name: Name = Name(),
    val address: String = "",
    val vat: String = "",
    val phone: String = "",
    val invoiceFooter: String? = null,
    val returnPolicy: String? = null,
    val customText: String? = null
)

data class CategoryInfo(
    val name: String = ""
)

data class CustomerInfo(
    val name: String = "",
    val vat: String = "",
    val phone: String? = null,
    val address: Map<String, Any> = mapOf()
)

data class CashierInfo(
    val name: String? = null
)

data class DeviceInfo(
    val deviceCode: String? = null
)

data class PromotionsData(
    val name: String = "",
    val discount: Double = 0.0,
    val id: String = ""
)

data class ItemModifiers(
    val modifierRef: String = "",
    val name: String = "",
    val optionId: String = "",
    val optionName: String = "",
    val contains: String = "",
    val discount: Double = 0.0,
    val discountPercentage: Double = 0.0,
    val vatAmount: Double = 0.0,
    val vatPercentage: Double = 0.0,
    val subTotal: Double = 0.0,
    val total: Double = 0.0
)

// Payment related classes
data class RefundPaymentSchema(
    val amount: Double = 0.0,
    val refundTo: String = ""
)

data class ItemSchema(
    val qty: Int = 0,
    val unit: String = "",
    val vat: Double = 0.0,
    val amount: Double = 0.0,
    val discountAmount: Double = 0.0,
    val discountPercentage: Double = 0.0,
    val nameEn: String = "",
    val nameAr: String = "",
    val category: CategoryInfo = CategoryInfo(),
    val id: String = "",
    val categoryRef: String = "",
    val hasMultipleVariants: Boolean? = null,
    val sku: String = "",
    val parentSku: String = "",
    val boxSku: String = "",
    val crateSku: String = "",
    val boxRef: String = "",
    val crateRef: String = "",
    val sentToKotAt: String = "",
    val kitchenName: String = "",
    val kotId: String = "",
    val modifiers: List<ItemModifiers>? = null
)

// Billing and payment related classes
data class BillingSchema(
    @field:SerializedName("total")
    val total: Double = 0.0,

    @field:SerializedName("subTotal")
    val subTotal: Double = 0.0,

    @field:SerializedName("discount")
    val discount: Double = 0.0,

    @field:SerializedName("discountPercentage")
    val discountPercentage: Double = 0.0,

    @field:SerializedName("discountCode")
    val discountCode: String = "",

    @field:SerializedName("vat")
    val vat: Double = 0.0,

    @field:SerializedName("vatPercentage")
    val vatPercentage: Double = 0.0,

    @field:SerializedName("subTotalWithoutDiscount")
    val subTotalWithoutDiscount: Double = 0.0,

    @field:SerializedName("vatWithoutDiscount")
    val vatWithoutDiscount: Double = 0.0,

    @field:SerializedName("discountedVatAmount")
    val discountedVatAmount: Double = 0.0,

    @field:SerializedName("promotionPercentage")
    val promotionPercentage: Double = 0.0,

    @field:SerializedName("totalDiscountPromotion")
    val totalDiscountPromotion: Double = 0.0,

    @field:SerializedName("promotionRefs")
    val promotionRefs: List<String> = listOf()
)

data class PaymentBreakup(
    val name: String = "",
    val total: Double = 0.0,
    val paid: Double = 0.0,
    val change: Double = 0.0,
    val refId: String = "",
    val providerName: String = "",
    val createdAt: String? = null
)

data class PaymentMethod(
    val name: String = "",
    val amount: Double = 0.0
)

data class Charges(
    val name: Name = Name(),
    val total: Double = 0.0,
    val vat: Double? = null,
    val type: String = "",
    val chargeType: String = "",
    val value: Double = 0.0,
    val chargeId: String = ""
)

data class PaymentSchema(
    @field:SerializedName("breakup")
    val breakup: List<PaymentBreakup> = listOf(),

    @field:SerializedName("charges")
    val charges: List<Charges> = listOf(),

    @field:SerializedName("methods")
    val methods: List<PaymentMethod> = listOf(),

    @field:SerializedName("billing")
    val billing: BillingSchema = BillingSchema(),

    // Direct payment fields for backward compatibility
    @field:SerializedName("total")
    private val _total: Double = 0.0,

    @field:SerializedName("subTotal")
    private val _subTotal: Double = 0.0,

    @field:SerializedName("discount")
    private val _discount: Double = 0.0,

    @field:SerializedName("discountPercentage")
    private val _discountPercentage: Double = 0.0,

    @field:SerializedName("discountCode")
    private val _discountCode: String = "",

    @field:SerializedName("vat")
    private val _vat: Double = 0.0,

    @field:SerializedName("vatPercentage")
    private val _vatPercentage: String = "",

    @field:SerializedName("subTotalWithoutDiscount")
    private val _subTotalWithoutDiscount: Double = 0.0,

    @field:SerializedName("vatWithoutDiscount")
    private val _vatWithoutDiscount: Double = 0.0,

    @field:SerializedName("promotionPercentage")
    private val _promotionPercentage: Double = 0.0,

    @field:SerializedName("promotionRefs")
    private val _promotionRefs: List<String> = listOf()
) {
    // Use direct fields if available, otherwise fall back to billing object
    val total: Double get() = if (_total != 0.0) _total else billing.total
    val subTotal: Double get() = if (_subTotal != 0.0) _subTotal else billing.subTotal
    val discount: Double get() = if (_discount != 0.0) _discount else billing.discount
    val discountPercentage: Double get() = if (_discountPercentage != 0.0) _discountPercentage else billing.discountPercentage
    val discountCode: String get() = if (_discountCode.isNotEmpty()) _discountCode else billing.discountCode
    val vat: Double get() = if (_vat != 0.0) _vat else billing.vat
    val vatPercentage: Double get() = if (_vatPercentage.isNotEmpty()) _vatPercentage.toDoubleOrNull() ?: 0.0 else billing.vatPercentage
    val subTotalWithoutDiscount: Double get() = if (_subTotalWithoutDiscount != 0.0) _subTotalWithoutDiscount else billing.subTotalWithoutDiscount
    val vatWithoutDiscount: Double get() = if (_vatWithoutDiscount != 0.0) _vatWithoutDiscount else billing.vatWithoutDiscount
    val discountedVatAmount: Double get() = billing.discountedVatAmount
    val promotionPercentage: Double get() = if (_promotionPercentage != 0.0) _promotionPercentage else billing.promotionPercentage
    val totalDiscountPromotion: Double get() = billing.totalDiscountPromotion
    val promotionRefs: List<String> get() = if (_promotionRefs.isNotEmpty()) _promotionRefs else billing.promotionRefs
}

// Dine-in related class
data class DineinData(
    val noOfGuests: Int = 0,
    val tableRef: String = "",
    val table: String = "",
    val sectionRef: String = ""
)

// Refund related classes
data class RefundCharges(
    val name: Name = Name(),
    val chargeId: String = "",
    val totalCharge: Double = 0.0,
    val totalVatOnCharge: Double = 0.0
)

data class RefundSchema(
    val reason: String = "",
    val amount: Double = 0.0,
    val referenceNumber: String = "",
    val vat: Double = 0.0,
    val discountAmount: Double = 0.0,
    val discountPercentage: Double = 0.0,
    val vatWithoutDiscount: Double = 0.0,
    val hasMultipleVariants: Boolean? = null,
    val charges: List<RefundCharges> = listOf(),
    val items: List<ItemSchema> = listOf(),
    val refundedTo: List<RefundPaymentSchema> = listOf(),
    val cashier: CashierInfo? = null,
    val cashierRef: String? = null,
    val date: String? = null,
    val device: DeviceInfo = DeviceInfo(),
    val deviceRef: String = ""
)

// Order item class
data class OrderItem(
    val itemSubTotal: Double = 0.0,
    val isOpenPrice: Boolean? = null,
    val image: String = "",
    val name: Name = Name(),
    val contains: String? = null,
    val category: CategoryInfo = CategoryInfo(),
    val promotionsData: PromotionsData = PromotionsData(),
    val productRef: String? = null,
    val categoryRef: String? = null,
    val variantNameEn: String = "",
    val variantNameAr: String = "",
    val type: String = "",
    val sku: String = "",
    val parentSku: String = "",
    val boxSku: String = "",
    val crateSku: String = "",
    val boxRef: String? = null,
    val crateRef: String? = null,
    val isFree: Boolean = false,
    val isQtyFree: Boolean = false,
    val discountedTotal: Double = 0.0,
    val discountedVat: String = "0",
    val costPrice: Double = 0.0,
    val sellingPrice: Double = 0.0,
    val total: Double = 0.0,
    val amountBeforeVoidComp: Double = 0.0,
    val qty: Int = 0,
    val hasMultipleVariants: Boolean? = null,
    val discount: Double = 0.0,
    val discountPercentage: Double = 0.0,
    val promotionPercentage: Double = 0.0,
    val vat: Double = 0.0,
    val vatPercentage: Double = 0.0,
    val unit: String = "",
    val note: String = "",
    val refundedQty: Int = 0,
    val noOfUnits: Int = 0,
    val availability: Boolean = false,
    val stockCount: Int = 0,
    val tracking: Boolean = false,
    val void: Boolean = false,
    val voidRef: String = "",
    val voidReason: Name = Name(),
    val comp: Boolean = false,
    val compRef: String? = null,
    val compReason: Name = Name(),
    val kitchenName: String = "",
    val kotId: String = "",
    val sentToKotAt: String = "",
    val printerId: String? = null,
    val modifiers: List<ItemModifiers>? = null
)

// Main Order class
data class Order(
    val _id: String? = null,
    val company: CompanyInfo = CompanyInfo(),
    val companyRef: String = "",
    val location: LocationInfo = LocationInfo(),
    val locationRef: String = "",
    val customer: CustomerInfo? = null,
    val customerRef: String? = null,
    val cashier: CashierInfo? = null,
    val cashierRef: String? = null,
    val device: DeviceInfo? = null,
    val deviceRef: String? = null,
    val orderNum: String = "",
    val tokenNum: String? = null,
    val orderType: String? = null,
    val orderStatus: String = "completed",
    val qrOrdering: Boolean = false,
    val onlineOrdering: Boolean = false,
    val specialInstructions: String? = null,
    val items: List<OrderItem> = listOf(),
    val payment: PaymentSchema = PaymentSchema(),
    val dineInData: DineinData = DineinData(),
    val refunds: List<RefundSchema> = listOf(),
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val acceptedAt: Date = Date(),
    val receivedAt: Date = Date(),
    val source: String = "local",
    val appliedDiscount: Boolean = false,
    val paymentMethod: List<String> = listOf(),
    val refundAvailable: Boolean = false,
    val currency: String = "SAR",
    val table: String? = null,
    val kotId: String? = null,
    val qrCode: String? = null,
    val changeSize: Boolean? = null
) {
    // Helper methods
    fun calculateTotal(): Double {
        return payment.total
    }

    fun isRefundable(): Boolean {
        return refundAvailable && orderStatus == "completed"
    }

    fun getTotalRefunded(): Double {
        return refunds.sumOf { it.amount }
    }

    fun getRefundableAmount(): Double {
        val total = calculateTotal()
        val refunded = getTotalRefunded()
        return maxOf(0.0, total - refunded)
    }
}
