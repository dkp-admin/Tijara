package codes.shahid.rnprinterplugin.queue

import android.app.NotificationManager
import android.content.Context
import android.util.Log
import codes.shahid.rnprinterplugin.database.PrinterDao
import codes.shahid.rnprinterplugin.database.ActivityLogDao
import codes.shahid.rnprinterplugin.printer.BasePrinter
import codes.shahid.rnprinterplugin.printer.PrinterManager
import codes.shahid.rnprinterplugin.printer.lan.LanPrinter
import codes.shahid.rnprinterplugin.types.Order
import codes.shahid.rnprinterplugin.types.Printer
import codes.shahid.rnprinterplugin.types.PrinterConnectionParams
import codes.shahid.rnprinterplugin.types.PrinterType
import codes.shahid.rnprinterplugin.types.ActivityLog
import codes.shahid.rnprinterplugin.types.ActivityLogAction
import codes.shahid.rnprinterplugin.types.ActivityLogStatus
import codes.shahid.rnprinterplugin.queue.PrintJob
import codes.shahid.rnprinterplugin.queue.PrintJobType
import codes.shahid.rnprinterplugin.queue.PrintJobStatus
import codes.shahid.rnprinterplugin.queue.NotificationUtils
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledExecutorService
import java.util.concurrent.TimeUnit
import java.util.Date


class PrinterQueue(private val context: Context) {
    companion object {
        private const val TAG = "PrinterQueue"
        private const val LAN_QUEUE_DEBUG_TAG = "LAN_QUEUE_DEBUG"
        private var instance: PrinterQueue? = null
        private const val MAX_RETRY_ATTEMPTS = 3
        private const val RETRY_DELAY_MS = 10000L // 10 seconds

        @Synchronized
        fun getInstance(context: Context): PrinterQueue {
            if (instance == null) {
                instance = PrinterQueue(context.applicationContext)
            }
            return instance!!
        }
    }

    // Per-printer queues for independent processing
    private val printerQueues = ConcurrentHashMap<String, ConcurrentLinkedQueue<PrintJob>>()
    private val printerExecutors = ConcurrentHashMap<String, ScheduledExecutorService>()
    private val printerDao = PrinterDao(context)
    private val printerManager = PrinterManager(context)
    private val activityLogDao = ActivityLogDao(context)
    private var isRunning = false
    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    private var printersInitialized = false


