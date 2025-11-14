package expo.modules.tijarahzatca.templates

import expo.modules.tijarahzatca.types.*

/**
 * Maybe use a templating engine instead of str replace.
 * This works for now though
 *
 * cbc:InvoiceTypeCode: 388: BR-KSA-05 Tax Invoice according to UN/CEFACT codelist 1001, D.16B for KSA.
 *  name="0211010": BR-KSA-06 starts with "02" Simplified Tax Invoice. Also explains other positions.
 * cac:AdditionalDocumentReference: ICV: KSA-16, BR-KSA-33 (Invoice Counter number)
 */
object SimplifiedTaxInvoiceTemplate {

    private val template = """<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
    <ext:UBLExtensions>SET_UBL_EXTENSIONS_STRING
    </ext:UBLExtensions>
    <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
    <cbc:ID>SET_INVOICE_SERIAL_NUMBER</cbc:ID>
    <cbc:UUID>SET_TERMINAL_UUID</cbc:UUID>
    <cbc:IssueDate>SET_ISSUE_DATE</cbc:IssueDate>
    <cbc:IssueTime>SET_ISSUE_TIME</cbc:IssueTime>
    <cbc:InvoiceTypeCode name="0211010">SET_INVOICE_TYPE</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
    <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>SET_BILLING_REFERENCE
    <cac:AdditionalDocumentReference>
        <cbc:ID>ICV</cbc:ID>
        <cbc:UUID>SET_INVOICE_COUNTER_NUMBER</cbc:UUID>
    </cac:AdditionalDocumentReference>
    <cac:AdditionalDocumentReference>
        <cbc:ID>PIH</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">SET_PREVIOUS_INVOICE_HASH</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>
    <cac:AdditionalDocumentReference>
        <cbc:ID>QR</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">SET_QR_CODE_DATA</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>
    <cac:Signature>
        <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
        <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
    </cac:Signature>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="CRN">SET_COMMERCIAL_REGISTRATION_NUMBER</cbc:ID>
            </cac:PartyIdentification>
            <cac:PostalAddress>
                <cbc:StreetName>SET_STREET_NAME</cbc:StreetName>
                <cbc:BuildingNumber>SET_BUILDING_NUMBER</cbc:BuildingNumber>
                <cbc:PlotIdentification>SET_PLOT_IDENTIFICATION</cbc:PlotIdentification>
                <cbc:CitySubdivisionName>SET_CITY_SUBDIVISION</cbc:CitySubdivisionName>
                <cbc:CityName>SET_CITY</cbc:CityName>
                <cbc:PostalZone>SET_POSTAL_NUMBER</cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>SA</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>SET_VAT_NUMBER</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>SET_VAT_NAME</cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingSupplierParty>SET_PAYMENT_MEANS
</Invoice>
"""

    fun populate(
        egsInfo: EGSUnitInfo,
        invoiceCounterNumber: Int,
        invoiceSerialNumber: String,
        issueDate: String,
        issueTime: String,
        previousInvoiceHash: String,
        invoiceType: ZATCAInvoiceTypes = ZATCAInvoiceTypes.INVOICE,
        cancellation: ZATCASimplifiedInvoiceCancelation? = null
    ): String {
        var populatedTemplate = template

        populatedTemplate = populatedTemplate.replace("SET_INVOICE_TYPE", invoiceType.value)

        // if canceled (BR-KSA-56) set reference number to canceled invoice
        if (cancellation != null) {
            populatedTemplate = populatedTemplate.replace(
                "SET_BILLING_REFERENCE",
                InvoiceBillingReferenceTemplate.populate(cancellation.canceled_invoice_number)
            )
        } else {
            populatedTemplate = populatedTemplate.replace("SET_BILLING_REFERENCE", "")
        }

        if (cancellation != null) {
            populatedTemplate = populatedTemplate.replace(
                "SET_PAYMENT_MEANS",
                PaymentMeansTemplate.populate(
                    cancellation.payment_method,
                    cancellation.reason
                )
            )
        } else {
            populatedTemplate = populatedTemplate.replace("SET_PAYMENT_MEANS", "")
        }

        populatedTemplate = populatedTemplate.replace("SET_INVOICE_SERIAL_NUMBER", invoiceSerialNumber)
        populatedTemplate = populatedTemplate.replace("SET_TERMINAL_UUID", egsInfo.uuid)
        populatedTemplate = populatedTemplate.replace("SET_ISSUE_DATE", issueDate)
        populatedTemplate = populatedTemplate.replace("SET_ISSUE_TIME", issueTime)
        populatedTemplate = populatedTemplate.replace("SET_PREVIOUS_INVOICE_HASH", previousInvoiceHash)
        populatedTemplate = populatedTemplate.replace("SET_INVOICE_COUNTER_NUMBER", invoiceCounterNumber.toString())
        populatedTemplate = populatedTemplate.replace("SET_COMMERCIAL_REGISTRATION_NUMBER", egsInfo.CRN_number)
        populatedTemplate = populatedTemplate.replace("SET_STREET_NAME", egsInfo.location.street)
        populatedTemplate = populatedTemplate.replace("SET_BUILDING_NUMBER", egsInfo.location.building)
        populatedTemplate = populatedTemplate.replace("SET_PLOT_IDENTIFICATION", egsInfo.location.plot_identification)
        populatedTemplate = populatedTemplate.replace("SET_CITY_SUBDIVISION", egsInfo.location.city_subdivision)
        populatedTemplate = populatedTemplate.replace("SET_CITY", egsInfo.location.city)
        populatedTemplate = populatedTemplate.replace("SET_POSTAL_NUMBER", egsInfo.location.postal_zone)
        populatedTemplate = populatedTemplate.replace("SET_VAT_NUMBER", egsInfo.VAT_number)
        populatedTemplate = populatedTemplate.replace("SET_VAT_NAME", egsInfo.VAT_name)

        return populatedTemplate
    }
}