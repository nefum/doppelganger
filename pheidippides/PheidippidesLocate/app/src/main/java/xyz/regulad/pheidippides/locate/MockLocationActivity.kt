package xyz.regulad.pheidippides.locate

import android.app.Activity
import android.content.Context
import android.location.Location
import android.location.LocationManager
import android.location.provider.ProviderProperties
import android.os.Build
import android.os.Bundle
import com.google.gson.Gson
import com.google.gson.JsonSyntaxException

class MockLocationActivity : Activity() {
    private lateinit var locMgr: LocationManager
    private val providerName = LocationManager.GPS_PROVIDER

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        locMgr = getSystemService(Context.LOCATION_SERVICE) as LocationManager

        val incomingLocationString = intent.getStringExtra("LOCATION_DATA") ?: return finish()

        val incomingLocation = try {
            Gson().fromJson(incomingLocationString, LocationData::class.java);
        } catch (e: JsonSyntaxException) {
            return finish();
        }

        // lazily add the test provider if it doesn't exist
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            locMgr.addTestProvider(
                providerName,
                false,
                false,
                false,
                false,
                false, // cannot always be guaranteed
                false, // cannot always be guaranteed
                false, // cannot always be guaranteed
                ProviderProperties.POWER_USAGE_LOW,
                ProviderProperties.ACCURACY_FINE
            )
        } else {
            locMgr.addTestProvider(
                providerName,
                false,
                false,
                false,
                false,
                false, // cannot always be guaranteed
                false, // cannot always be guaranteed
                false, // cannot always be guaranteed
                android.location.Criteria.POWER_LOW,
                android.location.Criteria.ACCURACY_FINE
            )
        }

        val newLocation = Location(LocationManager.GPS_PROVIDER)

        newLocation.latitude = incomingLocation.latitude;
        newLocation.longitude = incomingLocation.longitude;
        newLocation.accuracy = incomingLocation.accuracy.toFloat(); // shave some precision

        newLocation.time = incomingLocation.timestamp.toLong()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            newLocation.elapsedRealtimeNanos = incomingLocation.timestamp.toLong()
        }

        // no harm in updating the provider if it's already enabled
        locMgr.setTestProviderEnabled(providerName, true)

        locMgr.setTestProviderLocation(providerName, newLocation)

        // Finish the activity after setting the mock location
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            locMgr.removeTestProvider(LocationManager.GPS_PROVIDER)
        } catch (e: IllegalArgumentException) {
            // Provider doesn't exist
        }
    }
}
