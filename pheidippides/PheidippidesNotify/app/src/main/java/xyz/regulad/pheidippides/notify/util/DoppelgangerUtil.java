package xyz.regulad.pheidippides.notify.util;

import org.jetbrains.annotations.NotNull;

public class DoppelgangerUtil {
    public static final @NotNull String CUSTOM_HEADER_NAME = "X-Doppelganger-Secret";
    public static @NotNull String DOPPELGANGER_ORIGIN;
    public static @NotNull String DOPPELGANGER_SECRET;
    public static @NotNull String DOPPELGANGER_DEVICE_ID;

    static {
        DOPPELGANGER_ORIGIN = SystemPropertyHelper.getSystemProperty("ro.doppelganger.origin", "https://doppelgangerhq.com");
        DOPPELGANGER_SECRET = SystemPropertyHelper.getSystemProperty("ro.doppelganger.secret", "badCanary");
        DOPPELGANGER_DEVICE_ID = SystemPropertyHelper.getSystemProperty("ro.doppelganger.device", "badCanary");

        if (DOPPELGANGER_SECRET.equals("badCanary") || DOPPELGANGER_DEVICE_ID.equals("badCanary")) {
            throw new IllegalStateException("System properties not set");
        }
    }
}
