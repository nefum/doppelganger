package xyz.regulad.pheidippides.administrate

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Bundle
import android.util.Log
import io.sentry.Sentry

class ForfeitAdminActivity : Activity() {

    private lateinit var devicePolicyManager: DevicePolicyManager
    private lateinit var componentName: ComponentName

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        devicePolicyManager = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        componentName = ComponentName(this, DeviceAdminReceiver::class.java)

        try {
            if (devicePolicyManager.isAdminActive(componentName)) {
                devicePolicyManager.removeActiveAdmin(componentName)
                Log.d(TAG, "Device admin rights forfeited successfully")
            } else {
                Log.d(TAG, "Attempted to forfeit admin rights, but the receiver is not an admin")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error while attempting to forfeit admin rights", e)
            Sentry.captureException(e)
        } finally {
            finish()
        }
    }

    companion object {
        private const val TAG = "ForfeitAdminActivity"
    }
}
