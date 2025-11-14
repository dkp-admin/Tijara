package expo.modules.tijarahzatca.templates

object SignedPropertiesTemplate {

    fun getTemplateForSigning(): String {
        return """<xades:SignedProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Id="xadesSignedProperties">
                                    <xades:SignedSignatureProperties>
                                        <xades:SigningTime>SET_SIGN_TIMESTAMP</xades:SigningTime>
                                        <xades:SigningCertificate>
                                            <xades:Cert>
                                                <xades:CertDigest>
                                                    <ds:DigestMethod xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                                                    <ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">SET_CERTIFICATE_HASH</ds:DigestValue>
                                                </xades:CertDigest>
                                                <xades:IssuerSerial>
                                                    <ds:X509IssuerName xmlns:ds="http://www.w3.org/2000/09/xmldsig#">SET_CERTIFICATE_ISSUER</ds:X509IssuerName>
                                                    <ds:X509SerialNumber xmlns:ds="http://www.w3.org/2000/09/xmldsig#">SET_CERTIFICATE_SERIAL_NUMBER</ds:X509SerialNumber>
                                                </xades:IssuerSerial>
                                            </xades:Cert>
                                        </xades:SigningCertificate>
                                    </xades:SignedSignatureProperties>
                                </xades:SignedProperties>"""
    }

    fun getTemplate(): String {
        return """<xades:SignedProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Id="xadesSignedProperties">
                                        <xades:SignedSignatureProperties>
                                            <xades:SigningTime>SET_SIGN_TIMESTAMP</xades:SigningTime>
                                            <xades:SigningCertificate>
                                                <xades:Cert>
                                                    <xades:CertDigest>
                                                        <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"></ds:DigestMethod>
                                                        <ds:DigestValue>SET_CERTIFICATE_HASH</ds:DigestValue>
                                                    </xades:CertDigest>
                                                    <xades:IssuerSerial>
                                                        <ds:X509IssuerName>SET_CERTIFICATE_ISSUER</ds:X509IssuerName>
                                                        <ds:X509SerialNumber>SET_CERTIFICATE_SERIAL_NUMBER</ds:X509SerialNumber>
                                                    </xades:IssuerSerial>
                                                </xades:Cert>
                                            </xades:SigningCertificate>
                                        </xades:SignedSignatureProperties>
                                    </xades:SignedProperties>"""
    }

    fun populateForSigning(props: Map<String, String>): String {
        var populatedTemplate = getTemplateForSigning()
        populatedTemplate =
            populatedTemplate.replace("SET_SIGN_TIMESTAMP", props["sign_timestamp"] ?: "")
        populatedTemplate =
            populatedTemplate.replace("SET_CERTIFICATE_HASH", props["certificate_hash"] ?: "")
        populatedTemplate =
            populatedTemplate.replace("SET_CERTIFICATE_ISSUER", props["certificate_issuer"] ?: "")
        populatedTemplate = populatedTemplate.replace(
            "SET_CERTIFICATE_SERIAL_NUMBER",
            props["certificate_serial_number"] ?: ""
        )
        return populatedTemplate
    }

    fun populate(props: Map<String, String>): String {
        var populatedTemplate = getTemplate()
        populatedTemplate =
            populatedTemplate.replace("SET_SIGN_TIMESTAMP", props["sign_timestamp"] ?: "")
        populatedTemplate =
            populatedTemplate.replace("SET_CERTIFICATE_HASH", props["certificate_hash"] ?: "")
        populatedTemplate =
            populatedTemplate.replace("SET_CERTIFICATE_ISSUER", props["certificate_issuer"] ?: "")
        populatedTemplate = populatedTemplate.replace(
            "SET_CERTIFICATE_SERIAL_NUMBER",
            props["certificate_serial_number"] ?: ""
        )
        return populatedTemplate
    }
}
