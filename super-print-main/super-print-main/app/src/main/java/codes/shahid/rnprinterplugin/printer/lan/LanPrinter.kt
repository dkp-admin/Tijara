package codes.shahid.rnprinterplugin.printer.lan

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.dantsu.escposprinter.EscPosPrinter
import com.dantsu.escposprinter.connection.tcp.TcpConnection
import codes.shahid.rnprinterplugin.printer.BasePrinter
import codes.shahid.rnprinterplugin.printer.PrinterManager
import codes.shahid.rnprinterplugin.printer.lan.templates.LanTemplates
import codes.shahid.rnprinterplugin.types.Order
import codes.shahid.rnprinterplugin.types.Printer
import codes.shahid.rnprinterplugin.types.PrinterConnectionParams
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch


class LanPrinter(
    private val context: Context,
) : BasePrinter {

    companion object {
        private const val TAG = "LanPrinter"
        private const val WIFI_DEBUG_TAG = "WIFI_LAN_DEBUG"
        private const val CONNECTION_TIMEOUT = 5000 // 5 seconds timeout

        // Static cache for TCP connections to avoid creating new connections for each print job
        private val cachedConnections = HashMap<String, TcpConnection>()
        private val cachedPrinters = HashMap<String, EscPosPrinter>()

        // Network state monitoring
        private var networkReceiver: BroadcastReceiver? = null
        private var isNetworkReceiverRegistered = false

        /**
         * Clear all cached connections (called when network state changes)
         */
        fun clearAllCachedConnections() {
            Log.d(WIFI_DEBUG_TAG, "🧹 Clearing all cached LAN printer connections due to network change")

            // Properly disconnect all EscPosPrinter instances first
            try {
                cachedPrinters.values.forEach { printer ->
                    try {
                        Log.d(WIFI_DEBUG_TAG, "🔌 Disconnecting cached EscPosPrinter")
                        printer.disconnectPrinter()
                    } catch (e: Exception) {
                        Log.w(WIFI_DEBUG_TAG, "⚠️ Error disconnecting EscPosPrinter: ${e.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e(WIFI_DEBUG_TAG, "❌ Error clearing cached printers: ${e.message}")
            }

            // Clear all caches
            cachedConnections.clear()
            cachedPrinters.clear()
            Log.d(WIFI_DEBUG_TAG, "✅ All LAN printer caches cleared")
        }

        /**
         * Clear cache for a specific printer (useful when a specific printer reconnects)
         */
        fun clearPrinterCache(printerIp: String, printerPort: Int) {
            val connectionKey = "$printerIp:$printerPort"
            Log.d(WIFI_DEBUG_TAG, "🧹 Clearing cache for specific printer: $connectionKey")

            // Disconnect the specific printer if cached
            try {
                val cachedPrinter = cachedPrinters[connectionKey]
                if (cachedPrinter != null) {
                    Log.d(WIFI_DEBUG_TAG, "🔌 Disconnecting cached EscPosPrinter for $connectionKey")
                    cachedPrinter.disconnectPrinter()
                }
            } catch (e: Exception) {
                Log.w(WIFI_DEBUG_TAG, "⚠️ Error disconnecting specific printer: ${e.message}")
            }

            // Clear caches for this specific printer
            cachedConnections.remove(connectionKey)
            cachedPrinters.remove(connectionKey)
            Log.d(WIFI_DEBUG_TAG, "✅ Cache cleared for printer: $connectionKey")
        }

        /**
         * Force validation of all cached connections and clear invalid ones
         */
        fun validateAndClearInvalidConnections(context: Context) {
            Log.d(TAG, "Validating all cached LAN printer connections")
            val invalidKeys = mutableListOf<String>()

            cachedConnections.forEach { (key, connection) ->
                try {
                    if (!connection.isConnected()) {
                        Log.d(TAG, "Connection $key is invalid, marking for removal")
                        invalidKeys.add(key)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error validating connection $key: ${e.message}")
                    invalidKeys.add(key)
                }
            }

            // Remove invalid connections
            invalidKeys.forEach { key ->
                try {
                    cachedConnections[key]?.disconnect()
                } catch (e: Exception) {
                    Log.e(TAG, "Error disconnecting invalid connection $key: ${e.message}")
                }
                cachedConnections.remove(key)
                cachedPrinters.remove(key)
                Log.d(TAG, "Removed invalid connection: $key")
            }

            if (invalidKeys.isNotEmpty()) {
                Log.d(TAG, "Cleared ${invalidKeys.size} invalid LAN printer connections")
            }
        }
    }

    private var isInitialized = false
    private var isConnected = false
    private val printerName = "LAN Printer"
    private var printerIp: String = ""
    private var printerPort: Int = 0
    private var connectionKey: String = ""

    private val templates = LanTemplates(context)

    private val printerWidthMM = 72f
    private val printerDPI = 203
    private val charsPerLine = 42

    override fun initialize() {
        Log.d(TAG, "Initializing $printerName")
        isInitialized = true

        // Register network state receiver if not already registered
        CoroutineScope(Dispatchers.IO).launch {
            registerNetworkStateReceiver()
        }
    }

    private fun registerNetworkStateReceiver() {
        if (!isNetworkReceiverRegistered) {
            try {
                networkReceiver = object : BroadcastReceiver() {
                    override fun onReceive(context: Context?, intent: Intent?) {
                        when (intent?.action) {
                            WifiManager.NETWORK_STATE_CHANGED_ACTION,
                            ConnectivityManager.CONNECTIVITY_ACTION -> {
                                Log.d(WIFI_DEBUG_TAG, "🌐 Network state changed, checking connectivity - Action: ${intent?.action}")
                                handleNetworkStateChange()
                            }
                        }
                    }
                }

                val filter = IntentFilter().apply {
                    addAction(WifiManager.NETWORK_STATE_CHANGED_ACTION)
                    addAction(ConnectivityManager.CONNECTIVITY_ACTION)
                }

                ContextCompat.registerReceiver(
                    context,
                    networkReceiver!!,
                    filter,
                    ContextCompat.RECEIVER_NOT_EXPORTED
                )
                isNetworkReceiverRegistered = true
                Log.d(TAG, "Network state receiver registered")
            } catch (e: Exception) {
                Log.e(TAG, "Error registering network state receiver: ${e.message}")
            }
        }
    }

    private fun handleNetworkStateChange() {
        try {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val network = connectivityManager.activeNetwork
            val networkCapabilities = connectivityManager.getNetworkCapabilities(network)

            val isWifiConnected = networkCapabilities?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true
            val cachedPrinterCount = cachedPrinters.size

            Log.d(WIFI_DEBUG_TAG, "📡 Network state check - WiFi Connected: $isWifiConnected, Cached printers: $cachedPrinterCount")

            if (!isWifiConnected) {
                Log.w(WIFI_DEBUG_TAG, "📵 WiFi disconnected, clearing $cachedPrinterCount cached printers")
                clearAllCachedConnections()
                Log.d(WIFI_DEBUG_TAG, "🧹 All cached printers cleared due to WiFi disconnection")
            } else {
                Log.i(WIFI_DEBUG_TAG, "📶 WiFi reconnected, clearing $cachedPrinterCount stale printers to force fresh connections")
                // Clear all cached printers when WiFi reconnects to ensure fresh connections
                clearAllCachedConnections()

                // Also notify PrinterManager to clear LAN printer caches
                // This ensures that the PrinterManager doesn't reuse stale LanPrinter instances
                try {
                    val printerManager = PrinterManager(context)
                    printerManager.clearAllLanPrinterCaches()
                    Log.d(WIFI_DEBUG_TAG, "🧹 PrinterManager LAN caches cleared due to WiFi reconnection")
                } catch (e: Exception) {
                    Log.w(WIFI_DEBUG_TAG, "⚠️ Error clearing PrinterManager LAN caches: ${e.message}")
                }

                Log.i(WIFI_DEBUG_TAG, "✅ All cached printers cleared due to WiFi reconnection - Fresh connections will be created")
            }
        } catch (e: Exception) {
            Log.e(WIFI_DEBUG_TAG, "❌ Error handling network state change: ${e.message}", e)
        }
    }

    override fun connect(params: PrinterConnectionParams) {
        Log.d(TAG, "Connecting to LAN printer...")
        if (!isInitialized) {
            Log.e(TAG, "Cannot connect: Printer not initialized")
            throw IllegalStateException("Printer must be initialized before connecting")
        }

        if (params.ip.isNullOrBlank() || params.port == null) {
            Log.e(TAG, "IP address or port is missing")
            throw IllegalArgumentException("IP address and port are required for LAN printer")
        }

        printerIp = params.ip
        printerPort = params.port
        connectionKey = "$printerIp:$printerPort"

        // For LAN printers, we don't pre-create connections since EscPosPrinter handles its own connection
        // We just mark as connected if we have valid IP/port
        if (printerIp.isNotBlank() && printerPort > 0) {
            Log.d(WIFI_DEBUG_TAG, "🔌 LAN printer connection parameters validated for $connectionKey")
            isConnected = true
        } else {
            Log.e(WIFI_DEBUG_TAG, "❌ Invalid LAN printer parameters: IP=$printerIp, Port=$printerPort")
            isConnected = false
            throw IllegalArgumentException("Invalid IP or port for LAN printer")
        }
    }

    override fun printReceipt(order: Order) {
        Log.d(TAG, "Printing receipt for order ${order._id} on $printerName at $connectionKey")
        Log.d(WIFI_DEBUG_TAG, "🖨️ Starting receipt print for $connectionKey")
        try {
            val printer = createPrinter()
            val printData = templates.getReceipt(printer, order)
            Log.d(WIFI_DEBUG_TAG, "📄 Print data prepared, sending to printer at $connectionKey")
            printer.printFormattedTextAndCut(printData)
            Log.i(WIFI_DEBUG_TAG, "✅ Successfully printed receipt for order ${order._id} on $connectionKey")
        } catch (e: Exception) {
            Log.e(WIFI_DEBUG_TAG, "❌ Error printing receipt on $connectionKey: ${e.message}", e)
            clearCachedConnection()
            throw e
        }
    }

    override fun printRefundReceipt(order: Order) {
        Log.d(TAG, "Printing refund receipt for order ${order._id} on $printerName at $connectionKey")
        try {
            val printer = createPrinter()
            val printData = templates.getRefundReceipt(printer, order)
            Log.d(TAG, "Sending refund receipt data to printer at $connectionKey")
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed refund receipt for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing refund receipt: ${e.message}", e)
            clearCachedConnection()
            throw e
        }
    }

    override fun printKot(order: Order, kitchenName: String?) {
        Log.d(TAG, "Printing KOT for order ${order._id} on $printerName at $connectionKey, kitchen: $kitchenName")
        try {
            val printer = createPrinter()
            val printData = templates.getKot(printer, order, kitchenName)
            Log.d(TAG, "Sending KOT data to printer at $connectionKey")
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed KOT for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing KOT: ${e.message}", e)
            clearCachedConnection()
            throw e
        }
    }

    override fun printProforma(order: Order) {
        Log.d(TAG, "Printing proforma for order ${order._id} on $printerName at $connectionKey")
        try {
            val printer = createPrinter()
            val printData = templates.getProforma(printer, order)
            Log.d(TAG, "Sending proforma data to printer at $connectionKey")
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed proforma for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing proforma: ${e.message}", e)
            clearCachedConnection()
            throw e
        }
    }

    override fun openCashDrawer() {
        Log.d(TAG, "Opening cash drawer on $printerName at $connectionKey")
        try {
            val printer = createPrinter()
            Log.d(TAG, "Sending cash drawer open command to printer")
            printer.openCashBox()
            Log.d(TAG, "Cash drawer opened successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error opening cash drawer: ${e.message}", e)
            clearCachedConnection()
            throw e
        }
    }

    override fun getPrinterStatus(): String {
        return if (isConnected && cachedConnections.containsKey(connectionKey)) {
            "Connected to LAN printer at $connectionKey"
        } else {
            "Disconnected from LAN printer"
        }
    }

    override fun disconnect() {
        if (isConnected) {
            Log.d(WIFI_DEBUG_TAG, "🔌 Disconnecting from $printerName at $connectionKey")

            // Properly disconnect the EscPosPrinter if we have one cached
            try {
                val cachedPrinter = cachedPrinters[connectionKey]
                if (cachedPrinter != null) {
                    Log.d(WIFI_DEBUG_TAG, "🔌 Disconnecting cached EscPosPrinter")
                    cachedPrinter.disconnectPrinter()
                    Log.d(WIFI_DEBUG_TAG, "✅ EscPosPrinter disconnected successfully")
                }
            } catch (e: Exception) {
                Log.w(WIFI_DEBUG_TAG, "⚠️ Error disconnecting EscPosPrinter: ${e.message}")
            }

            // Clear the cached printer
            cachedPrinters.remove(connectionKey)

            // Mark as disconnected
            isConnected = false
            Log.d(WIFI_DEBUG_TAG, "✅ LAN printer disconnected and cache cleared")
        }
    }

    private fun clearCachedConnection() {
        Log.d(WIFI_DEBUG_TAG, "🧹 Clearing cached connection for $connectionKey due to error")

        // Properly disconnect the EscPosPrinter if we have one cached
        try {
            val cachedPrinter = cachedPrinters[connectionKey]
            if (cachedPrinter != null) {
                Log.d(WIFI_DEBUG_TAG, "🔌 Disconnecting cached EscPosPrinter due to error")
                cachedPrinter.disconnectPrinter()
                Log.d(WIFI_DEBUG_TAG, "✅ EscPosPrinter disconnected successfully")
            }
        } catch (e: Exception) {
            Log.w(WIFI_DEBUG_TAG, "⚠️ Error disconnecting EscPosPrinter: ${e.message}")
        }

        // Clear the cached printer
        cachedPrinters.remove(connectionKey)
        Log.d(WIFI_DEBUG_TAG, "🧹 Cached printer cleared for $connectionKey")
    }

    private fun createPrinter(): EscPosPrinter {
        Log.d(WIFI_DEBUG_TAG, "🏭 createPrinter() called for $connectionKey")

        // Check if we have a cached printer that's still valid
        val hasCachedPrinter = cachedPrinters.containsKey(connectionKey)

        Log.d(WIFI_DEBUG_TAG, "🔍 Printer cache check - Has cached printer: $hasCachedPrinter")

        if (!hasCachedPrinter) {
            Log.d(WIFI_DEBUG_TAG, "🏗️ Creating new EscPosPrinter for LAN printer at $connectionKey")

            // Check network connectivity before attempting connection
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val network = connectivityManager.activeNetwork
            val networkCapabilities = connectivityManager.getNetworkCapabilities(network)
            val hasWifi = networkCapabilities?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true

            if (!hasWifi) {
                Log.e(WIFI_DEBUG_TAG, "📵 No WiFi connection available, cannot create printer")
                throw IllegalStateException("No WiFi connection available")
            }

            // Log network information for debugging
            logNetworkInfo(connectivityManager)

            Log.d(WIFI_DEBUG_TAG, "📶 WiFi is available, creating EscPosPrinter with fresh TCP connection")

            // First, let's test network connectivity to the printer
            var isReachable = testPrinterReachability(printerIp, printerPort)
            Log.d(WIFI_DEBUG_TAG, "🔍 Printer reachability test: $isReachable for $printerIp:$printerPort")

            // If not reachable, wait a bit and try again (network might still be establishing routes)
            if (!isReachable) {
                Log.w(WIFI_DEBUG_TAG, "⏳ Printer not reachable, waiting 2 seconds and retrying...")
                Thread.sleep(2000)
                isReachable = testPrinterReachability(printerIp, printerPort)
                Log.d(WIFI_DEBUG_TAG, "🔍 Retry reachability test: $isReachable for $printerIp:$printerPort")
            }

            try {
                // Let EscPosPrinter handle its own connection - don't pre-create TcpConnection
                Log.d(WIFI_DEBUG_TAG, "🔌 Creating fresh TCP connection for EscPosPrinter to $printerIp:$printerPort")
                val connection = TcpConnection(printerIp, printerPort, CONNECTION_TIMEOUT)

                Log.d(WIFI_DEBUG_TAG, "🖨️ Creating EscPosPrinter instance")
                val printer = EscPosPrinter(
                    connection,
                    printerDPI,
                    printerWidthMM,
                    charsPerLine
                )

                // Cache the printer for reuse
                cachedPrinters[connectionKey] = printer
                Log.i(WIFI_DEBUG_TAG, "✅ Successfully created and cached EscPosPrinter for $connectionKey")
                return printer

            } catch (e: Exception) {
                Log.e(WIFI_DEBUG_TAG, "❌ Error creating EscPosPrinter: ${e.message}", e)

                // Clear any cached printer on error
                cachedPrinters.remove(connectionKey)

                // Re-throw the exception to be handled by the calling code
                throw e
            }
        } else {
            Log.d(WIFI_DEBUG_TAG, "♻️ Using cached EscPosPrinter for $connectionKey")
            return cachedPrinters[connectionKey]!!
        }
    }

    override fun printTransactionReceipt(transactionData: Map<String, Any>) {
        Log.d(TAG, "Printing transaction receipt on $printerName")
        try {
            val printer = createPrinter()
            val printData = templates.getTransactionReceipt(printer, transactionData)
            Log.d(TAG, "Sending transaction receipt to printer at $connectionKey")
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed transaction receipt")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing transaction receipt: ${e.message}", e)
            clearCachedConnection()
            throw e
        }
    }





    private fun logNetworkInfo(connectivityManager: ConnectivityManager) {
        try {
            val network = connectivityManager.activeNetwork
            val networkCapabilities = connectivityManager.getNetworkCapabilities(network)
            val linkProperties = connectivityManager.getLinkProperties(network)

            Log.d(WIFI_DEBUG_TAG, "🌐 Network Info:")
            Log.d(WIFI_DEBUG_TAG, "   📡 Network: $network")
            Log.d(WIFI_DEBUG_TAG, "   🔗 Capabilities: $networkCapabilities")
            Log.d(WIFI_DEBUG_TAG, "   🏠 Interface: ${linkProperties?.interfaceName}")
            Log.d(WIFI_DEBUG_TAG, "   🌍 DNS Servers: ${linkProperties?.dnsServers}")
            Log.d(WIFI_DEBUG_TAG, "   🚪 Routes: ${linkProperties?.routes?.take(3)}")

            // Try to get local IP address
            try {
                val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as android.net.wifi.WifiManager
                val wifiInfo = wifiManager.connectionInfo
                val ipAddress = wifiInfo.ipAddress
                val localIp = String.format("%d.%d.%d.%d",
                    ipAddress and 0xff,
                    ipAddress shr 8 and 0xff,
                    ipAddress shr 16 and 0xff,
                    ipAddress shr 24 and 0xff)
                Log.d(WIFI_DEBUG_TAG, "   📱 Local IP: $localIp")
                Log.d(WIFI_DEBUG_TAG, "   📶 SSID: ${wifiInfo.ssid}")
            } catch (e: Exception) {
                Log.w(WIFI_DEBUG_TAG, "   ⚠️ Could not get WiFi info: ${e.message}")
            }
        } catch (e: Exception) {
            Log.e(WIFI_DEBUG_TAG, "❌ Error logging network info: ${e.message}")
        }
    }

    private fun testPrinterReachability(ip: String, port: Int): Boolean {
        return try {
            Log.d(WIFI_DEBUG_TAG, "🔍 Testing reachability to $ip:$port")

            // Test basic IP reachability first
            val address = java.net.InetAddress.getByName(ip)
            val isReachable = address.isReachable(3000) // 3 second timeout
            Log.d(WIFI_DEBUG_TAG, "📡 IP reachability test for $ip: $isReachable")

            if (!isReachable) {
                Log.w(WIFI_DEBUG_TAG, "⚠️ IP $ip is not reachable via ping")
                return false
            }

            // Test TCP port connectivity
            val socket = java.net.Socket()
            socket.use {
                val socketAddress = java.net.InetSocketAddress(ip, port)
                socket.connect(socketAddress, 3000) // 3 second timeout
                val isConnected = socket.isConnected
                Log.d(WIFI_DEBUG_TAG, "🔌 TCP port test for $ip:$port: $isConnected")
                isConnected
            }
        } catch (e: Exception) {
            Log.w(WIFI_DEBUG_TAG, "❌ Reachability test failed for $ip:$port: ${e.message}")
            false
        }
    }

    override fun getDeviceList(): List<Printer> {
        TODO("Not yet implemented")
    }
}
