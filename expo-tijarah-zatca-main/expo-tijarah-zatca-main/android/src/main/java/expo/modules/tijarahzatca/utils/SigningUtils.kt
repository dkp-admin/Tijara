package expo.modules.tijarahzatca.utils

import android.util.Base64
import android.util.Log
import expo.modules.kotlin.records.Record
import expo.modules.tijarahzatca.templates.DefaultUblExtensionTemplate
import expo.modules.tijarahzatca.templates.SignedPropertiesTemplate
import org.apache.xml.security.Init
import org.apache.xml.security.c14n.Canonicalizer
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.w3c.dom.Document
import org.xml.sax.InputSource
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.StringReader
import java.security.MessageDigest
import java.security.Security
import java.security.Signature
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import javax.xml.parsers.DocumentBuilderFactory

data class GenerateSignatureXMLParams(
    val invoice_xml: String,
    val certificate_string: String,
    val private_key_string: String
) : Record

data class SignedInvoiceResult(
    val signed_invoice_string: String,
    val invoice_hash: String,
    val qr: String
) : Record

data class CertificateInfo(
    val hash: String,
    val public_key: ByteArray,
    val signature: ByteArray,
    val issuer: String,
    val serial_number: String
) : Record

object SigningUtils {
    private const val TAG = "TJZatca"

    fun generateSignedXMLString(params: GenerateSignatureXMLParams): SignedInvoiceResult {

        val invoice_xml = params.invoice_xml
        val certificate_string = params.certificate_string
        val private_key_string = params.private_key_string


        val invoice_hash = getInvoiceHash(invoice_xml)


        val cert_info = getCertificateInfo(certificate_string)
        val digital_signature = createInvoiceDigitalSignature(invoice_hash, private_key_string)

        // 4: QR
        val qr =
            generateQR(
                invoice_xml = invoice_xml,
                invoice_hash = invoice_hash,
                digital_signature = digital_signature,
                public_key = cert_info.public_key,
                certificate_signature = cert_info.signature
            )

        val signed_invoice_string = processSignedProperties(
            invoice_xml,
            invoice_hash,
            digital_signature,
            certificate_string,
            qr,
            cert_info
        )

        return SignedInvoiceResult(
            signed_invoice_string = signed_invoice_string,
            invoice_hash = invoice_hash,
            qr = qr
        )
    }


    private fun processSignedProperties(
        invoice_xml: String,
        invoice_hash: String,
        digital_signature: String,
        certificate_string: String,
        qr: String,
        cert_info: CertificateInfo
    ): String {
        // 5: Signed properties props - using Saudi timezone for ZATCA compliance
        val formatted_datetime =
            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US)
                .apply { timeZone = TimeZone.getTimeZone("Asia/Riyadh") }
                .format(Date())

        val signed_properties_props =
            mapOf(
                "sign_timestamp" to formatted_datetime,
                "certificate_hash" to cert_info.hash,
                "certificate_issuer" to cert_info.issuer,
                "certificate_serial_number" to cert_info.serial_number
            )

        val ubl_signature_signed_properties_xml_string_for_signing =
            SignedPropertiesTemplate.populateForSigning(signed_properties_props)
        val ubl_signature_signed_properties_xml_string =
            SignedPropertiesTemplate.populate(signed_properties_props)

        // 6: Get SignedProperties hash
        val signed_properties_bytes =
            ubl_signature_signed_properties_xml_string_for_signing.toByteArray(Charsets.UTF_8)

        val digest = MessageDigest.getInstance("SHA-256")
        val signed_properties_hash_hex =
            digest.digest(signed_properties_bytes).joinToString("") { "%02x".format(it) }
        val signed_properties_hash =
            Base64.encodeToString(
                signed_properties_hash_hex.toByteArray(Charsets.UTF_8),
                Base64.NO_WRAP
            )

        // 7: UBL Extensions
        val ubl_signature_xml_string =
            DefaultUblExtensionTemplate.populate(
                invoice_hash,
                signed_properties_hash,
                digital_signature,
                cleanUpCertificateString(certificate_string),
                ubl_signature_signed_properties_xml_string
            )

        // 8: Insert UBL Extensions and QR into invoice XML
        var unsigned_invoice_str = invoice_xml
        unsigned_invoice_str =
            unsigned_invoice_str.replace("SET_UBL_EXTENSIONS_STRING", ubl_signature_xml_string)
        unsigned_invoice_str = unsigned_invoice_str.replace("SET_QR_CODE_DATA", qr)

