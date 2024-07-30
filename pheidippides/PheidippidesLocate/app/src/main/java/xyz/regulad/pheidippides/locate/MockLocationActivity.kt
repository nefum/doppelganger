package xyz.regulad.pheidippides.locate

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.location.provider.ProviderProperties
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.provider.Settings
import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonSyntaxException
import io.sentry.Sentry

class MockLocationActivity : Activity() {
    private lateinit var locMgr: LocationManager
    private val deserializer = Gson()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (!checkPermissions()) {
            val exception = SecurityException("Mock location permission not granted")
            Log.e(TAG, exception.message, exception)
            Sentry.captureException(exception)
            finish()
            return
        }

        locMgr = getSystemService(Context.LOCATION_SERVICE) as LocationManager

        val incomingLocationString = intent.getStringExtra("LOCATION_DATA")
        if (incomingLocationString == null) {
            val exception = IllegalArgumentException("No location data provided")
            Log.e(TAG, exception.message, exception)
            Sentry.captureException(exception)
            finish()
            return
        }

        val incomingLocation = try {
            deserializer.fromJson(incomingLocationString, LocationData::class.java)
        } catch (e: JsonSyntaxException) {
            Log.e(TAG, "Failed to parse location data", e)
            Sentry.captureException(e)
            finish()
            return
        }

        Log.d(TAG, "Received location: ${incomingLocation.latitude}, ${incomingLocation.longitude}")

        try {
            addTestProvider()
        } catch (e: SecurityException) {
            Log.e(TAG, "Failed to add test provider", e)
            Sentry.captureException(e)
            finish()
            return
        }

        val newLocation = createMockLocation(incomingLocation)

        // Start or update the foreground service
        val serviceIntent = Intent(this, MockLocationForegroundService::class.java).apply {
            action = MockLocationForegroundService.ACTION_START_SERVICE
            putExtra(MockLocationForegroundService.EXTRA_LOCATION, newLocation)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }

        // Finish the activity after starting the service
        finish()
    }

    private fun checkPermissions(): Boolean {
        return Settings.Secure.getString(contentResolver, Settings.Secure.ALLOW_MOCK_LOCATION) == "1"
    }

    private fun addTestProvider() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            locMgr.addTestProvider(
                MockLocationForegroundService.PROVIDER_NAME,
                false, false, false, false, false, false, false,
                ProviderProperties.POWER_USAGE_LOW,
                ProviderProperties.ACCURACY_FINE
            )
        } else {
            locMgr.addTestProvider(
                MockLocationForegroundService.PROVIDER_NAME,
                false, false, false, false, false, false, false,
                android.location.Criteria.POWER_LOW,
                android.location.Criteria.ACCURACY_FINE
            )
        }
    }

    private fun createMockLocation(incomingLocation: LocationData): Location {
        return Location(MockLocationForegroundService.PROVIDER_NAME).apply {
            latitude = incomingLocation.latitude
            longitude = incomingLocation.longitude
            accuracy = incomingLocation.accuracy.toFloat()
            time = incomingLocation.timestamp.toLong()
            elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
        }
    }

    companion object {
        private const val TAG = "MockLocationActivity"
    }
}
