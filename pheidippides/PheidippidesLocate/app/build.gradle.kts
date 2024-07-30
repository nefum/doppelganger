plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")

    id("io.sentry.android.gradle") version "4.10.0"
}

android {
    namespace = "xyz.regulad.pheidippides.locate"
    compileSdk = 34

    defaultConfig {
        applicationId = "xyz.regulad.pheidippides.locate"
        minSdk = 29
        targetSdk = 34
        versionCode = 8
        versionName = "1.9"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.1"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
    lint {
        disable += "WrongConstant" // have to use old constants for API support; they go to the same values
        disable += "MockLocation" // doesn't pickup debug file correctly
    }
}

dependencies {
    implementation("com.google.code.gson:gson:2.11.0")

    implementation("androidx.core:core-ktx:1.10.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.1")
    implementation("androidx.activity:activity-compose:1.7.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}


sentry {
    org.set("nefum")
    projectName.set("pheidippides-locate")

    // this will upload your source code to Sentry to show it as part of the stack traces
    // disable if you don't want to expose your sources
    includeSourceContext.set(true)
}
