package expo.modules.tijarahzatca.utils

fun cleanUpPrivateKeyString(privateKeyString: String): String {
    return privateKeyString
        .replace("-----BEGIN EC PRIVATE KEY-----", "")
        .replace("-----END EC PRIVATE KEY-----", "")
        .replace("\n", "")
        .replace("\r", "")
        .trim()
}

fun cleanUpCertificateString(certificateString: String): String {
    return certificateString
        .replace("-----BEGIN CERTIFICATE-----\n", "")
        .replace("-----END CERTIFICATE-----", "")
        .trim()
}

