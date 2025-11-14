package codes.shahid.rnprinterplugin.database

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.util.Log
import codes.shahid.rnprinterplugin.types.Printer
import java.util.UUID

class PrinterDao(context: Context) {
    private val dbHelper = DatabaseHelper(context)
    private val TAG = "PrinterDao"

    /**
     * Insert a new printer into the database
     * @param printer The printer to insert
     * @return The ID of the inserted printer, or null if insertion failed
     */
    fun insertPrinter(printer: Printer): String? {
        val db = dbHelper.writableDatabase
        val values = createContentValues(printer)

        // Generate a unique ID if not provided
        val printerId = if (printer.id.isBlank()) UUID.randomUUID().toString() else printer.id
        values.put(DatabaseHelper.COLUMN_ID, printerId)

        try {
            val result = db.insert(DatabaseHelper.TABLE_PRINTERS, null, values)
            return if (result != -1L) printerId else null
        } catch (e: Exception) {
            Log.e(TAG, "Error inserting printer: ${e.message}")
            return null
        } finally {
            db.close()
        }
    }

    /**
     * Update an existing printer in the database
     * @param printer The printer to update
     * @return true if update was successful, false otherwise
     */
    fun updatePrinter(printer: Printer): Boolean {
        if (printer.id.isBlank()) {
            Log.e(TAG, "Cannot update printer with blank ID")
            return false
        }

        val db = dbHelper.writableDatabase
        val values = createContentValues(printer)

        try {
            val rowsAffected = db.update(
                DatabaseHelper.TABLE_PRINTERS,
                values,
                "${DatabaseHelper.COLUMN_ID} = ?",
                arrayOf(printer.id)
            )
            return rowsAffected > 0
        } catch (e: Exception) {
            Log.e(TAG, "Error updating printer: ${e.message}")
            return false
        } finally {
            db.close()
        }
    }

    /**
     * Delete a printer from the database
     * @param printerId The ID of the printer to delete
     * @return true if deletion was successful, false otherwise
     */
    fun deletePrinter(printerId: String): Boolean {
        val db = dbHelper.writableDatabase

        try {
            val rowsAffected = db.delete(
                DatabaseHelper.TABLE_PRINTERS,
                "${DatabaseHelper.COLUMN_ID} = ?",
                arrayOf(printerId)
            )
            return rowsAffected > 0
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting printer: ${e.message}")
            return false
        } finally {
            db.close()
        }
    }

    /**
     * Delete all printers from the database
     * @return true if operation was successful, false otherwise
     */
    fun deleteAllPrinters(): Boolean {
        val db = dbHelper.writableDatabase

        try {
            db.delete(DatabaseHelper.TABLE_PRINTERS, null, null)
            Log.d(TAG, "All printers deleted from database")
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting all printers: ${e.message}")
            return false
        } finally {
            db.close()
        }
    }

    /**
     * Get all printers from the database
     * @return List of all printers
     */
    fun getAllPrinters(): List<Printer> {
        val printers = mutableListOf<Printer>()
        val db = dbHelper.readableDatabase

        try {
            val cursor = db.query(
                DatabaseHelper.TABLE_PRINTERS,
                null,
                null,
                null,
                null,
                null,
                null
            )

            if (cursor.moveToFirst()) {
                do {
                    val printer = cursorToPrinter(cursor)
                    printers.add(printer)
                } while (cursor.moveToNext())
            }
            cursor.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all printers: ${e.message}")
        } finally {
            db.close()
        }

        return printers
    }

    /**
     * Get a printer by ID
     * @param printerId The ID of the printer to retrieve
     * @return The printer, or null if not found
     */
    fun getPrinterById(printerId: String): Printer? {
        val db = dbHelper.readableDatabase
        var printer: Printer? = null

        try {
            val cursor = db.query(
                DatabaseHelper.TABLE_PRINTERS,
                null,
                "${DatabaseHelper.COLUMN_ID} = ?",
                arrayOf(printerId),
                null,
                null,
                null
            )

            if (cursor.moveToFirst()) {
                printer = cursorToPrinter(cursor)
            }
            cursor.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error getting printer by ID: ${e.message}")
        } finally {
            db.close()
        }

        return printer
    }

