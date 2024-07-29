package xyz.regulad.pheidippides.locate;

import com.google.gson.annotations.SerializedName;
import lombok.Value;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

@Value
public class LocationData {
    @NotNull
    @SerializedName("latitude")
    Double latitude;

    @NotNull
    @SerializedName("longitude")
    Double longitude;

    @Nullable
    @SerializedName("altitude")
    Double altitude;

    @NotNull
    @SerializedName("accuracy")
    Double accuracy;

    @Nullable
    @SerializedName("altitudeAccuracy")
    Double altitudeAccuracy;

    @Nullable
    @SerializedName("heading")
    Double heading;

    @Nullable
    @SerializedName("speed")
    Double speed;

    @NotNull
    @SerializedName("timestamp")
    Double timestamp;
}
