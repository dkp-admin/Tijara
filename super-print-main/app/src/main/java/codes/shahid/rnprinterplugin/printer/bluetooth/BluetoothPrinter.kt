package codes.shahid.rnprinterplugin.printer.bluetooth

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log
import android.widget.Toast
import androidx.core.content.ContextCompat
import com.dantsu.escposprinter.EscPosPrinter
import com.dantsu.escposprinter.connection.bluetooth.BluetoothConnection
import com.dantsu.escposprinter.connection.bluetooth.BluetoothPrintersConnections
import codes.shahid.rnprinterplugin.printer.BasePrinter
import codes.shahid.rnprinterplugin.printer.bluetooth.templates.BluetoothTemplates
import codes.shahid.rnprinterplugin.types.Order
import codes.shahid.rnprinterplugin.types.Printer
import codes.shahid.rnprinterplugin.types.PrinterConnectionParams
import codes.shahid.rnprinterplugin.types.TransactionData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class BluetoothPrinter(
    private val context: Context
) : BasePrinter {

    companion object {
        private const val TAG = "BluetoothPrinter"
        // Static cache for Bluetooth connections to avoid creating new connections for each print job
        private var cachedBluetoothDevice: BluetoothConnection? = null
        private var cachedPrinter: EscPosPrinter? = null
    }

    private var isInitialized = false
    private var isConnected = false
    private var mBluetoothAdapter: BluetoothAdapter? = null
    private var mBluetoothManager : BluetoothManager? = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val printerName ="Bluetooth Printer"
    private val templates = BluetoothTemplates(context)
    private val printerWidthMM = 70f
    private val printerDPI = 199
    private val charsPerLine = 43

    override fun initialize() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Register a receiver to detect when Bluetooth is disconnected
                val filter = IntentFilter(BluetoothDevice.ACTION_ACL_DISCONNECTED)
                ContextCompat.registerReceiver(context, object : BroadcastReceiver() {
                    override fun onReceive(context: Context?, intent: Intent?) {
                        val action = intent?.action
                        if (action == BluetoothDevice.ACTION_ACL_DISCONNECTED) {
                            Log.d(TAG, "Bluetooth device disconnected, clearing cached connection")
                            cachedBluetoothDevice = null
                            cachedPrinter = null
                            isConnected = false
                        }
                    }
                }, filter, ContextCompat.RECEIVER_NOT_EXPORTED)

                mBluetoothAdapter = mBluetoothManager!!.adapter
                isInitialized = true
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Initialized BT Printer", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Failed to initialize Bluetooth", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    override fun connect(params: PrinterConnectionParams) {
        Log.d(TAG, "Connecting to Bluetooth printer")

        // Only establish a new connection if we don't have a cached one
        if (cachedBluetoothDevice == null) {
            Log.d(TAG, "No cached Bluetooth connection, creating a new one")
            cachedBluetoothDevice = BluetoothPrintersConnections.selectFirstPaired()

            if (cachedBluetoothDevice != null) {
                Log.d(TAG, "Successfully created Bluetooth connection")
                isConnected = true
            } else {
                Log.e(TAG, "Failed to create Bluetooth connection")
                throw IllegalStateException("Could not connect to any paired Bluetooth printer")
            }
        } else {
            Log.d(TAG, "Using cached Bluetooth connection")
            isConnected = true
        }
    }

    override fun printReceipt(order: Order) {
        Log.d(TAG, "Printing receipt for order ${order._id} on $printerName")
        try {
            val printer = createPrinter()
            val printData = templates.getReceipt(printer, order)
            Log.d(TAG, "Sending print data to Bluetooth printer")
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed receipt for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing receipt: ${e.message}", e)
            // If there's an error, clear the cached connection so we'll try to reconnect next time
            cachedBluetoothDevice = null
            cachedPrinter = null
            throw e
        }
    }

    override fun printRefundReceipt(order: Order) {
        Log.d(TAG, "Printing refund receipt for order ${order._id} on $printerName")
        try {
            val printer = createPrinter()
            val printData = templates.getRefundReceipt(printer, order)
            Log.d(TAG, "Sending refund receipt data to Bluetooth printer")
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed refund receipt for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing refund receipt: ${e.message}", e)
            cachedBluetoothDevice = null
            cachedPrinter = null
            throw e
        }
    }

    override fun printKot(order: Order, kitchenName: String?) {
        Log.d(TAG, "Printing KOT for order ${order._id} on $printerName, kitchen: $kitchenName")
        try {
            val printer = createPrinter()
            val printData = templates.getKot(printer, order, kitchenName)
            Log.d(TAG, "Sending KOT data to Bluetooth printer")
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed KOT for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing KOT: ${e.message}", e)
            cachedBluetoothDevice = null
            cachedPrinter = null
            throw e
        }
    }

    override fun printProforma(order: Order) {
        try {
            val printer = createPrinter()
            val printData = templates.getProforma(printer, order)
            Log.d(TAG, "Sending proforma data to Bluetooth printer")
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed proforma for order ${order._id}")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing proforma: ${e.message}", e)
            cachedBluetoothDevice = null
            cachedPrinter = null
            throw e
        }
    }

    override fun openCashDrawer() {
        try {
            val printer = createPrinter()
            printer.openCashBox()
            Log.d(TAG, "Cash drawer opened successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error opening cash drawer: ${e.message}")
            cachedBluetoothDevice = null
            cachedPrinter = null
        }
    }

    override fun getDeviceList(): List<Printer> {
        TODO("Not needed")
    }

    override fun getPrinterStatus(): String {
        return if (isConnected && cachedBluetoothDevice != null) "Connected to Bluetooth device" else "Disconnected"
    }

    override fun printTransactionReceipt(transactionData: Map<String, Any>) {
        Log.d(TAG, "Printing transaction receipt on $printerName")
        try {
            val printer = createPrinter()
            val printData = templates.getTransactionReceipt(printer, transactionData)
            Log.d(TAG, "Sending print data to Bluetooth printer")
            printer.printFormattedTextAndCut(printData)
            Log.d(TAG, "Successfully printed transaction receipt")
        } catch (e: Exception) {
            Log.e(TAG, "Error printing transaction receipt: ${e.message}", e)
            // If there's an error, clear the cached connection so we'll try to reconnect next time
            cachedBluetoothDevice = null
            cachedPrinter = null
            throw e
        }
    }

    override fun disconnect() {
        Log.d(TAG, "Disconnecting from $printerName")
        // We don't actually disconnect the Bluetooth connection to avoid reconnection overhead
        // Just mark as disconnected in our state
        isConnected = false
    }

    private fun createPrinter(): EscPosPrinter {
        if (cachedPrinter == null || !isConnectionValid()) {
            Log.d(TAG, "Creating new EscPosPrinter instance for Bluetooth")
            if (cachedBluetoothDevice == null || !isConnectionValid()) {
                Log.d(TAG, "No cached Bluetooth connection or connection invalid, creating a new one")
                try {
                    cachedBluetoothDevice = BluetoothPrintersConnections.selectFirstPaired()

                    if (cachedBluetoothDevice == null) {
                        throw IllegalStateException("Could not connect to any paired Bluetooth printer")
                    }

                    isConnected = true
                    Log.d(TAG, "Successfully reconnected to Bluetooth printer")
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to reconnect to Bluetooth printer: ${e.message}", e)
                    throw e
                }
            }

            try {
                cachedPrinter = EscPosPrinter(
                    cachedBluetoothDevice,
                    printerDPI,
                    printerWidthMM,
                    charsPerLine
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error creating EscPosPrinter: ${e.message}", e)
                // Connection might be stale, try to reconnect
                cachedBluetoothDevice = null
                cachedPrinter = null
                isConnected = false
                // Try one more time
                return createPrinter()
            }
        } else {
            Log.d(TAG, "Using cached EscPosPrinter instance")
        }

        return cachedPrinter!!
    }

    // Check if the Bluetooth connection is still valid
    private fun isConnectionValid(): Boolean {
        if (cachedBluetoothDevice == null) return false

        try {
            // Try a simple operation to check if the connection is still valid
            // This is a lightweight check that doesn't actually send data
            val isValid = cachedBluetoothDevice?.isConnected() ?: false
            Log.d(TAG, "Bluetooth connection valid: $isValid")
            return isValid
        } catch (e: Exception) {
            Log.e(TAG, "Error checking Bluetooth connection: ${e.message}", e)
            return false
        }
    }
}