    /**
     * Convert a Printer object to ContentValues for database operations
     */
    private fun createContentValues(printer: Printer): ContentValues {
        val values = ContentValues()

        // Don't set ID here, it's handled separately in insert/update methods
        values.put(DatabaseHelper.COLUMN_NAME, printer.name)
        values.put(DatabaseHelper.COLUMN_DEVICE_NAME, printer.deviceName)
        values.put(DatabaseHelper.COLUMN_DEVICE_ID, printer.deviceId)
        values.put(DatabaseHelper.COLUMN_PRODUCT_ID, printer.productId)
        values.put(DatabaseHelper.COLUMN_VENDOR_ID, printer.vendorId)
        values.put(DatabaseHelper.COLUMN_PRINTER_TYPE, printer.printerType)
        values.put(DatabaseHelper.COLUMN_PRINTER_SIZE, printer.printerSize)
        values.put(DatabaseHelper.COLUMN_IP, printer.ip)
        values.put(DatabaseHelper.COLUMN_PORT, printer.port)
        values.put(DatabaseHelper.COLUMN_ENABLE_RECEIPTS, if (printer.enableReceipts) 1 else 0)
        values.put(DatabaseHelper.COLUMN_ENABLE_KOT, if (printer.enableKOT) 1 else 0)
        values.put(DatabaseHelper.COLUMN_ENABLE_BARCODES, if (printer.enableBarcodes) 1 else 0)
        values.put(DatabaseHelper.COLUMN_PRINTER_WIDTH_MM, printer.printerWidthMM)
        values.put(DatabaseHelper.COLUMN_CHARS_PER_LINE, printer.charsPerLine)
        values.put(DatabaseHelper.COLUMN_KITCHEN_REF, printer.kitchenRef)
        values.put(DatabaseHelper.COLUMN_KITCHEN_IDS, printer.kitchenIds)
        values.put(DatabaseHelper.COLUMN_MODEL, printer.model)
        values.put(DatabaseHelper.COLUMN_NUMBER_OF_PRINTS, printer.numberOfPrints)
        values.put(DatabaseHelper.COLUMN_NUMBER_OF_KOT_PRINTS, printer.numberOfKotPrints)

        return values
    }

    /**
     * Convert a database cursor to a Printer object
     */
    private fun cursorToPrinter(cursor: Cursor): Printer {
        return Printer(
            id = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_ID)),
            name = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_NAME)),
            deviceName = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_DEVICE_NAME)),
            deviceId = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_DEVICE_ID)),
            productId = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PRODUCT_ID)),
            vendorId = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_VENDOR_ID)),
            printerType = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PRINTER_TYPE)),
            printerSize = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PRINTER_SIZE)),
            ip = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_IP)),
            port = cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PORT)),
            enableReceipts = cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_ENABLE_RECEIPTS)) == 1,
            enableKOT = cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_ENABLE_KOT)) == 1,
            enableBarcodes = cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_ENABLE_BARCODES)) == 1,
            printerWidthMM = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PRINTER_WIDTH_MM)),
            charsPerLine = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_CHARS_PER_LINE)),
            kitchenRef = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_KITCHEN_REF)),
            kitchenIds = try {
                cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_KITCHEN_IDS)) ?: ""
            } catch (e: Exception) {
                // Handle case where column might not exist in older database versions
                cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_KITCHEN_REF)) ?: ""
            },
            model = try {
                cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_MODEL)) ?: ""
            } catch (e: Exception) {
                // Handle case where column might not exist in older database versions
                ""
            },
            numberOfPrints = try {
                cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_NUMBER_OF_PRINTS))
            } catch (e: Exception) {
                // Handle case where column might not exist in older database versions
                1 // Default to 1 print
            },
            numberOfKotPrints = try {
                cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_NUMBER_OF_KOT_PRINTS))
            } catch (e: Exception) {
                // Handle case where column might not exist in older database versions
                1 // Default to 1 print
            }
        )
    }
}
