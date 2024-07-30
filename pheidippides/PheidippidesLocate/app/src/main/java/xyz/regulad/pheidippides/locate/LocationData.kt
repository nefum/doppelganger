package xyz.regulad.pheidippides.locate

import com.google.gson.annotations.SerializedName

data class LocationData(
    @SerializedName("latitude")
    val latitude: Double,

    @SerializedName("longitude")
    val longitude: Double,

    @SerializedName("altitude")
    val altitude: Double?,

    @SerializedName("accuracy")
    val accuracy: Double,

    @SerializedName("altitudeAccuracy")
    val altitudeAccuracy: Double?,

    @SerializedName("heading")
    val heading: Double?,

    @SerializedName("speed")
    val speed: Double?,

    @SerializedName("timestamp")
    val timestamp: Double
)
