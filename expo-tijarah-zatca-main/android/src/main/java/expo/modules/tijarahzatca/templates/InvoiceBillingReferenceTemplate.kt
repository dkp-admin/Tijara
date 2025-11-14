package expo.modules.tijarahzatca.templates

/**
 * Template for billing reference used in cancellation scenarios (BR-KSA-56)
 * This template generates the XML structure for referencing a canceled invoice
 */
object InvoiceBillingReferenceTemplate {

    private val template = """
    <cac:BillingReference>
        <cac:InvoiceDocumentReference>
            <cbc:ID>Invoice Number: SET_INVOICE_NUMBER</cbc:ID>
        </cac:InvoiceDocumentReference>
    </cac:BillingReference>"""

    /**
     * Populates the billing reference template with the canceled invoice number
     * @param invoiceNumber The number of the canceled invoice to reference
     * @return The populated XML string for billing reference
     */
    fun populate(invoiceNumber: Int): String {
        return template.replace("SET_INVOICE_NUMBER", invoiceNumber.toString())
    }
}
