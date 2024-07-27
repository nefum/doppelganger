#!/bin/bash

# Set variables
DOWNLOAD_URL="https://nightly.link/nefum/pheidippides-notify/workflows/android/master/apk.zip"
TEMP_DIR=$(mktemp -d)
DESTINATION_DIR="./android"
DESTINATION_FILE="$DESTINATION_DIR/PheidippidesNotify.apk"

# Create destination directory if it doesn't exist
mkdir -p "$DESTINATION_DIR"

# Download the zip file
echo "Downloading apk.zip..."
if ! curl -L "$DOWNLOAD_URL" -o "$TEMP_DIR/apk.zip"; then
    echo "Failed to download the file. Please check your internet connection and try again."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Unzip the file
echo "Extracting apk.zip..."
if ! unzip -q "$TEMP_DIR/apk.zip" -d "$TEMP_DIR"; then
    echo "Failed to extract the zip file. It might be corrupted."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Copy the desired APK file
echo "Copying app-debug.apk to $DESTINATION_FILE..."
if ! cp -f "$TEMP_DIR/debug/app-debug.apk" "$DESTINATION_FILE"; then
    echo "Failed to copy the APK file to the destination."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Clean up
rm -rf "$TEMP_DIR"

echo "Successfully downloaded and placed PheidippidesNotify.apk in $DESTINATION_FILE"
