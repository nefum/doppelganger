package xyz.regulad.pheidippides.administrate

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Bundle
import android.util.Log
import io.sentry.Sentry

class UnlockAppActivity : Activity() {

    private lateinit var devicePolicyManager: DevicePolicyManager
    private lateinit var componentName: ComponentName

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            devicePolicyManager = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            componentName = ComponentName(this, DeviceAdminReceiver::class.java)

            val packageToUnlock = intent.data?.schemeSpecificPart

            if (packageToUnlock != null && devicePolicyManager.isAdminActive(componentName)) {
                unlockApp(packageToUnlock)
            } else {
                Log.d(TAG, "Prerequisites not met. Admin active: ${devicePolicyManager.isAdminActive(componentName)}, Package to unlock: $packageToUnlock")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in UnlockAppActivity", e)
            Sentry.captureException(e)
        } finally {
            finish()
        }
    }

    private fun unlockApp(packageName: String) {
        try {
            devicePolicyManager.setUninstallBlocked(componentName, packageName, false)
            Log.d(TAG, "Unlocked app: $packageName")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to unlock app: $packageName", e)
            Sentry.captureException(e)
        }
    }

    companion object {
        private const val TAG = "UnlockAppActivity"
    }
}
