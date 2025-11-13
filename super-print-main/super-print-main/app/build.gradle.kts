plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "codes.shahid.rnprinterplugin"
    compileSdk = 34

    defaultConfig {
        applicationId = "codes.shahid.rnprinterplugin"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        
        // Disable architecture filtering - accept any architecture
        ndk {
            abiFilters.clear()
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }

    packaging {
        resources {
            excludes += "META-INF/INDEX.LIST"
            // Exclude all .so files to avoid architecture mismatch errors
            excludes += "**/*.so"
        }
        
        // Skip checking for CPU architecture compatibility
        jniLibs {
            useLegacyPackaging = true

        }
    }
}

dependencies {
    // AndroidX and UI
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    
    // Navigation Components
    implementation("androidx.navigation:navigation-fragment-ktx:2.7.7")
    implementation("androidx.navigation:navigation-ui-ktx:2.7.7")

    // ZXing for barcode generation
    implementation("com.google.zxing:core:3.5.3")

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

    // Server
    implementation(libs.nanohttpd)

    // Kotlinx Serialization
    implementation(libs.kotlinx.serialization.json)

    // Utility libraries
    implementation(libs.gson)
    implementation(libs.support.annotations)
    // TODO: Update with correct repository URLs or local module paths
    // implementation(libs.core)
    // implementation(libs.printerlibrary)

    // Sunmi SDK
    implementation("com.sunmi:printerlibrary:1.0.13")

    // Local JARs/AARs
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar", "*.aar"))))
}
