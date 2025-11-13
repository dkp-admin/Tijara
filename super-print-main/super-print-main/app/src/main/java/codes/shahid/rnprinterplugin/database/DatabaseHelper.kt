package codes.shahid.rnprinterplugin.database

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.util.Log

class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val TAG = "DatabaseHelper"
        private const val DATABASE_NAME = "printers.db"
        private const val DATABASE_VERSION = 6 // Increment for numberOfKotPrints column

        // Table names
        const val TABLE_PRINTERS = "printers"
        const val TABLE_ACTIVITY_LOGS = "activity_logs"

        // Common column names
        const val COLUMN_ID = "id"
        const val COLUMN_NAME = "name"
        const val COLUMN_DEVICE_NAME = "device_name"
        const val COLUMN_DEVICE_ID = "device_id"
        const val COLUMN_PRODUCT_ID = "product_id"
        const val COLUMN_VENDOR_ID = "vendor_id"
        const val COLUMN_PRINTER_TYPE = "printer_type"
        const val COLUMN_PRINTER_SIZE = "printer_size"
        const val COLUMN_IP = "ip"
        const val COLUMN_PORT = "port"
        const val COLUMN_ENABLE_RECEIPTS = "enable_receipts"
        const val COLUMN_ENABLE_KOT = "enable_kot"
        const val COLUMN_ENABLE_BARCODES = "enable_barcodes"
        const val COLUMN_PRINTER_WIDTH_MM = "printer_width_mm"
        const val COLUMN_CHARS_PER_LINE = "chars_per_line"
        const val COLUMN_KITCHEN_REF = "kitchen_ref"
        const val COLUMN_KITCHEN_IDS = "kitchen_ids"
        const val COLUMN_MODEL = "model"
        const val COLUMN_NUMBER_OF_PRINTS = "number_of_prints"
        const val COLUMN_NUMBER_OF_KOT_PRINTS = "number_of_kot_prints"

        // Activity logs table columns
        const val COLUMN_JOB_ID = "job_id"
        const val COLUMN_ORDER_ID = "order_id"
        const val COLUMN_PRINTER_ID = "printer_id"
        const val COLUMN_PRINTER_NAME = "printer_name"
        const val COLUMN_ACTION = "action"
        const val COLUMN_STATUS = "status"
        const val COLUMN_MESSAGE = "message"
        const val COLUMN_ERROR_DETAILS = "error_details"
        const val COLUMN_TIMESTAMP = "timestamp"

        // Create table SQL query for printers
        private const val CREATE_TABLE_PRINTERS = """
            CREATE TABLE $TABLE_PRINTERS (
                $COLUMN_ID TEXT PRIMARY KEY,
                $COLUMN_NAME TEXT,
                $COLUMN_DEVICE_NAME TEXT,
                $COLUMN_DEVICE_ID TEXT,
                $COLUMN_PRODUCT_ID TEXT,
                $COLUMN_VENDOR_ID TEXT,
                $COLUMN_PRINTER_TYPE TEXT,
                $COLUMN_PRINTER_SIZE TEXT,
                $COLUMN_IP TEXT,
                $COLUMN_PORT INTEGER,
                $COLUMN_ENABLE_RECEIPTS INTEGER,
                $COLUMN_ENABLE_KOT INTEGER,
                $COLUMN_ENABLE_BARCODES INTEGER,
                $COLUMN_PRINTER_WIDTH_MM TEXT,
                $COLUMN_CHARS_PER_LINE TEXT,
                $COLUMN_KITCHEN_REF TEXT,
                $COLUMN_KITCHEN_IDS TEXT,
                $COLUMN_MODEL TEXT,
                $COLUMN_NUMBER_OF_PRINTS INTEGER DEFAULT 1,
                $COLUMN_NUMBER_OF_KOT_PRINTS INTEGER DEFAULT 1
            )
        """

        // Create table SQL query for activity logs
        private const val CREATE_TABLE_ACTIVITY_LOGS = """
            CREATE TABLE $TABLE_ACTIVITY_LOGS (
                $COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $COLUMN_JOB_ID TEXT,
                $COLUMN_ORDER_ID TEXT,
                $COLUMN_PRINTER_ID TEXT,
                $COLUMN_PRINTER_NAME TEXT,
                $COLUMN_ACTION TEXT,
                $COLUMN_STATUS TEXT,
                $COLUMN_MESSAGE TEXT,
                $COLUMN_ERROR_DETAILS TEXT,
                $COLUMN_TIMESTAMP TEXT
            )
        """
    }

    override fun onCreate(db: SQLiteDatabase) {
        // Create tables
        db.execSQL(CREATE_TABLE_PRINTERS)
        db.execSQL(CREATE_TABLE_ACTIVITY_LOGS)
        Log.d(TAG, "Database tables created")
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        if (oldVersion < 2) {
            // Add model column to existing table
            try {
                db.execSQL("ALTER TABLE $TABLE_PRINTERS ADD COLUMN $COLUMN_MODEL TEXT DEFAULT ''")
                Log.d(TAG, "Added model column to printers table")
            } catch (e: Exception) {
                Log.e(TAG, "Error adding model column: ${e.message}")

                // If altering table fails, recreate it
                db.execSQL("DROP TABLE IF EXISTS $TABLE_PRINTERS")
                onCreate(db)
            }
        }

        if (oldVersion < 3) {
            // Add kitchen_ids column and copy values from kitchen_ref
            try {
                db.execSQL("ALTER TABLE $TABLE_PRINTERS ADD COLUMN $COLUMN_KITCHEN_IDS TEXT DEFAULT ''")
                db.execSQL("UPDATE $TABLE_PRINTERS SET $COLUMN_KITCHEN_IDS = $COLUMN_KITCHEN_REF WHERE $COLUMN_KITCHEN_REF IS NOT NULL")
                Log.d(TAG, "Added kitchen_ids column to printers table")
            } catch (e: Exception) {
                Log.e(TAG, "Error adding kitchen_ids column: ${e.message}")
                // If altering table fails, recreate it
                db.execSQL("DROP TABLE IF EXISTS $TABLE_PRINTERS")
                onCreate(db)
            }
        }

        if (oldVersion < 4) {
            // Add number_of_prints column
            try {
                db.execSQL("ALTER TABLE $TABLE_PRINTERS ADD COLUMN $COLUMN_NUMBER_OF_PRINTS INTEGER DEFAULT 1")
                Log.d(TAG, "Added number_of_prints column to printers table")
            } catch (e: Exception) {
                Log.e(TAG, "Error adding number_of_prints column: ${e.message}")
                // If altering table fails, recreate it
                db.execSQL("DROP TABLE IF EXISTS $TABLE_PRINTERS")
                onCreate(db)
            }
        }

        if (oldVersion < 5) {
            // Add activity logs table
            try {
                db.execSQL(CREATE_TABLE_ACTIVITY_LOGS)
                Log.d(TAG, "Created activity_logs table")
            } catch (e: Exception) {
                Log.e(TAG, "Error creating activity_logs table: ${e.message}")
                // If creating table fails, try to recover
                try {
                    // Drop the table if it exists but is malformed
                    db.execSQL("DROP TABLE IF EXISTS $TABLE_ACTIVITY_LOGS")
                    // Try to create it again
                    db.execSQL(CREATE_TABLE_ACTIVITY_LOGS)
                    Log.d(TAG, "Recreated activity_logs table after error")
                } catch (e2: Exception) {
                    Log.e(TAG, "Fatal error recreating activity_logs table: ${e2.message}")
                }
            }
        }

        if (oldVersion < 6) {
            // Add number_of_kot_prints column
            try {
                db.execSQL("ALTER TABLE $TABLE_PRINTERS ADD COLUMN $COLUMN_NUMBER_OF_KOT_PRINTS INTEGER DEFAULT 1")
                Log.d(TAG, "Added number_of_kot_prints column to printers table")
            } catch (e: Exception) {
                Log.e(TAG, "Error adding number_of_kot_prints column: ${e.message}")
                // If altering table fails, recreate it
                try {
                    // Create a backup table
                    db.execSQL("CREATE TABLE printers_backup AS SELECT * FROM $TABLE_PRINTERS")
                    // Drop the original table
                    db.execSQL("DROP TABLE $TABLE_PRINTERS")
                    // Recreate the table with the new schema
                    db.execSQL(CREATE_TABLE_PRINTERS)
                    // Copy data back (existing records will have default value for new column)
                    db.execSQL("INSERT INTO $TABLE_PRINTERS SELECT *, 1 FROM printers_backup")
                    // Drop the backup table
                    db.execSQL("DROP TABLE printers_backup")
                    Log.d(TAG, "Recreated printers table with number_of_kot_prints column")
                } catch (e2: Exception) {
                    Log.e(TAG, "Fatal error recreating printers table: ${e2.message}")
                }
            }
        }
    }
}
