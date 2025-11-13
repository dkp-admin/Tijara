package expo.modules.tijarahzatca

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.tijarahzatca.types.*
import expo.modules.tijarahzatca.service.ZatcaService
import android.util.Log
import com.google.gson.Gson

class ExpoTijarahZatcaModule : Module() {
  private lateinit var zatcaService: ZatcaService

  override fun definition() = ModuleDefinition {
    Name("ExpoTijarahZatca")

    OnCreate {
      zatcaService = ZatcaService(appContext.reactContext ?: throw IllegalStateException("React context not available"))
    }

    AsyncFunction("initializeConfig") { configJson: String ->
      try {
        val gson = Gson()
        val config = gson.fromJson(configJson, Map::class.java)
        val env = config["env"] as String
        val authToken = config["authToken"] as String
        val deviceCode = config["deviceCode"] as String

        zatcaService.initializeConfig(env, authToken, deviceCode)
      } catch (e: Exception) {
        throw Exception("ZATCA_INIT_ERROR: ${e.message}", e)
      }
    }

    AsyncFunction("preProcessZatcaInvoice") {
      orderJson: String,
      companyJson: String,
      locationJson: String,
      deviceJson: String,
      invoiceSequence: Int,
      previousInvoiceHash: String?,
      refund: Boolean ->
      try {

        zatcaService.preProcessZatcaInvoice(
          orderJson,
          companyJson,
          locationJson,
          deviceJson,
          invoiceSequence,
          previousInvoiceHash,
          refund
        )
      } catch (e: Exception) {
        throw Exception("ZATCA_ERROR: ${e.message}", e)
      }
    }

    AsyncFunction("clearPrivateKeyCache") { deviceCode: String? ->
      try {
        zatcaService.clearPrivateKeyCache(deviceCode)
        true
      } catch (e: Exception) {
        throw Exception("ZATCA_ERROR: ${e.message}", e)
      }
    }

    AsyncFunction("testTimezoneConversion") { utcDateTime: String ->
      try {
        zatcaService.testTimezoneConversion(utcDateTime)
      } catch (e: Exception) {
        throw Exception("ZATCA_TEST_ERROR: ${e.message}", e)
      }
    }
  }
}