        // 9: XML post-processing if needed (indentation fix)
        return signedPropertiesIndentationFix(unsigned_invoice_str)
    }

    private fun getInvoiceHash(invoice_xml: String): String {
        var pure_invoice_string = getPureInvoiceString(invoice_xml)

        pure_invoice_string = pure_invoice_string.replace(
            "<cbc:ProfileID>",
            "\n    <cbc:ProfileID>",
        );
        pure_invoice_string = pure_invoice_string.replace(
            "<cac:AccountingSupplierParty>",
            "\n    \n    <cac:AccountingSupplierParty>",
        );

        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(pure_invoice_string.toByteArray(Charsets.UTF_8))
        val hash = Base64.encodeToString(hashBytes, Base64.NO_WRAP)
        return hash
    }

    private fun getPureInvoiceString(invoice_xml: String): String {
        val invoiceCopy = XMLDocument(invoice_xml)

        invoiceCopy.delete("Invoice/ext:UBLExtensions")
        invoiceCopy.delete("Invoice/cac:Signature")
        invoiceCopy.delete("Invoice/cac:AdditionalDocumentReference", mapOf("cbc:ID" to "QR"))

        // Step 2: Get string with 4-space indentation (matching API format)
        var cleanedXmlString = invoiceCopy.toString(noHeader = false)

        // Clean up extra whitespace/line breaks left by deletions
        cleanedXmlString = cleanedXmlString.replace(Regex("\\n\\s*\\n"), "\n")

        // Step 3: Initialize Apache Santuario (only once per app)
        Init.init()

        // Step 4: Parse XML into DOM Document (namespace aware)
        val docBuilder = DocumentBuilderFactory.newInstance().apply {
            isNamespaceAware = true
        }.newDocumentBuilder()

        val document: Document = docBuilder.parse(InputSource(StringReader(cleanedXmlString)))

        val canonicalizer = Canonicalizer.getInstance(Canonicalizer.ALGO_ID_C14N_OMIT_COMMENTS)
        val outputStream = ByteArrayOutputStream()
        canonicalizer.canonicalizeSubtree(document, outputStream)

        // Step 6: Return canonicalized XML string without explicit UTF-8 conversion
        return outputStream.toString()
    }

    private fun getCertificateInfo(certificate_string: String): CertificateInfo {
        val cleanedup_certificate_string = cleanUpCertificateString(certificate_string)


        val hash = getCertificateHash(cleanedup_certificate_string)

        val certBytes = Base64.decode(cleanedup_certificate_string, Base64.DEFAULT)
        val certFactory = CertificateFactory.getInstance("X.509")
        val cert =
            certFactory.generateCertificate(ByteArrayInputStream(certBytes)) as X509Certificate

        return CertificateInfo(
            hash = hash,
            public_key = cert.publicKey.encoded,
            signature = cert.signature,
            issuer =
                cert.issuerDN
                    .name
                    .split("\n")
                    .reversed()
                    .joinToString(", ")
                    .replace(",DC=", ", DC="),
            serial_number = java.math.BigInteger(cert.serialNumber.toString(16), 16).toString(10)
        )
    }

    private fun getCertificateHash(certificate_string: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(certificate_string.toByteArray())
        val hexString = hashBytes.joinToString("") { "%02x".format(it) }
        return Base64.encodeToString(hexString.toByteArray(), Base64.NO_WRAP)
    }


    private fun createInvoiceDigitalSignature(
        invoice_hash: String,
        private_key_string: String
    ): String {
        // Register BC as first provider
        val bcProvider = BouncyCastleProvider()
        if (Security.getProvider(bcProvider.name) == null) {
            Security.insertProviderAt(bcProvider, 1)
        }

        val invoiceHashBytes = Base64.decode(invoice_hash, Base64.DEFAULT)
        val cleanedUpPrivateKeyString = cleanUpPrivateKeyString(private_key_string)
        val pemKey =
            "-----BEGIN EC PRIVATE KEY-----\n$cleanedUpPrivateKeyString\n-----END EC PRIVATE KEY-----"
        val privateKey = parseECPrivateKeyFromPem(pemKey)

        val signature = Signature.getInstance("SHA256withECDSA", bcProvider)
        signature.initSign(privateKey)
        signature.update(invoiceHashBytes)
        val signatureBytes = signature.sign()
        return Base64.encodeToString(signatureBytes, Base64.NO_WRAP)
    }


    private fun generateQR(
        invoice_xml: String,
        invoice_hash: String,
        digital_signature: String,
        public_key: ByteArray,
        certificate_signature: ByteArray
    ): String {

        val seller_name =
            extractXMLValue(
                invoice_xml,
                "cac:AccountingSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName"
            )
                ?: ""
        val VAT_number =
            extractXMLValue(
                invoice_xml,
                "cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"
            )
                ?: ""
        val invoice_total =
            extractXMLValue(invoice_xml, "cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount") ?: ""
        val VAT_total = extractXMLValue(invoice_xml, "cac:TaxTotal/cbc:TaxAmount") ?: ""

        val issue_date = extractXMLValue(invoice_xml, "cbc:IssueDate") ?: ""
        val issue_time = extractXMLValue(invoice_xml, "cbc:IssueTime") ?: ""

        val invoice_type = extractXMLAttribute(invoice_xml, "cbc:InvoiceTypeCode", "name") ?: ""

        val datetime = "${issue_date}T${issue_time}"
        val formatted_datetime = datetime

        if (seller_name.isEmpty() ||
            VAT_number.isEmpty() ||
            invoice_total.isEmpty() ||
            VAT_total.isEmpty()
        ) {
            Log.e(TAG, "ERROR: Missing required QR fields!")
            Log.e(TAG, "Seller name empty: ${seller_name.isEmpty()}")
            Log.e(TAG, "VAT number empty: ${VAT_number.isEmpty()}")
            Log.e(TAG, "Invoice total empty: ${invoice_total.isEmpty()}")
            Log.e(TAG, "VAT total empty: ${VAT_total.isEmpty()}")
        }

        val qr_tlv =
            TLV(
                arrayOf(
                    seller_name,
                    VAT_number,
                    formatted_datetime,
                    invoice_total,
                    VAT_total,
                    invoice_hash,
                    digital_signature.toByteArray(),
                    public_key,
                    certificate_signature
                )
            )

        return Base64.encodeToString(qr_tlv, Base64.NO_WRAP)
    }


    private fun signedPropertiesIndentationFix(signed_invoice_string: String): String {
        try {
            var fixer = signed_invoice_string

            // Check if the required tags exist
            val objectStartParts = fixer.split("<ds:Object>")
            if (objectStartParts.size < 2) {
                Log.w(TAG, "No <ds:Object> tag found, skipping indentation fix")
                return fixer
            }

            val objectEndParts = objectStartParts[1].split("</ds:Object>")
            if (objectEndParts.isEmpty()) {
                Log.w(TAG, "No </ds:Object> tag found, skipping indentation fix")
                return fixer
            }

            var signed_props_lines = objectEndParts[0].split("\n")
            var fixed_lines = mutableListOf<String>()

            // Stripping first 4 spaces
            signed_props_lines.forEach { line ->
                fixed_lines.add(line.substring(4.coerceAtMost(line.length)))
            }

            signed_props_lines = signed_props_lines.dropLast(1)
            fixed_lines = fixed_lines.dropLast(1).toMutableList()

            fixer =
                fixer.replace(signed_props_lines.joinToString("\n"), fixed_lines.joinToString("\n"))
            return fixer
        } catch (e: Exception) {
            return signed_invoice_string
        }
    }


    private fun TLV(tags: Array<Any>): ByteArray {
        val tlv_tags = mutableListOf<ByteArray>()
        tags.forEachIndexed { i, tag ->
            if (tag != null) {
                val tagValueBuffer =
                    when (tag) {
                        is String -> tag.toByteArray()
                        is ByteArray -> tag
                        else -> tag.toString().toByteArray()
                    }
                val current_tlv_value = ByteArray(2 + tagValueBuffer.size)
                current_tlv_value[0] = (i + 1).toByte() // Tag number (1-based)
                current_tlv_value[1] = tagValueBuffer.size.toByte() // Length
                System.arraycopy(
                    tagValueBuffer,
                    0,
                    current_tlv_value,
                    2,
                    tagValueBuffer.size
                ) // Value
                tlv_tags.add(current_tlv_value)
            }
        }

        val totalSize = tlv_tags.sumOf { it.size }
        val result = ByteArray(totalSize)
        var offset = 0
        tlv_tags.forEach { tag ->
            System.arraycopy(tag, 0, result, offset, tag.size)
            offset += tag.size
        }
        return result
    }


}
