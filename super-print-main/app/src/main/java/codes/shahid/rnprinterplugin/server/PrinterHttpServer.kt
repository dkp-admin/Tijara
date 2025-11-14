package codes.shahid.rnprinterplugin.server

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.util.Log
import codes.shahid.rnprinterplugin.server.controller.*
import fi.iki.elonen.NanoHTTPD
import java.io.IOException
import java.lang.ref.WeakReference
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledExecutorService
import java.util.concurrent.TimeUnit

class PrinterHttpServer private constructor(private val contextRef: WeakReference<Context>) {
    private var server: NanoHTTPD? = null
    private var healthCheckExecutor: ScheduledExecutorService? = null
    
    companion object {
        private const val TAG = "PrinterHttpServer"
        private const val HEALTH_CHECK_INTERVAL = 30L // seconds
        @Volatile
        private var instance: PrinterHttpServer? = null
        
        fun getInstance(context: Context): PrinterHttpServer {
            return instance ?: synchronized(this) {
                instance ?: PrinterHttpServer(WeakReference(context.applicationContext)).also { instance = it }
            }
        }
    }

    // Initialize controllers
    private val controllers = mapOf(
        "/print" to PrintController(),
        "/status" to StatusController(),
        "/ping" to PingController(),
        "/printLabel" to LabelPrintController(),
        "/transaction-report" to PrintController(),
        "/logs" to ActivityLogsController(),
        "/printers" to PrinterStatusController(),
        "/clear-stuck-jobs" to ClearStuckJobsController()
    )

    fun start(port: Int = 8080) {
        val context = contextRef.get() ?: return
        
        startServer(port)
        startHealthCheck(port)
    }

    private fun startServer(port: Int) {
        if (server == null) {
            Log.d(TAG, "Starting server on port $port")
            server = createServer(port)
            try {
                server?.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false)
                Log.i(TAG, "Server started on port $port")
            } catch (e: IOException) {
                Log.e(TAG, "Error starting server: ${e.message}")
            }
        } else {
            Log.w(TAG, "Server already running")
        }
    }

    private fun createServer(port: Int): NanoHTTPD {
        return object : NanoHTTPD(port) {

            override fun getHostname(): String? = "0.0.0.0"
            @SuppressLint("SuspiciousIndentation")
                override fun serve(session: IHTTPSession): Response {
                val context = contextRef.get() ?: return newFixedLengthResponse(
                    Response.Status.INTERNAL_ERROR,
                    MIME_PLAINTEXT,
                    "Server context not available"
                )
                
                    return try {
                    val controller = controllers[session.uri]
                    if (controller != null) {
                        controller.handle(session, context)
                    } else {
                                Log.w(TAG, "Unknown route: ${session.uri}")
                                newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "Not Found")
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error handling request: ${e.message}", e)
                    val response = newFixedLengthResponse(
                        Response.Status.INTERNAL_ERROR,
                        MIME_PLAINTEXT,
                        "Server Error: ${e.message}"
                    )
                    response.addHeader("Connection", "close")
                    response.addHeader("Content-Encoding", "identity")
                    response.setChunkedTransfer(false)
                    response
                }
            }
        }
    }

    private fun startHealthCheck(port: Int) {
        healthCheckExecutor?.shutdown()
        healthCheckExecutor = Executors.newSingleThreadScheduledExecutor().apply {
            scheduleAtFixedRate({
                checkServerHealth(port)
            }, HEALTH_CHECK_INTERVAL, HEALTH_CHECK_INTERVAL, TimeUnit.SECONDS)
                    }
    }

    private fun checkServerHealth(port: Int) {
        try {
            val context = contextRef.get() ?: return
            val serverIp = if (isEmulator()) "10.0.2.2" else "127.0.0.1"
            val url = URL("http://$serverIp:$port/ping")
            val connection = url.openConnection() as HttpURLConnection
            connection.connectTimeout = 3000
            connection.readTimeout = 3000
            connection.requestMethod = "GET"
            
            try {
                val responseCode = connection.responseCode
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    Log.w(TAG, "Server health check failed with response code: $responseCode")
                    restartServer(port)
                }
            } finally {
                connection.disconnect()
            }
                    } catch (e: Exception) {
            Log.e(TAG, "Server health check failed: ${e.message}")
            restartServer(port)
                    }
                }

    private fun restartServer(port: Int) {
        Log.i(TAG, "Attempting to restart server")
        try {
            stop()
            startServer(port)
            } catch (e: Exception) {
            Log.e(TAG, "Error restarting server: ${e.message}")
            }
    }

    private fun isEmulator(): Boolean {
        return (Build.PRODUCT.contains("sdk") || 
                Build.PRODUCT.contains("gphone") || 
                Build.PRODUCT.contains("emulator"))
    }

    fun stop() {
        healthCheckExecutor?.shutdown()
        healthCheckExecutor = null
        server?.stop()
        server = null
        Log.i(TAG, "Server stopped")
    }
}
