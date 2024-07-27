#!/bin/bash

# Set variables
DOWNLOAD_URL="https://f-droid.org/F-Droid.apk"
DESTINATION_DIR="./android"
DESTINATION_FILE="$DESTINATION_DIR/F-Droid.apk"

# Create destination directory if it doesn't exist
mkdir -p "$DESTINATION_DIR"

# Download the APK file
echo "Downloading F-Droid.apk..."
if ! curl -s -L "$DOWNLOAD_URL" -o "$DESTINATION_FILE"; then
    echo "Failed to download the file. Please check your internet connection and try again."
    exit 1
fi

echo "Successfully downloaded and placed F-Droid.apk in $DESTINATION_FILE"
