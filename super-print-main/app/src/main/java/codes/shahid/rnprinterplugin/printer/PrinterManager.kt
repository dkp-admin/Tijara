package codes.shahid.rnprinterplugin.printer

import android.content.Context
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.util.Log
import codes.shahid.rnprinterplugin.printer.bluetooth.BluetoothPrinter
import codes.shahid.rnprinterplugin.printer.lan.LanPrinter
import codes.shahid.rnprinterplugin.printer.neoleap.NeoleapPrinter
import codes.shahid.rnprinterplugin.printer.sunmi.SunmiPrinter
import codes.shahid.rnprinterplugin.printer.usb.UsbPrinter
import codes.shahid.rnprinterplugin.types.Printer
import codes.shahid.rnprinterplugin.types.PrinterConnectionParams
import codes.shahid.rnprinterplugin.types.PrinterType

class PrinterManager(private val context: Context) {

    companion object {
        private const val TAG = "PrinterManager"

        // Cache printer instances to avoid creating new ones for each print job
        private val printerInstances = HashMap<String, BasePrinter>()
    }

    fun createPrinter(printerData: Printer): BasePrinter? {
        val printerId = printerData.id ?: return createNewPrinterInstance(printerData)

        // Use cached printer instance if available
        if (printerInstances.containsKey(printerId)) {
            Log.d(TAG, "Using cached printer instance for ${printerData.name} (${printerData.printerType})")
            return printerInstances[printerId]
        }

        // Create a new printer instance and cache it
        val printer = createNewPrinterInstance(printerData)
        if (printer != null && printerId.isNotBlank()) {
            printerInstances[printerId] = printer
            Log.d(TAG, "Created and cached new printer instance for ${printerData.name} (${printerData.printerType})")
        }

        return printer
    }

    private fun createNewPrinterInstance(printerData: Printer): BasePrinter? {
        Log.d("USB_DEBUG", "🏭 Creating new printer instance for ${printerData.printerType}, printerId: ${printerData.id}")
        return when (printerData.printerType.lowercase()) {
            "usb" -> {
                Log.d("USB_DEBUG", "🔌 Creating UsbPrinter with printerId: ${printerData.id}")
                UsbPrinter(context, printerData.id)
            }
            "bluetooth" -> BluetoothPrinter(context)
            "lan" -> LanPrinter(context)
            "sunmi" -> SunmiPrinter(context)
            "neoleap" -> NeoleapPrinter(context)
            else -> {
                Log.w(TAG, "Unknown printer type: ${printerData.printerType}")
                null
            }
        }
    }

    fun initializePrinter(printerData: Printer): Map<String, Any> {
        try {
            val printer = createPrinter(printerData)

            if (printer == null) {
                return mapOf(
                    "id" to (printerData.id ?: ""),
                    "name" to printerData.name,
                    "status" to "unknown_type",
                    "message" to "Unknown printer type: ${printerData.printerType}"
                )
            }

            printer.initialize()
            connectPrinter(printer, printerData)

            return mapOf(
                "id" to (printerData.id ?: ""),
                "name" to printerData.name,
                "status" to "initialized",
                "message" to "Printer initialized successfully"
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing printer ${printerData.name}: ${e.message}")

            // Remove from cache if initialization fails
            if (printerData.id != null) {
                printerInstances.remove(printerData.id)
            }

            return mapOf(
                "id" to (printerData.id ?: ""),
                "name" to printerData.name,
                "status" to "error",
                "error" to (e.message ?: "Unknown error"),
                "message" to "Failed to initialize printer"
            )
        }
    }

    private fun connectPrinter(printer: BasePrinter, printerData: Printer) {
        when (printerData.printerType.lowercase()) {
            "usb" -> {
                if (printerData.productId.isNotBlank()) {
                    printer.connect(
                        PrinterConnectionParams(
                            type = PrinterType.USB,
                            productId = printerData.productId
                        )
                    )
                }
            }
            "lan" -> {
                Log.d(TAG, "Connecting to ${printerData.toString()}")
                if (printerData.ip.isNotBlank() && printerData.port > 0) {
                    printer.connect(
                        PrinterConnectionParams(
                            type = PrinterType.LAN,
                            ip = printerData.ip,
                            port = printerData.port
                        )
                    )
                }
            }
            "bluetooth" -> {
                printer.connect(
                    PrinterConnectionParams(
                        type = PrinterType.BLUETOOTH,
                        macAddress = printerData.macAddress
                    )
                )
            }
            "sunmi" -> {
                // Sunmi printers are built-in, so we just need to connect without specific parameters
                Log.d(TAG, "Connecting to Sunmi built-in printer")
                printer.connect(
                    PrinterConnectionParams(
                        type = PrinterType.SUNMI
                    )
                )
            }
            "neoleap" -> {
                // Neoleap printers are built-in, so we just need to connect without specific parameters
                Log.d(TAG, "Connecting to Neoleap built-in printer")
                printer.connect(
                    PrinterConnectionParams(
                        type = PrinterType.NEOLEAP
                    )
                )
            }
        }
    }

    // Method to clear a printer from the cache if needed
    fun clearPrinterCache(printerId: String) {
        if (printerInstances.containsKey(printerId)) {
            Log.d(TAG, "Removing printer instance from cache: $printerId")
            printerInstances.remove(printerId)
        }
    }

    // Method to clear all USB printer caches
    fun clearAllUsbPrinterCaches() {
        Log.d("USB_DEBUG", "🧹 Clearing all USB printer caches")
        UsbPrinter.clearAllCachedConnections()
        // Also clear printer instances for USB printers
        val usbPrinterIds = printerInstances.keys.toList()
        usbPrinterIds.forEach { printerId ->
            clearPrinterCache(printerId)
        }
    }

    // Method to clear all LAN printer caches when network issues are detected
    fun clearAllLanPrinterCaches() {
        Log.d(TAG, "Clearing all LAN printer caches due to network issues")
        LanPrinter.clearAllCachedConnections()

        // Also remove LAN printer instances from the manager cache
        val lanPrinterIds = printerInstances.filter { (_, printer) ->
            printer is LanPrinter
        }.keys.toList()

        lanPrinterIds.forEach { printerId ->
            Log.d(TAG, "Removing LAN printer instance from cache: $printerId")
            printerInstances.remove(printerId)
        }
    }

    fun getUsbDevices(): List<Map<String, Any>> {
        val usbManager = context.getSystemService(Context.USB_SERVICE) as UsbManager
        val devices = usbManager.deviceList.values.map { device ->
            mapOf(
                "id" to device.deviceId.toString(),
                "deviceName" to device.deviceName,
                "productId" to device.productId.toString(),
                "vendorId" to device.vendorId.toString()
            )
        }
        return devices
    }
}
