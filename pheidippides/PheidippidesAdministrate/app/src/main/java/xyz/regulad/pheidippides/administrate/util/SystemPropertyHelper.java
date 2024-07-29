package xyz.regulad.pheidippides.administrate.util;

import android.annotation.SuppressLint;
import org.jetbrains.annotations.NotNull;

import java.lang.reflect.Method;

public class SystemPropertyHelper {
    public static @NotNull String getSystemProperty(final @NotNull String key, final @NotNull String defaultValue) {
        String value = defaultValue;
        try {
            @SuppressLint("PrivateApi") Class<?> c = Class.forName("android.os.SystemProperties");
            Method get = c.getMethod("get", String.class, String.class);
            value = (String) get.invoke(c, key, defaultValue);
        } catch (Exception e) {
            e.printStackTrace();
        }
        assert value != null;
        return value;
    }
}
