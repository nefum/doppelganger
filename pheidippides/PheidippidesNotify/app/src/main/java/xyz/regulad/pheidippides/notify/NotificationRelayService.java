package xyz.regulad.pheidippides.notify;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.Icon;
import android.os.Bundle;
import android.os.IBinder;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Base64;
import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import androidx.core.app.NotificationCompat;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import xyz.regulad.pheidippides.notify.util.DoppelgangerUtil;

import static xyz.regulad.pheidippides.notify.util.DoppelgangerUtil.CUSTOM_HEADER_NAME;
import static xyz.regulad.pheidippides.notify.util.DoppelgangerUtil.DOPPELGANGER_SECRET;

public class NotificationRelayService extends NotificationListenerService {
    private static final String CHANNEL_ID = "NotificationListenerChannel";
    private static final int NOTIFICATION_ID = 1;

    private static final @NotNull String TAG = "NotificationRelayService";
    public static final Gson SERIALIZER = new Gson();
    private final @NotNull String ENDPOINT_URL = DoppelgangerUtil.DOPPELGANGER_ORIGIN + String.format("/api/devices/%s/notification", DoppelgangerUtil.DOPPELGANGER_DEVICE_ID);

    private OkHttpClient client;

    @Override
    public void onCreate() {
        super.onCreate();
        // Initialize OkHttpClient with a timeout
        client = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, createNotification());
    }

    private void createNotificationChannel() {
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID,
                "Pheidippides Notification Listener",
                NotificationManager.IMPORTANCE_LOW);
        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.createNotificationChannel(channel);
    }

    private Notification createNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Pheidippides Notification Listener")
                .setContentText("Listening for notifications")
                .setPriority(NotificationCompat.PRIORITY_LOW);

        return builder.build();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return super.onBind(intent);
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        // This method is called whenever a notification is posted
        Log.d(TAG, "Notification received");

        // Build a JsonableNotification object
        final @NotNull NotificationRelayService.JsonableNotification jsonableNotification = buildJsonableNotification(sbn);

        // use Gson to convert the JsonableNotification object to a JSON string
        final @NotNull String json = SERIALIZER.toJson(jsonableNotification);

        // Create request body
        final @NotNull RequestBody body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json);

        // Build the request with custom header
        final @NotNull Request request = new Request.Builder()
                .url(ENDPOINT_URL)
                .addHeader(CUSTOM_HEADER_NAME, DOPPELGANGER_SECRET)
                .post(body)
                .build();

        // Send the request asynchronously
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NotNull Call call, @NotNull IOException e) {
                Log.e(TAG, "Request failed: " + e.getMessage());
            }

            @Override
            public void onResponse(@NotNull Call call, @NotNull Response response) throws IOException {
                if (response.isSuccessful()) {
                    Log.d(TAG, "Request successful: " + response.body().string());
                } else {
                    Log.e(TAG, "Request not successful: " + response.code());
                }
            }
        });
    }

    private String getApplicationName(String packageName) {
        try {
            return getPackageManager().getApplicationLabel(
                    getPackageManager().getApplicationInfo(packageName, 0)).toString();
        } catch (Exception e) {
            return packageName;
        }
    }

    @RequiredArgsConstructor
    private static class JsonableNotification {
        private final @NotNull String packageName;
        private final @NotNull String appName;
        private final long postTimeUnixMillis;
        private final @Nullable String title;
        private final @Nullable String text;
        private final @Nullable String subText;
        private final @Nullable String summaryText;
        private final @Nullable String bigText;
        private final @NotNull String[] textLines;
        private final @Nullable String category;
        private final int priority;
        private final int actionCount;
        private final @Nullable String appIconDataUrl;
        private final @Nullable String smallIconDataUrl;
        private final @Nullable String largeIconDataUrl;
    }

    private NotificationRelayService.JsonableNotification buildJsonableNotification(final @NotNull StatusBarNotification sbn) {
        final @NotNull Notification notification = sbn.getNotification();
        final @NotNull Bundle extras = notification.extras;

        // Basic information
        final @NotNull String packageName = sbn.getPackageName();
        final @NotNull String appName = getApplicationName(packageName);
        final long postTime = sbn.getPostTime(); // unix millis

        // Notification content
        final @Nullable CharSequence title = extras.getCharSequence(Notification.EXTRA_TITLE);
        final @Nullable CharSequence text = extras.getCharSequence(Notification.EXTRA_TEXT);
        final @Nullable CharSequence subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT);
        final @Nullable CharSequence summaryText = extras.getCharSequence(Notification.EXTRA_SUMMARY_TEXT);

        // Additional text (like expanded notification text)
        final @Nullable CharSequence bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
        final @NotNull CharSequence[] textLines = extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES);

        // Category and priority
        @NotNull String category = notification.category;
        int priority = notification.priority;

        // Actions
        int actionCount = notification.actions != null ? notification.actions.length : 0;

        // Icon and images
        final @Nullable Icon smallIcon = notification.getSmallIcon();
        final @Nullable Drawable smallIconDrawable = smallIcon != null ? smallIcon.loadDrawable(this) : null;
        final @Nullable Icon largeIcon = notification.getLargeIcon();
        final @Nullable Drawable largeIconDrawable = largeIcon != null ? largeIcon.loadDrawable(this) : null;
        final @Nullable Drawable appIconDrawable = getIconOfPackageName(packageName);

        final @Nullable String appIconDataUrl = appIconDrawable != null ? drawableToDataUrl(appIconDrawable) : null;
        final @Nullable String smallIconDataUrl = smallIconDrawable != null ? drawableToDataUrl(smallIconDrawable) : null;
        final @Nullable String largeIconDataUrl = largeIconDrawable != null ? drawableToDataUrl(largeIconDrawable) : null;

        final @NotNull NotificationRelayService.JsonableNotification jsonableNotification = new NotificationRelayService.JsonableNotification(
                packageName,
                appName,
                postTime,
                title != null ? title.toString() : null,
                text != null ? text.toString() : null,
                subText != null ? subText.toString() : null,
                summaryText != null ? summaryText.toString() : null,
                bigText != null ? bigText.toString() : null,
                textLines != null ? new String[textLines.length] : new String[0],
                category,
                priority,
                actionCount,
                appIconDataUrl,
                smallIconDataUrl,
                largeIconDataUrl
        );
        if (textLines != null) {
            for (int i = 0; i < textLines.length; i++) {
                jsonableNotification.textLines[i] = textLines[i].toString();
            }
        }
        return jsonableNotification;
    }

    public @Nullable Drawable getIconOfPackageName(final @NotNull String packageName) {
        try {
            return getPackageManager().getApplicationIcon(packageName);
        } catch (PackageManager.NameNotFoundException e) {
            return null;
        }
    }

    /**
     * Convert an Android Drawable to a data URL.
     *
     * @param drawable the Drawable to convert
     * @return a data URL representing the Drawable as a PNG image
     */
    public static @NotNull String drawableToDataUrl(@NotNull Drawable drawable) {
        @NotNull Bitmap bitmap;
        if (drawable instanceof BitmapDrawable) {
            bitmap = ((BitmapDrawable) drawable).getBitmap();
        } else {
            // Handle non-bitmap drawables
            bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
            android.graphics.Canvas canvas = new android.graphics.Canvas(bitmap);
            drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            drawable.draw(canvas);
        }

        return bitmapToDataUrl(bitmap);
    }

    /**
     * Convert a Bitmap to a data URL.
     *
     * @param bitmap the Bitmap to convert
     * @return a data URL representing the Bitmap as a PNG image
     */
    public static @NotNull String bitmapToDataUrl(@NotNull Bitmap bitmap) {
        final @NotNull ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
        final byte[] byteArray = byteArrayOutputStream.toByteArray();
        final @NotNull String base64 = Base64.encodeToString(byteArray, Base64.NO_WRAP);

        return "data:image/png;base64," + base64;
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // This method is called whenever a notification is removed
        // You can add logic here if needed
    }
}
