import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import java.time.ZoneId
import java.util.TimeZone
import java.util.concurrent.TimeUnit

public class TimeValidator(
    private val context: Context,
    private val requiredTimeZone: String = "Asia/Kolkata" // Default timezone, can be changed
) {
    sealed class TimeValidationResult {
        object Valid : TimeValidationResult()
        data class Invalid(
            val isAutoTimeEnabled: Boolean,
            val isAutoTimeZoneEnabled: Boolean,
            val isCorrectTimeZone: Boolean,
            val currentTimeZone: String
        ) : TimeValidationResult()
    }

    /**
     * Validates all time-related settings
     * @return TimeValidationResult indicating the validation status
     */
    fun validateTimeSettings(): TimeValidationResult {
        val isAutoTime = isTimeAutomatic()
        val isAutoTimeZone = isTimeZoneAutomatic()
        val isCorrectZone = isTimeZoneValid()

        return if (isAutoTime && isCorrectZone) {
            TimeValidationResult.Valid
        } else {
            TimeValidationResult.Invalid(
                isAutoTimeEnabled = isAutoTime,
                isAutoTimeZoneEnabled = isAutoTimeZone,
                isCorrectTimeZone = isCorrectZone,
                currentTimeZone = getCurrentTimeZone()
            )
        }
    }

    /**
     * Checks if automatic time setting is enabled
     */
    fun isTimeAutomatic(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.AUTO_TIME,
                0
            ) == 1
        } else {
            @Suppress("DEPRECATION")
            Settings.System.getInt(
                context.contentResolver,
                Settings.System.AUTO_TIME,
                0
            ) == 1
        }
    }

    /**
     * Checks if automatic timezone setting is enabled
     */
     fun isTimeZoneAutomatic(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.AUTO_TIME_ZONE,
                0
            ) == 1
        } else {
            @Suppress("DEPRECATION")
            Settings.System.getInt(
                context.contentResolver,
                Settings.System.AUTO_TIME_ZONE,
                0
            ) == 1
        }
    }

    /**
     * Validates if the current timezone matches the required timezone
     */
    private fun isTimeZoneValid(): Boolean {
        return getCurrentTimeZone() == requiredTimeZone
    }

    /**
     * Gets the current timezone ID
     */
    fun getCurrentTimeZone(): String {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ZoneId.systemDefault().id
        } else {
            TimeZone.getDefault().id
        }
    }

    /**
     * Checks if the time drift is within acceptable limits
     * @param networkTime The reference time from a network source
     * @param maxDriftMinutes Maximum acceptable drift in minutes
     */
    fun isTimeDriftAcceptable(
        networkTime: Long,
        maxDriftMinutes: Long = 5
    ): Boolean {
        val deviceTime = System.currentTimeMillis()
        val drift = kotlin.math.abs(deviceTime - networkTime)
        return drift < TimeUnit.MINUTES.toMillis(maxDriftMinutes)
    }

    /**
     * Opens system date & time settings
     */
    fun openTimeSettings() {
        val intent = Intent(Settings.ACTION_DATE_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    companion object {
        const val TAG = "TimeValidator"
    }
}