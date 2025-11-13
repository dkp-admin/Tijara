package codes.shahid.rnprinterplugin.types

import codes.shahid.rnprinterplugin.types.KitchenInfo

data class Printer(
    val id: String = "",
    val name: String = "",
    val deviceName: String = "",
    val deviceId: String = "",
    val productId: String = "",
    val macAddress: String = "",
    val vendorId: String = "",
    val printerType: String = "usb",
    val printerSize: String = "3-inch",
    val ip: String = "",
    val port: Int = 0,
    val enableReceipts: Boolean = false,
    val enableKOT: Boolean = false,
    val enableBarcodes: Boolean = false,
    val printerWidthMM: String = "72",
    val charsPerLine: String = "44",
    val kitchen: KitchenInfo? = null,
    val kitchenRef: String? = null,
    val kitchenIds: String = "",
    val model: String = "",
    val numberOfPrints: Int = 1,
    val numberOfKotPrints: Int = 1
)