    fun startQueue(): Map<String, Any> {
        if (isRunning) {
            Log.d(TAG, "Queue is already running")
            updateNotification()
            return mapOf(
                "success" to true,
                "message" to "Queue is already running"
            )
        }
        try {
            Log.d(TAG, "Starting printer queue")
            showNotification()

            // Clear all USB printer caches to ensure fresh connections with new logic
            printerManager.clearAllUsbPrinterCaches()

            // Initialize printers on startup
            initializePrintersOnStartup()

            // Clean up old logs - keep 30 days of data
            cleanupOldLogs()

            // Initialize per-printer queues and executors
            initializePerPrinterQueues()

            isRunning = true
            return mapOf(
                "success" to true,
                "message" to "Queue started successfully"
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error starting queue: ${e.message}")
            return mapOf(
                "success" to false,
                "error" to (e.message ?: "Unknown error")
            )
        }
    }


    private fun showNotification() {
        try {
            // Aggregate counts from all per-printer queues
            var pendingJobs = 0
            var processingJobs = 0

            printerQueues.values.forEach { queue ->
                pendingJobs += queue.count { it.status == PrintJobStatus.PENDING }
                processingJobs += queue.count { it.status == PrintJobStatus.PROCESSING }
            }


            val notification = NotificationUtils.createQueueNotification(
                context,
                pendingJobs,
                processingJobs
            )
            notificationManager.notify(NotificationUtils.QUEUE_NOTIFICATION_ID, notification)

            Log.d(TAG, "Queue notification shown")
        } catch (e: Exception) {
            Log.e(TAG, "Error showing notification: ${e.message}")
        }
    }


    private fun updateNotification() {
        try {
            if (isRunning) {
                // Aggregate counts from all per-printer queues
                var pendingJobs = 0
                var processingJobs = 0

                printerQueues.values.forEach { queue ->
                    pendingJobs += queue.count { it.status == PrintJobStatus.PENDING }
                    processingJobs += queue.count { it.status == PrintJobStatus.PROCESSING }
                }

                NotificationUtils.updateQueueNotification(
                    context,
                    pendingJobs,
                    processingJobs
                )

                Log.d(TAG, "Queue notification updated")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error updating notification: ${e.message}")
        }
    }


    /**
     * Add a print job to the queue for a specific printer
     * @param printerId The ID of the printer to use
     * @param jobType The type of print job
     * @param order The order to print
     * @param kitchenName Optional kitchen name for KOT printing
     * @return Result of the operation
     */
    fun addToQueue(
        printerId: String,
        jobType: PrintJobType,
        order: Order? = null,                          // make order optional
        transactionData: Map<String, Any>? = null,
        kitchenName: String? = null
    ): Map<String, Any> {
        try {
            val printer = printerDao.getPrinterById(printerId)
            if (printer == null) {
                Log.e(TAG, "Printer not found with ID: $printerId")
                
                // Log this error
                activityLogDao.insertActivityLog(
                    ActivityLog(
                        printerId = printerId,
                        jobId = "",
                        orderId = order?.orderNum ?: "",
                        action = ActivityLogAction.QUEUED,
                        status = ActivityLogStatus.ERROR,
                        message = "Failed to add job to queue: Printer not found",
                        errorDetails = "Printer with ID $printerId not found in database"
                    )
                )
                
                return mapOf(
                    "success" to false,
                    "error" to "Printer not found"
                )
            }

            Log.d("Printing", order.toString())
            val printJob = PrintJob(
                printerId = printerId,
                jobType = jobType,
                order = order,
                transactionData = transactionData,
                kitchenName = kitchenName
            )
            Log.d("PrintJob", printJob.toString())

            // Ensure printer has a queue and executor (for newly added printers)
            ensurePrinterQueueExists(printer)

            // Add to per-printer queue
            val printerQueue = printerQueues[printerId]!!
            printerQueue.add(printJob)
            Log.d("USB_DEBUG", "📋 Added job to printer queue: ${printJob.id} (${jobType.name}) for printer: ${printer.name}")
            
            // Log the job being added to queue
            activityLogDao.insertActivityLog(
                ActivityLog(
                    jobId = printJob.id,
                    orderId = order?.orderNum ?: "",
                    printerId = printerId,
                    printerName = printer.name,
                    action = ActivityLogAction.QUEUED,
                    status = ActivityLogStatus.PENDING,
                    message = "Job added to queue: ${jobType.name}"
                )
            )
            
            if (!isRunning) {
                startQueue()
            } else {
                updateNotification()
            }
            return mapOf(
                "success" to true,
                "jobId" to printJob.id
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error adding job to queue: ${e.message}")
            
            // Log the error
            activityLogDao.insertActivityLog(
                ActivityLog(
                    printerId = printerId,
                    jobId = "",
                    orderId = order?.orderNum ?: "",
                    action = ActivityLogAction.QUEUED,
                    status = ActivityLogStatus.ERROR,
                    message = "Failed to add job to queue: ${e.message}",
                    errorDetails = e.stackTraceToString()
                )
            )
            
            return mapOf(
                "success" to false,
                "error" to (e.message ?: "Unknown error")
            )
        }
    }

    /**
     * Add a print job to the queue for all printers
     * This method fetches all printers from the database and adds the order to the queue for each printer
     * based on the job type and printer capabilities
     * @param jobType The type of print job
     * @param order The order to print
     * @param kitchenName Optional kitchen name for KOT printing
     * @return Result of the operation
     */
    fun addToQueue(
        jobType: PrintJobType,
        order: Order?= null,
        transactionData: Map<String, Any>? = null,
        kitchenName: String? = null
    ): Map<String, Any> {
        try {
            // Get all printers from the database
            val printers = printerDao.getAllPrinters()
            if (printers.isEmpty()) {
                Log.e(TAG, "No printers found in the database")
                return mapOf(
                    "success" to false,
                    "error" to "No printers found"
                )
            }

            val jobIds = mutableListOf<String>()
            var addedJobs = 0

            // Add the order to the queue for each printer based on job type and printer capabilities
            for (printer in printers) {
                // Skip printers that don't support the job type
                when (jobType) {
                    PrintJobType.RECEIPT, PrintJobType.REFUND_RECEIPT, PrintJobType.PROFORMA,PrintJobType.TRANSACTION_REPORT -> {
                        if (!printer.enableReceipts) {
                            Log.d(TAG, "Skipping printer ${printer.name} for ${jobType.name} (receipts not enabled)")
                            continue
                        }
                    }
                    PrintJobType.KOT -> {
                        if (!printer.enableKOT) {
                            Log.d(TAG, "Skipping printer ${printer.name} for KOT (KOT not enabled)")
                            continue
                        }

                        // For KOT, check if the printer is assigned to the specified kitchen
                        if (kitchenName != null && printer.kitchenRef!!.isNotEmpty() && printer.kitchenRef != kitchenName) {
                            Log.d(TAG, "Skipping printer ${printer.name} for KOT (kitchen mismatch: ${printer.kitchenRef} != $kitchenName)")
                            continue
                        }
                    }

                }

                // Add the job to the queue for this printer
                val result = addToQueue(printer.id, jobType, order, transactionData , kitchenName)
                if (result["success"] as Boolean) {
                    jobIds.add(result["jobId"] as String)
                    addedJobs++
                }
            }

            if (addedJobs == 0) {
                return mapOf(
                    "success" to false,
                    "error" to "No suitable printers found for job type: ${jobType.name}"
                )
            }

            return mapOf(
                "success" to true,
                "jobIds" to jobIds,
                "addedJobs" to addedJobs
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error adding jobs to queue: ${e.message}")
            return mapOf(
                "success" to false,
                "error" to (e.message ?: "Unknown error")
            )
        }
    }


    fun getQueueStatus(): Map<String, Any> {
        // Aggregate status from all per-printer queues
        var totalJobs = 0
        var pendingJobs = 0
        var processingJobs = 0
        var completedJobs = 0
        var failedJobs = 0

        printerQueues.values.forEach { queue ->
            totalJobs += queue.size
            pendingJobs += queue.count { it.status == PrintJobStatus.PENDING }
            processingJobs += queue.count { it.status == PrintJobStatus.PROCESSING }
            completedJobs += queue.count { it.status == PrintJobStatus.COMPLETED }
            failedJobs += queue.count { it.status == PrintJobStatus.FAILED }
        }

        return mapOf(
            "isRunning" to isRunning,
            "totalJobs" to totalJobs,
            "pendingJobs" to pendingJobs,
            "processingJobs" to processingJobs,
            "completedJobs" to completedJobs,
            "failedJobs" to failedJobs
        )
    }

    /**
     * Clear stuck jobs and reset LAN printer connections
     * This method helps recover from network connectivity issues
     */
    fun clearStuckJobsAndResetLanConnections(): Map<String, Any> {
        return try {
            Log.i(LAN_QUEUE_DEBUG_TAG, "🔧 Starting stuck job cleanup and LAN connection reset")

            var clearedJobs = 0
            var resetPrinters = 0

            // Get all LAN printers
            val lanPrinters = printerDao.getAllPrinters().filter { it.printerType.lowercase() == "lan" }
            Log.d(LAN_QUEUE_DEBUG_TAG, "🖨️ Found ${lanPrinters.size} LAN printers to check")

            lanPrinters.forEach { printer ->
                val printerQueue = printerQueues[printer.id]
                if (printerQueue != null) {
                    // Count and remove stuck jobs (processing or failed jobs older than 5 minutes)
                    val currentTime = System.currentTimeMillis()
                    val stuckJobs = printerQueue.filter { job ->
                        (job.status == PrintJobStatus.PROCESSING || job.status == PrintJobStatus.FAILED) &&
                        (currentTime - job.createdAt.time) > 300000 // 5 minutes
                    }

                    stuckJobs.forEach { job ->
                        printerQueue.remove(job)
                        clearedJobs++
                        Log.w(LAN_QUEUE_DEBUG_TAG, "🗑️ Cleared stuck job ${job.id} (${job.status}) for printer ${printer.name}")

                        // Log the job removal
                        activityLogDao.insertActivityLog(
                            ActivityLog(
                                jobId = job.id,
                                orderId = job.order?.orderNum ?: "",
                                printerId = printer.id,
                                printerName = printer.name,
                                action = ActivityLogAction.FAILED,
                                status = ActivityLogStatus.ERROR,
                                message = "Job cleared due to stuck queue recovery",
                                errorDetails = "Job was stuck in ${job.status} status for more than 5 minutes"
                            )
                        )
                    }
                } else {
                    Log.d(LAN_QUEUE_DEBUG_TAG, "📋 No queue found for printer ${printer.name}")
                }

                // Clear printer cache and reset connections
                Log.d(LAN_QUEUE_DEBUG_TAG, "🔄 Resetting connections for printer ${printer.name} (${printer.ip}:${printer.port})")
                printerManager.clearPrinterCache(printer.id)
                resetPrinters++
            }

            // Clear all LAN printer caches
            Log.d(LAN_QUEUE_DEBUG_TAG, "🧹 Clearing all LAN printer caches")
            printerManager.clearAllLanPrinterCaches()

            // Also clear the static LAN printer caches
            LanPrinter.clearAllCachedConnections()

            updateNotification()

            Log.i(LAN_QUEUE_DEBUG_TAG, "✅ Cleanup complete: Cleared $clearedJobs stuck jobs and reset $resetPrinters LAN printers")

            mapOf(
                "success" to true,
                "message" to "Successfully cleared stuck jobs and reset LAN connections",
                "clearedJobs" to clearedJobs,
                "resetPrinters" to resetPrinters
            )

        } catch (e: Exception) {
            Log.e(TAG, "Error clearing stuck jobs: ${e.message}")
            mapOf(
                "success" to false,
                "error" to (e.message ?: "Unknown error")
            )
        }
    }

    /**
     * Refresh printer queues to include newly added printers
     * Call this after adding/removing printers to ensure they have queues
     */
    fun refreshPrinterQueues(): Map<String, Any> {
        return try {
            if (isRunning) {
                Log.d("USB_DEBUG", "🔄 Refreshing printer queues for new/updated printers")

                // Get current printers and ensure they all have queues
                val printers = printerDao.getAllPrinters()
                printers.forEach { printer ->
                    ensurePrinterQueueExists(printer)
                }

                // TODO: Could also remove queues for deleted printers here if needed

                Log.d("USB_DEBUG", "✅ Printer queues refreshed successfully")
                mapOf(
                    "success" to true,
                    "message" to "Printer queues refreshed",
                    "activeQueues" to printerQueues.size
                )
            } else {
                mapOf(
                    "success" to false,
                    "message" to "Queue is not running"
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error refreshing printer queues: ${e.message}")
            mapOf(
                "success" to false,
                "error" to (e.message ?: "Unknown error")
            )
        }
    }


    // Using retry constants from companion object

    // Counter to track how many times processQueue has been called
    private var processQueueCounter = 0
    
    /**
     * Periodically clean up logs to prevent them from growing too large
     * This is called from processQueue() which runs every 2 seconds
     */
    private fun periodicLogCleanup() {
        // Only check every 1000 calls (about every 33 minutes at 2-second intervals)
        processQueueCounter++
        if (processQueueCounter >= 1000) {
            processQueueCounter = 0
            try {
                // Cap the logs to 10,000 entries
                val deleted = activityLogDao.limitLogsCount(10000)
                if (deleted > 0) {
                    Log.d(TAG, "Periodic cleanup: capped activity logs to 10,000 entries (deleted $deleted logs)")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error in periodic log cleanup: ${e.message}")
            }
        }
    }

    private fun processJob(job: PrintJob, attemptCount: Int = 0) {
        var printerInstance: BasePrinter? = null
        try {
            Log.d("USB_DEBUG", "🔄 Processing job: ${job.id} (${job.jobType}) for printer: ${job.printerId} - Attempt ${attemptCount + 1}")
            job.status = PrintJobStatus.PROCESSING
            updateNotification()

            val printer = printerDao.getPrinterById(job.printerId)
            if (printer == null) {
                Log.e(TAG, "Printer not found for job: ${job.id}")
                job.status = PrintJobStatus.FAILED
                job.errorMessage = "Printer not found"
                
                // Log the error
                activityLogDao.insertActivityLog(
                    ActivityLog(
                        jobId = job.id,
                        orderId = job.order?.orderNum ?: "",
                        printerId = job.printerId,
                        action = ActivityLogAction.PROCESSING,
                        status = ActivityLogStatus.ERROR,
                        message = "Failed to process job: Printer not found",
                        errorDetails = "Printer with ID ${job.printerId} not found in database"
                    )
                )
                
                finishJob(job)
                return
            }

            // Log the job being processed
            activityLogDao.insertActivityLog(
                ActivityLog(
                    jobId = job.id,
                    orderId = job.order?.orderNum ?: "",
                    printerId = job.printerId,
                    printerName = printer.name,
                    action = ActivityLogAction.PROCESSING,
                    status = ActivityLogStatus.IN_PROGRESS,
                    message = "Processing job: ${job.jobType.name} (Attempt ${attemptCount + 1})"
                )
            )

            // For LAN printers, validate cached connections before attempting to print
            if (printer.printerType.lowercase() == "lan") {
                codes.shahid.rnprinterplugin.printer.lan.LanPrinter.validateAndClearInvalidConnections(context)
            }

            printerInstance = printerManager.createPrinter(printer)
            if (printerInstance == null) {
                job.status = PrintJobStatus.FAILED
                job.errorMessage = "Failed to create printer instance"
                Log.e(TAG, "Failed to create printer instance for job: ${job.id}")
                finishJob(job)
                return
            }

            try {
                printerInstance.initialize()
                when (printer.printerType.lowercase()) {
                    "lan" -> {
                        Log.d(TAG,printer.toString())
                        if (printer.ip.isNotBlank() && printer.port > 0) {
                            printerInstance.connect(
                                PrinterConnectionParams(
                                    type = PrinterType.LAN,
                                    ip = printer.ip,
                                    port = printer.port
                                )
                            )
                        } else {
                            throw IllegalArgumentException("LAN printer requires IP and port")
                        }
                    }
                    "usb" -> {
                        if (printer.productId.isNotBlank()) {
                            printerInstance.connect(
                                PrinterConnectionParams(
                                    type = PrinterType.USB,
                                    productId = printer.productId
                                )
                            )
                        } else {
                            throw IllegalArgumentException("USB printer requires productId")
                        }
                    }
                    "bluetooth" -> {
                        printerInstance.connect(
                            PrinterConnectionParams(
                                type = PrinterType.BLUETOOTH,
                                macAddress = printer.macAddress
                            )
                        )
                    }
                    "sunmi" -> {
                        // Sunmi printers are built-in, so we just need to connect without specific parameters
                        Log.d(TAG, "Connecting to Sunmi built-in printer")
                        printerInstance.connect(
                            PrinterConnectionParams(
                                type = PrinterType.SUNMI
                            )
                        )
                    }
                    "neoleap" -> {
                        // Neoleap printers are built-in, so we just need to connect without specific parameters
                        Log.d(TAG, "Connecting to Neoleap built-in printer")
                        printerInstance.connect(
                            PrinterConnectionParams(
                                type = PrinterType.NEOLEAP
                            )
                        )
                    }
                }
            } catch (e: Exception) {
                handleConnectionError(job, printer, printerInstance, e, attemptCount, "Failed to connect to printer")
                return
            }

            try {
                // Execute the print job - respect numberOfPrints or numberOfKotPrints setting based on job type
                val numberOfPrints = when (job.jobType) {
                    PrintJobType.KOT -> printer.numberOfKotPrints.coerceAtLeast(1)
                    else -> printer.numberOfPrints.coerceAtLeast(1)
                }

                val jobTypeDescription = when (job.jobType) {
                    PrintJobType.KOT -> "KOT"
                    PrintJobType.RECEIPT -> "receipt"
                    PrintJobType.REFUND_RECEIPT -> "refund receipt"
                    PrintJobType.PROFORMA -> "proforma"
                    PrintJobType.TRANSACTION_REPORT -> "transaction report"
                }

                Log.d("USB_DEBUG", "🖨️ Printing ${numberOfPrints} copies of $jobTypeDescription for printer: ${printer.name} (ID: ${printer.id})")

                for (printCount in 1..numberOfPrints) {
                    if (numberOfPrints > 1) {
                        Log.d("USB_DEBUG", "📄 Printing copy $printCount of $numberOfPrints ($jobTypeDescription) on printer: ${printer.name}")
                    }

                    when (job.jobType) {
                        PrintJobType.RECEIPT -> {
                            Log.d("USB_DEBUG", "✅ Executing receipt print on printer: ${printer.name} (${printer.printerType}) - Job: ${job.id}")
                            job.order?.let { printerInstance.printReceipt(it) }
                        }
                        PrintJobType.REFUND_RECEIPT -> {
                            job.order?.let { printerInstance.printRefundReceipt(it) }
                        }
                        PrintJobType.KOT -> {
                            job.order?.let { printerInstance.printKot(it, job.kitchenName) }
                        }
                        PrintJobType.PROFORMA -> {
                            job.order?.let { printerInstance.printProforma(it) }
                        }
                        PrintJobType.TRANSACTION_REPORT -> {
                            Log.d(TAG,"Printing Transaction report")
                            job.transactionData?.let { printerInstance.printTransactionReceipt(it) }
                        }
                    }

                    // Add a small delay between prints to avoid overwhelming the printer
                    if (printCount < numberOfPrints) {
                        Thread.sleep(1000) // 1 second delay between prints
                    }
                }

                // Job completed successfully
                job.status = PrintJobStatus.COMPLETED
                job.processedAt = Date()
                Log.d(TAG, "Job completed successfully: ${job.id} (Attempt ${attemptCount + 1})")
                
                // Log the successful print
                activityLogDao.insertActivityLog(
                    ActivityLog(
                        jobId = job.id,
                        orderId = job.order?.orderNum ?: "",
                        printerId = printer.id,
                        printerName = printer.name,
                        action = ActivityLogAction.PRINTED,
                        status = ActivityLogStatus.SUCCESS,
                        message = "Print completed successfully: ${job.jobType.name} (Attempt ${attemptCount + 1})"
                    )
                )
                
                finishJob(job)

            } catch (e: Exception) {
                // Check if this is a "device not found" error - if so, fail immediately without retries
                if (e.message?.contains("Target USB device") == true && e.message?.contains("not found") == true) {
                    Log.w("USB_DEBUG", "❌ Device not found error for printer ${printer.name} - failing job immediately without retries")

                    // Clear the printer from cache to force fresh connection attempt next time
                    printerManager.clearPrinterCache(printer.id)

                    job.status = PrintJobStatus.FAILED
                    job.errorMessage = "Target USB device not available: ${e.message}"
                    finishJob(job)
                } else {
                    handlePrintError(job, printer, printerInstance, e, attemptCount)
                }
            }

        } catch (e: Exception) {
            // Unexpected error in job processing
            if (attemptCount < MAX_RETRY_ATTEMPTS - 1) {
                Log.e(TAG, "Unexpected error in job processing: ${e.message}. Retrying (${attemptCount + 1}/$MAX_RETRY_ATTEMPTS)")
                scheduleRetry(job, attemptCount)
            } else {
                job.status = PrintJobStatus.FAILED
                job.errorMessage = "Unexpected error after ${attemptCount + 1} attempts: ${e.message}"
                Log.e(TAG, "Job failed after ${attemptCount + 1} attempts: ${job.id} - ${e.message}")
                finishJob(job)
            }
        }
    }

    private fun handleConnectionError(
        job: PrintJob,
        printer: Printer,
        printerInstance: BasePrinter?,
        error: Exception,
        attemptCount: Int,
        errorPrefix: String
    ) {
        if (attemptCount < MAX_RETRY_ATTEMPTS - 1) {
            Log.e(TAG, "$errorPrefix: ${error.message}. Retrying (${attemptCount + 1}/$MAX_RETRY_ATTEMPTS)")
            
            // Log the retry
            activityLogDao.insertActivityLog(
                ActivityLog(
                    jobId = job.id,
                    orderId = job.order?.orderNum ?: "",
                    printerId = printer.id,
                    printerName = printer.name,
                    action = ActivityLogAction.RETRYING,
                    status = ActivityLogStatus.ERROR,
                    message = "$errorPrefix. Retrying (${attemptCount + 1}/$MAX_RETRY_ATTEMPTS)",
                    errorDetails = error.stackTraceToString()
                )
            )
            
            scheduleRetry(job, attemptCount)
        } else {
            job.status = PrintJobStatus.FAILED
            job.errorMessage = "$errorPrefix after ${attemptCount + 1} attempts: ${error.message}"
            Log.e(TAG, "Job failed after ${attemptCount + 1} attempts: ${job.id} - ${error.message}")
            
            // Log the final failure
            activityLogDao.insertActivityLog(
                ActivityLog(
                    jobId = job.id,
                    orderId = job.order?.orderNum ?: "",
                    printerId = printer.id,
                    printerName = printer.name,
                    action = ActivityLogAction.FAILED,
                    status = ActivityLogStatus.ERROR,
                    message = "Job failed after ${attemptCount + 1} attempts: $errorPrefix",
                    errorDetails = error.stackTraceToString()
                )
            )
            
            finishJob(job)
        }
    }

    private fun handlePrintError(
        job: PrintJob,
        printer: Printer,
        printerInstance: BasePrinter?,
        error: Exception,
        attemptCount: Int
    ) {
        Log.e(TAG, "Error during print operation: ${error.message}")

        // Check if this is a connection-related error
        val isConnectionError = error.message?.contains("connection", ignoreCase = true) == true ||
                               error.message?.contains("disconnected", ignoreCase = true) == true ||
                               error.message?.contains("socket", ignoreCase = true) == true ||
                               error.message?.contains("timeout", ignoreCase = true) == true ||
                               error.message?.contains("bluetooth", ignoreCase = true) == true ||
                               error.message?.contains("network", ignoreCase = true) == true ||
                               error.message?.contains("tcp", ignoreCase = true) == true ||
                               error.message?.contains("failed to create", ignoreCase = true) == true ||
                               error.message?.contains("unreachable", ignoreCase = true) == true ||
                               error.message?.contains("refused", ignoreCase = true) == true

        if (isConnectionError && attemptCount < MAX_RETRY_ATTEMPTS - 1) {
            // This is a connection error and we haven't exceeded max retries
            Log.d(TAG, "Connection error detected, scheduling retry (${attemptCount + 1}/$MAX_RETRY_ATTEMPTS)")

            // Log the connection error and retry
            activityLogDao.insertActivityLog(
                ActivityLog(
                    jobId = job.id,
                    orderId = job.order?.orderNum ?: "",
                    printerId = printer.id,
                    printerName = printer.name,
                    action = ActivityLogAction.RETRYING,
                    status = ActivityLogStatus.ERROR,
                    message = "Connection error detected. Retrying (${attemptCount + 1}/$MAX_RETRY_ATTEMPTS)",
                    errorDetails = error.stackTraceToString()
                )
            )

            // Clear the printer from cache to force reconnection on next attempt
            if (printer.id != null) {
                printerManager.clearPrinterCache(printer.id)
            }

            // If this is a LAN printer, clear specific printer cache and validate network
            if (printer.printerType.lowercase() == "lan") {
                Log.w(LAN_QUEUE_DEBUG_TAG, "🌐 LAN printer connection error detected for ${printer.name} (${printer.ip}:${printer.port})")

                // Clear cache for this specific printer first
                try {
                    Log.d(LAN_QUEUE_DEBUG_TAG, "🧹 Clearing cache for specific LAN printer: ${printer.name}")
                    LanPrinter.clearPrinterCache(printer.ip, printer.port)

                    // Also clear from PrinterManager cache
                    printerManager.clearPrinterCache(printer.id)
                    Log.d(LAN_QUEUE_DEBUG_TAG, "🧹 PrinterManager cache cleared for printer: ${printer.name}")
                } catch (e: Exception) {
                    Log.w(LAN_QUEUE_DEBUG_TAG, "⚠️ Error clearing specific printer cache: ${e.message}")
                }

                // Force validation of network connectivity for LAN printers
                try {
                    val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as android.net.ConnectivityManager
                    val network = connectivityManager.activeNetwork
                    val networkCapabilities = connectivityManager.getNetworkCapabilities(network)
                    val hasWifi = networkCapabilities?.hasTransport(android.net.NetworkCapabilities.TRANSPORT_WIFI) == true

                    if (!hasWifi) {
                        Log.w(LAN_QUEUE_DEBUG_TAG, "📵 No WiFi connectivity detected for LAN printer ${printer.name}, marking job for retry")
                    } else {
                        Log.d(LAN_QUEUE_DEBUG_TAG, "📶 WiFi is available, connection error may be printer-specific for ${printer.name}")
                    }
                } catch (e: Exception) {
                    Log.e(LAN_QUEUE_DEBUG_TAG, "❌ Error checking network connectivity: ${e.message}", e)
                }
            }

            scheduleRetry(job, attemptCount)
        } else if (attemptCount < MAX_RETRY_ATTEMPTS - 1) {
            // Not a connection error but we'll retry anyway
            Log.d(TAG, "Print error detected, scheduling retry (${attemptCount + 1}/$MAX_RETRY_ATTEMPTS)")
            
            // Log the print error and retry
            activityLogDao.insertActivityLog(
                ActivityLog(
                    jobId = job.id,
                    orderId = job.order?.orderNum!!,
                    printerName = printer.name,
                    action = ActivityLogAction.RETRYING,
                    status = ActivityLogStatus.ERROR,
                    message = "Print error detected. Retrying (${attemptCount + 1}/$MAX_RETRY_ATTEMPTS)",
                    errorDetails = error.stackTraceToString()
                )
            )
            
            scheduleRetry(job, attemptCount)
        } else {
            // We've exceeded max retries or this is not a connection error
            job.status = PrintJobStatus.FAILED
            job.errorMessage = "Failed after ${attemptCount + 1} attempts: ${error.message}"
            Log.e(TAG, "Job failed after ${attemptCount + 1} attempts: ${job.id} - ${error.message}")
            
            // Log the final failure
            activityLogDao.insertActivityLog(
                ActivityLog(
                    jobId = job.id,
                    orderId = job.order?.orderNum ?: "",
                    printerId = printer.id,
                    printerName = printer.name,
                    action = ActivityLogAction.FAILED,
                    status = ActivityLogStatus.ERROR,
                    message = "Job failed after ${attemptCount + 1} attempts",
                    errorDetails = error.stackTraceToString()
                )
            )
            
            finishJob(job)
        }
    }

    private fun scheduleRetry(job: PrintJob, currentAttempt: Int) {
        // Schedule a retry after the delay
        Thread {
            try {
                Log.d(TAG, "Waiting ${RETRY_DELAY_MS /1000} seconds before retry ${currentAttempt + 2}/$MAX_RETRY_ATTEMPTS for job ${job.id}")
                Thread.sleep(RETRY_DELAY_MS)

                // Check if the job is still in the appropriate printer queue (it might have been removed)
                val printerQueue = printerQueues[job.printerId]
                if (printerQueue?.contains(job) == true) {
                    Log.d(TAG, "Starting retry ${currentAttempt + 2}/$MAX_RETRY_ATTEMPTS for job ${job.id}")
                    processJob(job, currentAttempt + 1)
                } else {
                    Log.d(TAG, "Job ${job.id} no longer in queue, cancelling retry")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error during retry scheduling: ${e.message}")
                job.status = PrintJobStatus.FAILED
                job.errorMessage = "Error scheduling retry: ${e.message}"
                finishJob(job)
            }
        }.start()
    }

    private fun finishJob(job: PrintJob) {
        try {
            // Clean up: disconnect the printer to release resources, but only for certain printer types
            val printer = printerDao.getPrinterById(job.printerId)
            if (printer != null) {
                val printerType = printer.printerType.lowercase()

                // Skip disconnect for Bluetooth, Sunmi, and Neoleap printers to avoid reconnection overhead
                if (printerType != "bluetooth" && printerType != "sunmi" && printerType != "neoleap") {
                    val printerInstance = printerManager.createPrinter(printer)
                    if (printerInstance != null) {
                        Log.d(TAG, "Disconnecting printer after job completion")
                        printerInstance.disconnect()
                    }
                } else {
                    Log.d(TAG, "Skipping disconnect for $printerType printer to avoid reconnection overhead")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error disconnecting printer: ${e.message}")
        }

        // Remove the job from the appropriate per-printer queue
        val printerQueue = printerQueues[job.printerId]
        printerQueue?.remove(job)
        updateNotification()
    }


    fun stopQueue() {
        if (!isRunning) {
            Log.d(TAG, "Queue is not running")
            return
        }

        // Stop all per-printer executors
        printerExecutors.values.forEach { executor ->
            executor.shutdown()
            try {
                if (!executor.awaitTermination(2, TimeUnit.SECONDS)) {
                    executor.shutdownNow()
                }
            } catch (e: InterruptedException) {
                executor.shutdownNow()
            }
        }
        printerExecutors.clear()
        printerQueues.clear()

        isRunning = false
        printersInitialized = false // Reset initialization flag when queue stops

        // Cancel the notification
        NotificationUtils.cancelQueueNotification(context)

        Log.d(TAG, "Queue stopped")
    }

    private fun initializePerPrinterQueues() {
        Log.d("USB_DEBUG", "🏗️ Initializing per-printer queues")
        val printers = printerDao.getAllPrinters()

        printers.forEach { printer ->
            ensurePrinterQueueExists(printer)
        }
    }

    /**
     * Ensure a printer has a queue and executor (for newly added printers)
     * This allows dynamic addition of printers without restarting the app
     */
    private fun ensurePrinterQueueExists(printer: Printer) {
        val printerId = printer.id
        if (!printerQueues.containsKey(printerId)) {
            Log.d("USB_DEBUG", "📋 Creating queue for new printer: ${printer.name} (ID: $printerId)")
            printerQueues[printerId] = ConcurrentLinkedQueue<PrintJob>()

            // Create dedicated executor for this printer
            val executor = Executors.newSingleThreadScheduledExecutor { r ->
                Thread(r, "PrinterQueue-${printer.name}")
            }
            printerExecutors[printerId] = executor

            // Start processing for this printer
            executor.scheduleWithFixedDelay(
                { processPrinterQueue(printerId) },
                0,
                500, // 500ms interval for fast processing
                TimeUnit.MILLISECONDS
            )
        }
    }

    private fun processPrinterQueue(printerId: String) {
        try {
            val queue = printerQueues[printerId] ?: return
            val job = queue.poll() ?: return

            Log.d("USB_DEBUG", "🔄 Processing job for printer: $printerId")
            processJob(job, 0)

        } catch (e: Exception) {
            Log.e(TAG, "Error processing printer queue for $printerId: ${e.message}")
        }
    }

    /**
     * Initialize all printers when the queue starts
     * This ensures all printers are ready to use when print jobs are added
     */
    private fun initializePrintersOnStartup() {
        if (!printersInitialized) {
            try {
                Log.d(TAG, "Auto-initializing printers on startup")

                // Run in a background thread to avoid blocking the UI
                Thread {
                    try {
                        val printers = printerDao.getAllPrinters()
                        if (printers.isNotEmpty()) {
                            Log.d(TAG, "Found ${printers.size} printers to initialize")

                            for (printer in printers) {
                                try {
                                    Log.d(TAG, "Auto-initializing printer: ${printer.name} (${printer.printerType})")
                                    printerManager.initializePrinter(printer)
                                } catch (e: Exception) {
                                    Log.e(TAG, "Error auto-initializing printer ${printer.name}: ${e.message}")
                                    // Continue with other printers even if one fails
                                }
                            }
                        }

                        printersInitialized = true
                        Log.d(TAG, "Auto-initialization of printers completed")
                    } catch (e: Exception) {
                        Log.e(TAG, "Error in auto-initialization of printers: ${e.message}")
                    }
                }.start()
            } catch (e: Exception) {
                Log.e(TAG, "Error starting printer auto-initialization: ${e.message}")
            }
        }
    }

    /**
     * Clean up old logs to maintain database size
     */
    private fun cleanupOldLogs(daysToKeep: Int = 30, maxLogs: Int = 10000) {
        try {
            // First, delete logs based on age
            val deletedByAge = activityLogDao.deleteOldActivityLogs(daysToKeep)
            if (deletedByAge > 0) {
                Log.d(TAG, "Cleaned up $deletedByAge old activity logs (older than $daysToKeep days)")
            }
            
            // Then cap the total number of logs
            val deletedByCount = activityLogDao.limitLogsCount(maxLogs)
            if (deletedByCount > 0) {
                Log.d(TAG, "Capped activity logs to $maxLogs entries (deleted $deletedByCount logs)")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error cleaning up old logs: ${e.message}")
        }
    }
}
