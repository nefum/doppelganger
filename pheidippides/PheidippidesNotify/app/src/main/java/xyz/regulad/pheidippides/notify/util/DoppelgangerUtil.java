package xyz.regulad.pheidippides.notify.util;

import org.jetbrains.annotations.NotNull;

public class DoppelgangerUtil {
    public static final @NotNull String CUSTOM_HEADER_NAME = "X-Doppelganger-Secret";
    public static @NotNull String DOPPELGANGER_ORIGIN;
    public static @NotNull String DOPPELGANGER_SECRET;
    public static @NotNull String DOPPELGANGER_DEVICE_ID;

    static {
        DOPPELGANGER_ORIGIN = SystemPropertyHelper.getSystemProperty("persist.doppelganger.origin", "https://doppelgangerhq.com");

        DOPPELGANGER_SECRET = SystemPropertyHelper.getSystemProperty("persist.doppelganger.secret", "badCanary");

        if (DOPPELGANGER_SECRET.equals("badCanary")) {
            throw new IllegalStateException("Doppelganger secret not set");
        }

        DOPPELGANGER_DEVICE_ID = SystemPropertyHelper.getSystemProperty("persist.doppelganger.device", "badCanary");

        if (DOPPELGANGER_DEVICE_ID.equals("badCanary")) {
            throw new IllegalStateException("Doppelganger device ID not set");
        }
    }
}
