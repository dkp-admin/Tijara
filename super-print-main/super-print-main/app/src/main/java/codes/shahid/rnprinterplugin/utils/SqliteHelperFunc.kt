import codes.shahid.rnprinterplugin.types.Printer
import android.util.Log


fun mapToPrinter(map: Map<String, Any>): Printer {
    // Handle port value properly - it can come as Int, Double, or String from JavaScript
    val portValue = when (val port = map["port"]) {
        is Int -> port
        is Double -> port.toInt()
        is String -> port.toIntOrNull() ?: 0
        is Number -> port.toInt()
        else -> 0
    }

    Log.d("mapToPrinter", "Port value type: ${map["port"]?.javaClass?.name}, value: ${map["port"]}, converted: $portValue")

    return Printer(
        id = (map["id"] as? String) ?: "",
        name = (map["name"] as? String) ?: "",
        deviceName = (map["deviceName"] as? String) ?: "",
        deviceId = (map["deviceId"] as? String) ?: "",
        productId = (map["productId"] as? String) ?: "",
        vendorId = (map["vendorId"] as? String) ?: "",
        printerType = (map["printerType"] as? String) ?: "usb",
        printerSize = (map["printerSize"] as? String) ?: "3-inch",
        ip = (map["ip"] as? String) ?: "",
        port = portValue,
        enableReceipts = (map["enableReceipts"] as? Boolean) ?: false,
        enableKOT = (map["enableKOT"] as? Boolean) ?: false,
        enableBarcodes = (map["enableBarcodes"] as? Boolean) ?: false,
        printerWidthMM = (map["printerWidthMM"] as? String) ?: "72",
        charsPerLine = (map["charsPerLine"] as? String) ?: "44",
        kitchenRef = (map["kitchenRef"] as? String)
    )
}

 fun printerToMap(printer: Printer): Map<String, Any> {
    val map = mutableMapOf<String, Any>()

    map["id"] = printer.id
    map["name"] = printer.name
    map["deviceName"] = printer.deviceName
    map["deviceId"] = printer.deviceId
    map["productId"] = printer.productId
    map["vendorId"] = printer.vendorId
    map["printerType"] = printer.printerType
    map["printerSize"] = printer.printerSize
    map["ip"] = printer.ip
    map["port"] = printer.port
    map["enableReceipts"] = printer.enableReceipts
    map["enableKOT"] = printer.enableKOT
    map["enableBarcodes"] = printer.enableBarcodes
    map["printerWidthMM"] = printer.printerWidthMM
    map["charsPerLine"] = printer.charsPerLine
    printer.kitchenRef?.let { map["kitchenRef"] = it }

    return map
}