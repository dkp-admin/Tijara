package expo.modules.tijarahzatca.utils

import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.bouncycastle.openssl.PEMParser
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter
import java.io.StringReader
import java.security.PrivateKey

fun parseECPrivateKeyFromPem(pem: String): PrivateKey {
    val pemParser = PEMParser(StringReader(pem))
    val converter = JcaPEMKeyConverter().setProvider(BouncyCastleProvider())
    val obj = pemParser.readObject()
    return when (obj) {
        is org.bouncycastle.openssl.PEMKeyPair -> converter.getKeyPair(obj).private
        is org.bouncycastle.asn1.sec.ECPrivateKey ->
            converter.getPrivateKey(org.bouncycastle.asn1.pkcs.PrivateKeyInfo.getInstance(obj))

        is org.bouncycastle.asn1.pkcs.PrivateKeyInfo -> converter.getPrivateKey(obj)
        else -> throw IllegalArgumentException("Unsupported PEM format: ${obj?.javaClass}")
    }
}