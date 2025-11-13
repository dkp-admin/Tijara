package codes.shahid.rnprinterplugin.utils

import android.content.Context
import android.content.SharedPreferences
import android.net.wifi.WifiManager
import android.os.Build
import java.net.Inet4Address
import java.net.NetworkInterface
import java.util.*

/**
 * Centralized server configuration management
 */
object ServerConfig {
    private const val PREFS_NAME = "server_config"
    private const val KEY_SERVER_PORT = "server_port"
    private const val DEFAULT_PORT = 8080

    /**
     * Get the current device IP address for server display
     */
    fun getDeviceIpAddress(context: Context): String {
        return try {
            // First try to get WiFi IP address
            val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            val wifiInfo = wifiManager.connectionInfo
            val ipInt = wifiInfo.ipAddress

            if (ipInt != 0) {
                // Convert integer IP to string format
                val ip = String.format(
                    Locale.getDefault(),
                    "%d.%d.%d.%d",
                    ipInt and 0xff,
                    ipInt shr 8 and 0xff,
                    ipInt shr 16 and 0xff,
                    ipInt shr 24 and 0xff
                )
                if (ip != "0.0.0.0") return ip
            }

            // Fallback: Get IP from network interfaces
            getNetworkInterfaceIpAddress() ?: "127.0.0.1"
        } catch (e: Exception) {
            "127.0.0.1"
        }
    }

    /**
     * Get IP address from network interfaces
     */
    private fun getNetworkInterfaceIpAddress(): String? {
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            for (networkInterface in Collections.list(interfaces)) {
                val addresses = networkInterface.inetAddresses
                for (address in Collections.list(addresses)) {
                    if (!address.isLoopbackAddress && address is Inet4Address) {
                        val ip = address.hostAddress
                        if (ip != null && !ip.startsWith("127.") && !ip.startsWith("169.254.")) {
                            return ip
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // Ignore
        }
        return null
    }

    /**
     * Get the server IP address for client connections (used by other devices)
     */
    fun getServerIp(context: Context): String {
        return if (isEmulator()) "10.0.2.2" else getDeviceIpAddress(context)
    }

    /**
     * Get the client IP address for making requests to server (localhost for same device)
     */
    fun getClientIp(): String {
        return if (isEmulator()) "10.0.2.2" else "127.0.0.1"
    }

    /**
     * Get the current server port
     */
    fun getServerPort(context: Context): Int {
        val prefs = getPreferences(context)
        return prefs.getInt(KEY_SERVER_PORT, DEFAULT_PORT)
    }

    /**
     * Set the server port
     */
    fun setServerPort(context: Context, port: Int) {
        val prefs = getPreferences(context)
        prefs.edit().putInt(KEY_SERVER_PORT, port).apply()
    }

    /**
     * Get the complete server URL for client connections (localhost)
     */
    fun getServerUrl(context: Context): String {
        return "http://${getClientIp()}:${getServerPort(context)}"
    }

    /**
     * Get server configuration as a formatted string for display (shows actual device IP)
     */
    fun getServerConfigDisplay(context: Context): String {
        return "Server: ${getServerIp(context)}:${getServerPort(context)}"
    }

    /**
     * Check if running on emulator
     */
    private fun isEmulator(): Boolean {
        return (Build.PRODUCT.contains("sdk") ||
                Build.PRODUCT.contains("gphone") ||
                Build.PRODUCT.contains("emulator"))
    }

    /**
     * Get SharedPreferences instance
     */
    private fun getPreferences(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
}
