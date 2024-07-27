package xyz.regulad.pheidippides.notify;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;

public class MainActivity extends Activity {
    private static final String TAG = "MainActivity";
    private static final int NOTIFICATION_LISTENER_SETTINGS_REQUEST_CODE = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Check if the app has notification listener permission
        if (!isNotificationListenerEnabled()) {
            // If not, prompt the user to enable it
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            startActivityForResult(intent, NOTIFICATION_LISTENER_SETTINGS_REQUEST_CODE);
        } else {
            // If yes, start the service
            startNotificationListenerService();
        }

        // Close the activity
        finish();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == NOTIFICATION_LISTENER_SETTINGS_REQUEST_CODE) {
            if (isNotificationListenerEnabled()) {
                startNotificationListenerService();
            } else {
                Log.w(TAG, "Notification Listener permission not granted");
            }
            finish();
        }
    }

    private boolean isNotificationListenerEnabled() {
        String packageName = getPackageName();
        String flat = Settings.Secure.getString(getContentResolver(),
                "enabled_notification_listeners");
        return flat != null && flat.contains(packageName);
    }

    private void startNotificationListenerService() {
        Intent serviceIntent = new Intent(this, NotificationRelayService.class);
        startForegroundService(serviceIntent);
        Log.d(TAG, "NotificationRelayService started");
    }
}
