package xyz.regulad.pheidippides.locate

import android.app.*
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import io.sentry.Sentry
import kotlinx.coroutines.*

class MockLocationForegroundService : Service() {
    private lateinit var locMgr: LocationManager
    private var serviceJob: Job? = null
    private var currentLocation: Location? = null

    override fun onCreate() {
        super.onCreate()
        locMgr = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_SERVICE -> {
                val location = intent.getParcelableExtra<Location>(EXTRA_LOCATION)
                if (location != null) {
                    currentLocation = location
                    Log.d(TAG, "Service started with initial location: ${location.latitude}, ${location.longitude}")
                    startMockLocationUpdates()
                } else {
                    Log.e(TAG, "No location provided to start service")
                    Sentry.captureMessage("No location provided to start service")
                    stopSelf()
                }
            }
            ACTION_UPDATE_LOCATION -> {
                val newLocation = intent.getParcelableExtra<Location>(EXTRA_LOCATION)
                if (newLocation != null) {
                    currentLocation = newLocation
                    Log.d(TAG, "Location updated: ${newLocation.latitude}, ${newLocation.longitude}")
                } else {
                    Log.e(TAG, "No location provided for update")
                    Sentry.captureMessage("No location provided for update")
                }
            }
            ACTION_STOP_SERVICE -> stopSelf()
        }
        return START_STICKY
    }

    private fun startMockLocationUpdates() {
        serviceJob = CoroutineScope(Dispatchers.Default).launch {
            while (isActive) {
                currentLocation?.let { location ->
                    try {
                        locMgr.setTestProviderLocation(PROVIDER_NAME, location)
                        Log.d(TAG, "Mock location set: ${location.latitude}, ${location.longitude}")
                    } catch (e: SecurityException) {
                        Log.e(TAG, "Failed to set mock location", e)
                        Sentry.captureException(e)
                        stopSelf()
                    }
                }
                delay(UPDATE_INTERVAL)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceJob?.cancel()
        try {
            locMgr.removeTestProvider(PROVIDER_NAME)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to remove test provider", e)
            Sentry.captureException(e)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Mock Location Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Mock Location Active")
            .setContentText("Providing mock location data")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .build()
    }

    companion object {
        private const val TAG = "MockLocationService"
        private const val CHANNEL_ID = "MockLocationChannel"
        private const val NOTIFICATION_ID = 1
        private const val UPDATE_INTERVAL = 1000L // 1 second
        const val PROVIDER_NAME = LocationManager.GPS_PROVIDER

        const val ACTION_START_SERVICE = "START_SERVICE"
        const val ACTION_UPDATE_LOCATION = "UPDATE_LOCATION"
        const val ACTION_STOP_SERVICE = "STOP_SERVICE"
        const val EXTRA_LOCATION = "EXTRA_LOCATION"
    }
}
