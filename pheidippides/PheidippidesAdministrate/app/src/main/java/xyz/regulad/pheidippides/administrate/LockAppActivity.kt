package xyz.regulad.pheidippides.administrate

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Bundle
import android.util.Log
import io.sentry.Sentry

class LockAppActivity : Activity() {

    private lateinit var devicePolicyManager: DevicePolicyManager
    private lateinit var componentName: ComponentName

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            devicePolicyManager = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            componentName = ComponentName(this, DeviceAdminReceiver::class.java)

            val packageToLock = intent.data?.schemeSpecificPart

            if (packageToLock != null && devicePolicyManager.isAdminActive(componentName)) {
                lockApp(packageToLock)
            } else {
                Log.d(TAG, "Prerequisites not met. Admin active: ${devicePolicyManager.isAdminActive(componentName)}, Package to lock: $packageToLock")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in LockAppActivity", e)
            Sentry.captureException(e)
        } finally {
            finish()
        }
    }

    private fun lockApp(packageName: String) {
        try {
            devicePolicyManager.setUninstallBlocked(componentName, packageName, true)
            Log.d(TAG, "Locked app: $packageName")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to lock app: $packageName", e)
            Sentry.captureException(e)
        }
    }

    companion object {
        private const val TAG = "LockAppActivity"
    }
}
