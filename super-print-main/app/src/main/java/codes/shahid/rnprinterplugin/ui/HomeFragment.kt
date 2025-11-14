package codes.shahid.rnprinterplugin.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import codes.shahid.rnprinterplugin.R
import codes.shahid.rnprinterplugin.utils.ServerConfig
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class HomeFragment : Fragment() {
    private val TAG = "HomeFragment"

    // UI Components
    private lateinit var tvServerStatus: TextView
    private lateinit var serverStatusIndicator: View
    private lateinit var tvServerConfig: TextView
    private lateinit var btnCopyServerConfig: ImageButton
    private lateinit var tvTotalJobs: TextView
    private lateinit var tvQueueStatus: TextView
    private lateinit var queueStatusIndicator: View

    // Status checking
    private val handler = Handler(Looper.getMainLooper())
    private var isStatusCheckRunning = false
    private val statusCheckInterval = 3000L // 3 seconds

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_home, container, false)

        // Initialize views
        tvServerStatus = view.findViewById(R.id.tvServerStatus)
        serverStatusIndicator = view.findViewById(R.id.serverStatusIndicator)
        tvServerConfig = view.findViewById(R.id.tvServerConfig)
        btnCopyServerConfig = view.findViewById(R.id.btnCopyServerConfig)
        tvTotalJobs = view.findViewById(R.id.tvTotalJobs)
        tvQueueStatus = view.findViewById(R.id.tvQueueStatus)
        queueStatusIndicator = view.findViewById(R.id.queueStatusIndicator)

        // Set copy button click listener
        btnCopyServerConfig.setOnClickListener {
            copyServerConfigToClipboard()
        }

        // Update server configuration display
        updateServerConfigDisplay()

        return view
    }

    override fun onResume() {
        super.onResume()
        startStatusCheck()
        updateServerConfigDisplay()
    }

    override fun onPause() {
        super.onPause()
        stopStatusCheck()
    }

    private fun startStatusCheck() {
        if (!isStatusCheckRunning) {
            isStatusCheckRunning = true
            handler.post(statusCheckRunnable)
        }
    }

    private fun stopStatusCheck() {
        isStatusCheckRunning = false
        handler.removeCallbacks(statusCheckRunnable)
    }

    private val statusCheckRunnable = object : Runnable {
        override fun run() {
            if (isStatusCheckRunning) {
                checkServerHealth()
                checkQueueStatus()
                updateServerConfigDisplay()
                handler.postDelayed(this, statusCheckInterval)
            }
        }
    }

    private fun checkServerHealth() {
        thread {
            try {
                val url = URL("${ServerConfig.getServerUrl(requireContext())}/ping")
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 3000
                connection.readTimeout = 3000
                connection.requestMethod = "GET"
                connection.setRequestProperty("Connection", "close")
                connection.useCaches = false

                val responseCode = connection.responseCode
                connection.disconnect()

                activity?.runOnUiThread {
                    if (responseCode == 200) {
                        tvServerStatus.text = "Online"
                        tvServerStatus.setTextColor(resources.getColor(android.R.color.holo_green_dark, null))
                        serverStatusIndicator.setBackgroundResource(R.drawable.status_indicator_green)
                    } else {
                        tvServerStatus.text = "Error ($responseCode)"
                        tvServerStatus.setTextColor(resources.getColor(android.R.color.holo_red_dark, null))
                        serverStatusIndicator.setBackgroundResource(R.drawable.status_indicator_red)
                    }
                }
            } catch (e: Exception) {
                activity?.runOnUiThread {
                    tvServerStatus.text = "Offline"
                    tvServerStatus.setTextColor(resources.getColor(android.R.color.holo_red_dark, null))
                    serverStatusIndicator.setBackgroundResource(R.drawable.status_indicator_red)
                }
            }
        }
    }

    private fun checkQueueStatus() {
        thread {
            try {
                val url = URL("${ServerConfig.getServerUrl(requireContext())}/status")
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 3000
                connection.readTimeout = 3000
                connection.requestMethod = "GET"
                connection.setRequestProperty("Connection", "close")
                connection.useCaches = false

                if (connection.responseCode == 200) {
                    val response = connection.inputStream.bufferedReader().use { it.readText() }
                    connection.disconnect()

                    val jsonResponse = JSONObject(response)
                    val isRunning = jsonResponse.getBoolean("isRunning")
                    val totalJobs = jsonResponse.getInt("totalJobs")

                    activity?.runOnUiThread {
                        tvQueueStatus.text = if (isRunning) "Running" else "Stopped"
                        tvQueueStatus.setTextColor(
                            if (isRunning) resources.getColor(android.R.color.holo_green_dark, null)
                            else resources.getColor(android.R.color.holo_red_dark, null)
                        )
                        queueStatusIndicator.setBackgroundResource(
                            if (isRunning) R.drawable.status_indicator_green
                            else R.drawable.status_indicator_red
                        )

                        tvTotalJobs.text = totalJobs.toString()
                    }
                } else {
                    connection.disconnect()
                    activity?.runOnUiThread {
                        tvQueueStatus.text = "Error"
                        tvQueueStatus.setTextColor(resources.getColor(android.R.color.holo_red_dark, null))
                        queueStatusIndicator.setBackgroundResource(R.drawable.status_indicator_red)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error checking queue status: ${e.message}")
                activity?.runOnUiThread {
                    tvQueueStatus.text = "Unknown"
                    tvQueueStatus.setTextColor(resources.getColor(android.R.color.darker_gray, null))
                    queueStatusIndicator.setBackgroundResource(R.drawable.status_indicator_gray)
                }
            }
        }
    }

    private fun updateServerConfigDisplay() {
        try {
            val serverConfig = ServerConfig.getServerConfigDisplay(requireContext())
            tvServerConfig.text = serverConfig
        } catch (e: Exception) {
            Log.e(TAG, "Error updating server config display: ${e.message}")
            tvServerConfig.text = "Error loading config"
        }
    }

    private fun copyServerConfigToClipboard() {
        try {
            val clipboard = requireContext().getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val serverAddress = "http://${ServerConfig.getServerIp(requireContext())}:${ServerConfig.getServerPort(requireContext())}"
            val clip = ClipData.newPlainText("Server Address", serverAddress)
            clipboard.setPrimaryClip(clip)
            Toast.makeText(requireContext(), "Server address copied to clipboard", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Log.e(TAG, "Error copying to clipboard: ${e.message}")
            Toast.makeText(requireContext(), "Failed to copy server address", Toast.LENGTH_SHORT).show()
        }
    }
}
