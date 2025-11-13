package expo.modules.tijarahzatca.templates

import expo.modules.tijarahzatca.types.ZATCAPaymentMethods

/**
 * Template for payment means used in cancellation scenarios (BR-KSA-17)
 * This template generates the XML structure for payment means in credit/debit notes
 */
object PaymentMeansTemplate {

    private val template = """
    <cac:PaymentMeans>
        <cbc:PaymentMeansCode>SET_PAYMENT_MEANS_CODE</cbc:PaymentMeansCode>
        <cbc:InstructionNote>SET_INSTRUCTION_NOTE</cbc:InstructionNote>
    </cac:PaymentMeans>"""

    /**
     * Populates the payment means template with payment method and instruction note
     * @param paymentMethod The payment method code (CASH, CREDIT, etc.)
     * @param instructionNote The instruction note/reason for the payment
     * @return The populated XML string for payment means
     */
    fun populate(paymentMethod: ZATCAPaymentMethods, instructionNote: String): String {
        var populatedTemplate = template
        populatedTemplate = populatedTemplate.replace("SET_PAYMENT_MEANS_CODE", paymentMethod.value)
        populatedTemplate = populatedTemplate.replace("SET_INSTRUCTION_NOTE", instructionNote)
        return populatedTemplate
    }
}
