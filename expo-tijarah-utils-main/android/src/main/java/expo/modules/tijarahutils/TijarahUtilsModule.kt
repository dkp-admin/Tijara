package expo.modules.tijarahutils

import TimeValidator
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import expo.modules.kotlin.Promise
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.ConnectionResult
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class TijarahUtilsModule : Module() {
  private val context
    get() = requireNotNull(appContext.reactContext)
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('TijarahUtils')` in JavaScript.
    Name("TijarahUtils")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    AsyncFunction("isTimeZoneAutomatic") {promise: Promise->
      // Create instance
      val timeValidator = TimeValidator(context)
      promise.resolve( timeValidator.isTimeZoneAutomatic())

    }

     AsyncFunction("isTimeAutomatic") {promise: Promise->
      // Create instance
      val timeValidator = TimeValidator(context)
      promise.resolve( timeValidator.isTimeAutomatic())

    }

     AsyncFunction("getCurrentTimeZone") {promise: Promise->
      // Create instance
      val timeValidator = TimeValidator(context)
      promise.resolve( timeValidator.getCurrentTimeZone())

    }


    AsyncFunction("isGoogleApiAvailable") { promise: Promise ->
      try {
        // Get an instance of GoogleApiAvailability
        val googleApiAvailability = GoogleApiAvailability.getInstance()
        val status = googleApiAvailability.isGooglePlayServicesAvailable(context)

        // Check if Google Play Services (and by extension, Play Store) is available
        val isPlayStoreAvailable = status == ConnectionResult.SUCCESS

        // Resolve the promise with the result
        promise.resolve(isPlayStoreAvailable)
      } catch (e: Exception) {
        // Reject the promise in case of an error
        promise.reject("CHECK_PLAY_STORE_ERROR", "Error checking Play Store availability", e)
      }
    }



    Function("openTimeSettings") {
      // Create instance
      val timeValidator = TimeValidator(context)
     timeValidator.openTimeSettings()

    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(TijarahUtilsView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: TijarahUtilsView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }
}
