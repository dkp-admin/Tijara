package codes.shahid.rnprinterplugin

import codes.shahid.rnprinterplugin.server.PrinterHttpServer
import codes.shahid.rnprinterplugin.utils.ServerConfig
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import codes.shahid.rnprinterplugin.database.PrinterDao
import codes.shahid.rnprinterplugin.queue.NotificationUtils
import codes.shahid.rnprinterplugin.queue.PrinterQueueService
import codes.shahid.rnprinterplugin.queue.QueueAutoStarter
import com.google.android.material.bottomnavigation.BottomNavigationView

class MainActivity : AppCompatActivity() {
    companion object {
        private const val TAG = "MainActivity"
    }

    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Create notification channels to ensure notifications work
        NotificationUtils.createNotificationChannels(applicationContext)

        // Start the HTTP server with application context
        val serverPort = ServerConfig.getServerPort(applicationContext)
        PrinterHttpServer.getInstance(applicationContext).start(serverPort)

        // Start the printer queue service
        startPrinterQueueService()

        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Set up the navigation controller
        val navHostFragment = supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        // Set up the bottom navigation view with the navigation controller
        val bottomNavigationView = findViewById<BottomNavigationView>(R.id.bottom_navigation)
        bottomNavigationView.setupWithNavController(navController)
    }

    private fun startPrinterQueueService() {
        try {
            Log.d(TAG, "Starting printer queue service")
            val intent = Intent(this, PrinterQueueService::class.java)
            intent.action = PrinterQueueService.ACTION_START_SERVICE

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                startForegroundService(intent)
            } else {
                startService(intent)
            }

            // Register the auto-starter to restart the service on device reboot
            QueueAutoStarter.enableAutoStart(this)

            Log.d(TAG, "Printer queue service started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting printer queue service: ${e.message}", e)
        }
    }

    private fun clearAllPrinters() {
        val printerDao = PrinterDao(this)
        printerDao.deleteAllPrinters()
    }
}