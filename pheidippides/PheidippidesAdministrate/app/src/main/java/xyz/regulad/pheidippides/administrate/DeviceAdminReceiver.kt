package xyz.regulad.pheidippides.administrate

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class DeviceAdminReceiver : DeviceAdminReceiver() {

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Log.d(TAG, "Device Admin Enabled. Intent extras: ${intent.extras}")
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Log.d(TAG, "Device Admin Disabled. Intent extras: ${intent.extras}")
        val reason = intent.getStringExtra(EXTRA_DISABLE_WARNING)
        Log.d(TAG, "Disable reason: $reason")
    }

    override fun onDisableRequested(context: Context, intent: Intent): CharSequence {
        Log.d(TAG, "Device Admin Disable Requested. Intent extras: ${intent.extras}")
        return "Are you sure you want to disable the device admin?"
    }

    override fun onProfileProvisioningComplete(context: Context, intent: Intent) {
        super.onProfileProvisioningComplete(context, intent)
        Log.d(TAG, "Profile Provisioning Complete. Intent extras: ${intent.extras}")
    }

    companion object {
        private const val TAG = "DeviceAdminReceiver"
    }
}
