package codes.shahid.rnprinterplugin.printer.usb

import android.app.PendingIntent
import android.content.*
import android.hardware.usb.UsbConstants
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.dantsu.escposprinter.EscPosPrinter
import com.dantsu.escposprinter.connection.usb.UsbConnection
import codes.shahid.rnprinterplugin.printer.BasePrinter
import codes.shahid.rnprinterplugin.printer.usb.templates.UsbTemplates
import codes.shahid.rnprinterplugin.types.Order
import codes.shahid.rnprinterplugin.types.Printer
import codes.shahid.rnprinterplugin.types.PrinterConnectionParams

class UsbPrinter(
    private val context: Context,
    private val printerId: String = ""
) : BasePrinter {

    companion object {
        private const val TAG = "UsbPrinter"
        private const val ACTION_USB_PERMISSION = "expo.modules.printsupport.USB_PERMISSION"

        // Static cache for USB connections and printers to avoid creating new connections for each print job
        private val cachedConnections = HashMap<String, UsbConnection>()
        private val cachedPrinters = HashMap<String, EscPosPrinter>()

        // Counter for generating simple printer numbers for debugging
        private var printerCounter = 0
        private val printerIdToNumber = HashMap<String, Int>()

        // Method to get a simple number for a printer ID
        private fun getPrinterNumber(printerId: String): Int {
            return printerIdToNumber.getOrPut(printerId) {
                ++printerCounter
            }
        }

        // Method to clear all cached connections (useful for debugging and forcing fresh connections)
        fun clearAllCachedConnections() {
            Log.d("USB_DEBUG", "🧹 Clearing ALL cached USB connections and printers")
            cachedConnections.clear()
            cachedPrinters.clear()
            printerCounter = 0
            printerIdToNumber.clear()
        }
    }

    private var printerName = "Usb Printer"
    private val usbManager = context.getSystemService(Context.USB_SERVICE) as UsbManager
    private var usbDevice: UsbDevice? = null
    private var mEndPoint: android.hardware.usb.UsbEndpoint? = null
    private var mUsbInterface: android.hardware.usb.UsbInterface? = null
    private var mUsbDeviceConnection: android.hardware.usb.UsbDeviceConnection? = null
    private var templates = UsbTemplates(context)
    private var isConnected = false
    private val printerDPI = 199
    private val printerWidthMM = 72f
    private val charsPerLine = 48
    private var connectionKey = ""
    private var targetProductId: String? = null

    private lateinit var pendingIntent: PendingIntent

    override fun initialize() {
        Log.d(TAG, "Initializing $printerName")
        pendingIntent = PendingIntent.getBroadcast(
            context, 0, Intent(ACTION_USB_PERMISSION),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val filter = IntentFilter(ACTION_USB_PERMISSION).apply {
            addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED)
            addAction(UsbManager.ACTION_USB_DEVICE_DETACHED)
        }
        ContextCompat.registerReceiver(context, object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                when (intent.action) {
                    ACTION_USB_PERMISSION -> {
                        val device: UsbDevice? = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)
                        if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                            device?.let {
                                // Only accept permission for our target device
                                if (targetProductId == null || it.productId.toString() == targetProductId) {
                                    usbDevice = it
                                    val printerNum = getPrinterNumber(printerId)
                                    connectionKey = "usb:P${printerNum}:${it.deviceId}:${it.productId}"
                                    isConnected = true
                                    Log.d("USB_DEBUG", "✅ USB permission granted for Printer#$printerNum device: ${it.deviceName}")
                                } else {
                                    Log.d(TAG, "USB permission granted for device ${it.deviceName}, but not our target device (productId: ${it.productId} vs target: $targetProductId)")
                                }
                            }
                        } else {
                            Log.w(TAG, "USB permission denied for device")
                        }
                    }

                    UsbManager.ACTION_USB_DEVICE_ATTACHED -> {
                        Log.d(TAG, "USB device attached")
                        requestUsbPermission()
                    }

                    UsbManager.ACTION_USB_DEVICE_DETACHED -> {
                        Log.d(TAG, "USB device detached")
                        // Clear the cached connection for the detached device
                        if (usbDevice != null) {
                            val printerNum = getPrinterNumber(printerId)
                            val key = "usb:P${printerNum}:${usbDevice?.deviceId}:${usbDevice?.productId}"
                            clearCachedConnection(key)
                        }
                        disconnect()
                    }
                }
            }
        }, filter, ContextCompat.RECEIVER_NOT_EXPORTED)

        requestUsbPermission()
    }

    private fun requestUsbPermission() {
        val deviceList = usbManager.deviceList

        // If we have a target product ID, only look for that specific device
        if (targetProductId != null) {
            val targetDevice = deviceList.values.find { it.productId.toString() == targetProductId }
            if (targetDevice != null) {
                Log.d(TAG, "Found target USB device: ${targetDevice.deviceName} with productId: $targetProductId")
                if (!usbManager.hasPermission(targetDevice)) {
                    usbManager.requestPermission(targetDevice, pendingIntent)
                } else {
                    usbDevice = targetDevice
                    val printerNum = getPrinterNumber(printerId)
                    connectionKey = "usb:P${printerNum}:${targetDevice.deviceId}:${targetDevice.productId}"
                    isConnected = true
                    Log.d("USB_DEBUG", "✅ Permission already granted for Printer#$printerNum target device: ${targetDevice.deviceName}")
                }
                return
            } else {
                Log.w(TAG, "Target USB device with productId $targetProductId not found")
                return
            }
        }

        // Fallback: if no target product ID, use the old behavior (only during initialization)
        if (targetProductId == null) {
            for (device in deviceList.values) {
                Log.d(TAG, "Found USB device: ${device.deviceName}")
                if (!usbManager.hasPermission(device)) {
                    usbManager.requestPermission(device, pendingIntent)
                } else {
                    // Only set this device if we don't already have a specific device set
                    if (usbDevice == null) {
                        usbDevice = device
                        val printerNum = getPrinterNumber(printerId)
                        connectionKey = "usb:P${printerNum}:${device.deviceId}:${device.productId}"
                        isConnected = true
                        Log.d("USB_DEBUG", "✅ Permission already granted for Printer#$printerNum device: ${device.deviceName}")
                    }
                }
            }
        } else {
            // If we have a target product ID but didn't find the device, don't fall back to other devices
            Log.w("USB_DEBUG", "❌ Target device with productId $targetProductId not found - printer will remain offline")
        }

        if (deviceList.isEmpty()) {
            Log.w(TAG, "No USB devices found")
        }
    }

    fun openConnection(): Boolean {
        val usbInterface = usbDevice?.getInterface(0)
        if (usbInterface != null) {
            for (i in 0 until usbInterface.endpointCount) {
                val ep = usbInterface.getEndpoint(i)
                if (ep.type == UsbConstants.USB_ENDPOINT_XFER_BULK) {
                    if (ep.direction == UsbConstants.USB_DIR_OUT) {
                        val usbDeviceConnection = usbManager?.openDevice(usbDevice)
                        if (usbDeviceConnection == null) {
                            Log.e(TAG, "Failed to open USB Connection")
                            return false
                        }

                        val claimed = usbDeviceConnection.claimInterface(usbInterface, true)
                        Log.d(TAG, "Interface claimed: $claimed")
                        if (claimed) {
                            mEndPoint = ep
                            mUsbInterface = usbInterface
                            mUsbDeviceConnection = usbDeviceConnection
                            return true
                        } else {
                            usbDeviceConnection.close()
                            return false
                        }
                    }
                }
            }
        }
        return false
    }

    override fun connect(params: PrinterConnectionParams) {
        Log.d(TAG, "Connecting to printer with productId: ${params.productId}")
        targetProductId = params.productId
        val devices = usbManager?.deviceList?.values
        val device = devices?.find { it.productId.toString() == params.productId.toString() }

        if (device != null) {
            Log.d("USB_DEBUG", "🔍 Printer found: ${device.deviceName}")
            usbDevice = device
            val printerNum = getPrinterNumber(printerId)
            connectionKey = "usb:P${printerNum}:${device.deviceId}:${device.productId}"
            Log.d("USB_DEBUG", "🔑 Created connection key: $connectionKey for Printer#$printerNum")

            // Check if we already have permission
            if (usbManager.hasPermission(device)) {
                isConnected = true
                val opened = openConnection()
                Log.d(TAG, "Connection opened: $opened")
            } else {
                // Request permission
                usbManager?.requestPermission(device, pendingIntent)
            }
        } else {
            Log.d(TAG, "No printer found with productId: ${params.productId}")
        }
    }

    override fun getDeviceList(): List<Printer> {
        val printerList = mutableListOf<Printer>()

        val deviceList = usbManager.deviceList
        Log.d(TAG, "Found ${deviceList.size} USB devices")

        for ((_, device) in deviceList) {
            try {
                val deviceName = device.deviceName ?: "Unknown USB Device"
                val displayName = "USB Printer (${device.productId})"

                val printer = Printer(
                    name = displayName,
                    deviceName = deviceName,
                    deviceId = device.deviceId.toString(),
                    vendorId = device.vendorId.toString(),
                    productId = device.productId.toString()
                )
                printerList.add(printer)

                Log.d(TAG, "Added USB device: $displayName, ID: ${device.deviceId}, Product ID: ${device.productId}")
            } catch (e: Exception) {
                Log.e(TAG, "Error adding USB device: ${e.message}")
            }
        }

        return printerList
    }

    override fun printReceipt(order: Order) {
        Log.d(TAG, "Printing receipt for order ${order._id} on $printerName")
        try {
            checkConnection()
            val printer = createPrinter()
            val printData = templates.getReceipt(printer, order)
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed receipt for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing receipt: ${e.message}", e)
            clearCachedConnection(connectionKey)
            throw e
        }
    }

    override fun printTransactionReceipt(transactionData: Map<String, Any>) {
        try {
            checkConnection()
            val printer = createPrinter()
            val printData = templates.getTransactionReceipt(printer, transactionData)
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed transaction receipt")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing transaction receipt: ${e.message}", e)
            clearCachedConnection(connectionKey)
            throw e
        }
    }

    override fun printRefundReceipt(order: Order) {
        Log.d(TAG, "Printing refund receipt for order ${order._id} on $printerName")
        try {
            checkConnection()
            val printer = createPrinter()
            val printData = templates.getRefundReceipt(printer, order)
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed refund receipt for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing refund receipt: ${e.message}", e)
            clearCachedConnection(connectionKey)
            throw e
        }
    }

    override fun printKot(order: Order, kitchenName: String?) {
        Log.d(TAG, "Printing KOT for order ${order._id} on $printerName, kitchen: $kitchenName")
        try {
            checkConnection()
            val printer = createPrinter()
            val printData = templates.getKot(printer, order, kitchenName)
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed KOT for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing KOT: ${e.message}", e)
            clearCachedConnection(connectionKey)
            throw e
        }
    }

    override fun printProforma(order: Order) {
        Log.d(TAG, "Printing proforma for order ${order._id} on $printerName")
        try {
            checkConnection()
            val printer = createPrinter()
            val printData = templates.getProforma(printer, order)
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed proforma for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing proforma: ${e.message}", e)
            clearCachedConnection(connectionKey)
            throw e
        }
    }

    override fun getPrinterStatus(): String {
        return if (isConnected) "Connected to USB device: ${usbDevice?.deviceName ?: "Unknown"}" else "Disconnected"
    }

    override fun disconnect() {
        if (isConnected) {
            Log.d(TAG, "Disconnecting from $printerName")
            // We don't actually disconnect the USB connection to avoid reconnection overhead
            // Just mark as disconnected in our state
            isConnected = false
        }
    }

    private fun checkConnection() {
        if (!isConnected || usbDevice == null) {
            Log.e(TAG, "Cannot print: Printer not connected")
            throw IllegalStateException("Printer must be connected before printing")
        }
    }

    private fun clearCachedConnection(key: String) {
        Log.d(TAG, "Clearing cached connection for $key due to error")
        cachedConnections.remove(key)
        cachedPrinters.remove(key)
    }

    private fun createPrinter(): EscPosPrinter {
        val printerNum = getPrinterNumber(printerId)
        Log.d("USB_DEBUG", "⚙️ createPrinter() called with connectionKey: $connectionKey, Printer#$printerNum, targetProductId: $targetProductId")

        // First, validate that our target device is actually available
        if (targetProductId != null) {
            val targetDevice = usbManager.deviceList.values.find { it.productId.toString() == targetProductId }
            if (targetDevice == null) {
                Log.w("USB_DEBUG", "❌ Target device with productId $targetProductId not found - cannot create printer for Printer#$printerNum")
                throw IllegalStateException("Target USB device with productId $targetProductId not found")
            }
            // Update our device reference if it changed
            if (usbDevice?.deviceId != targetDevice.deviceId) {
                Log.d("USB_DEBUG", "🔄 Target device changed, updating device reference for Printer#$printerNum")
                usbDevice = targetDevice
                connectionKey = "usb:P${printerNum}:${targetDevice.deviceId}:${targetDevice.productId}"
            }
        } else {
            Log.w("USB_DEBUG", "⚠️ No targetProductId set for Printer#$printerNum - this might cause issues")
        }

        if (!cachedPrinters.containsKey(connectionKey) || !isConnectionValid()) {
            Log.d("USB_DEBUG", "🆕 Creating new EscPosPrinter for Printer#$printerNum")

            if (!cachedConnections.containsKey(connectionKey) || !isConnectionValid()) {
                Log.d("USB_DEBUG", "🔗 Creating new USB connection for Printer#$printerNum")

                // Ensure we have a valid USB device
                if (usbDevice == null || !usbManager.hasPermission(usbDevice)) {
                    Log.d("USB_DEBUG", "🔐 USB device is null or no permission, requesting permission for Printer#$printerNum")
                    requestUsbPermission()

                    // If we still don't have a valid device, throw an exception
                    if (usbDevice == null) {
                        throw IllegalStateException("No USB device available for Printer#$printerNum")
                    }

                    if (!usbManager.hasPermission(usbDevice)) {
                        throw IllegalStateException("No permission for USB device for Printer#$printerNum")
                    }
                }

                try {
                    val connection = UsbConnection(usbManager, usbDevice)
                    cachedConnections[connectionKey] = connection
                    Log.d(TAG, "Successfully created new USB connection")
                } catch (e: Exception) {
                    Log.e(TAG, "Error creating USB connection: ${e.message}", e)
                    throw e
                }
            }

            try {
                val connection = cachedConnections[connectionKey]!!
                val printer = EscPosPrinter(
                    connection,
                    printerDPI,
                    printerWidthMM,
                    charsPerLine
                )
                cachedPrinters[connectionKey] = printer
                return printer
            } catch (e: Exception) {
                Log.e(TAG, "Error creating EscPosPrinter: ${e.message}", e)
                // Connection might be stale, try to reconnect
                clearCachedConnection(connectionKey)

                // Try one more time with a fresh connection
                try {
                    // Ensure USB device is still valid
                    if (usbDevice == null || !usbManager.hasPermission(usbDevice)) {
                        requestUsbPermission()
                        if (usbDevice == null) {
                            throw IllegalStateException("No USB device available after retry")
                        }
                    }

                    val connection = UsbConnection(usbManager, usbDevice)
                    cachedConnections[connectionKey] = connection

                    val printer = EscPosPrinter(
                        connection,
                        printerDPI,
                        printerWidthMM,
                        charsPerLine
                    )
                    cachedPrinters[connectionKey] = printer
                    return printer
                } catch (e2: Exception) {
                    Log.e(TAG, "Failed to reconnect USB printer: ${e2.message}", e2)
                    throw e2
                }
            }
        } else {
            Log.d("USB_DEBUG", "♻️ Using cached EscPosPrinter for $connectionKey")
            return cachedPrinters[connectionKey]!!
        }
    }

    // Check if the USB connection is still valid
    private fun isConnectionValid(): Boolean {
        if (usbDevice == null) return false

        try {
            // Check if we still have permission for the device
            val hasPermission = usbManager.hasPermission(usbDevice)

            // Check if the device is still in the device list
            val deviceStillExists = usbManager.deviceList.values.any { it.deviceId == usbDevice?.deviceId }

            val isValid = hasPermission && deviceStillExists
            Log.d(TAG, "USB connection valid: $isValid (hasPermission=$hasPermission, deviceExists=$deviceStillExists)")
            return isValid
        } catch (e: Exception) {
            Log.e(TAG, "Error checking USB connection: ${e.message}", e)
            return false
        }
    }

    override fun openCashDrawer() {
        try {
            checkConnection()
            val printer = createPrinter()
            printer.openCashBox()
            Log.d(TAG, "Cash drawer opened successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error opening cash drawer: ${e.message}", e)
            clearCachedConnection(connectionKey)
            throw e
        }
    }
}
