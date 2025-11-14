package codes.shahid.rnprinterplugin.types

data class PrinterConnectionParams(
    val type: PrinterType,
    val productId: String? = null,
    val ip: String? = null,
    val port: Int? = null,
    val macAddress: String? = null
)
