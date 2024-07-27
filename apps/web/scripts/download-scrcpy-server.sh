#!/bin/bash

# Set variables
DOWNLOAD_URL="https://nightly.link/regulad/scrcpy/workflows/scrcpy-server/feature%2Fwebsocket-v1.19.x/scrcpy-server.zip"
TEMP_DIR=$(mktemp -d)
DESTINATION_DIR="./scrcpy"
DESTINATION_FILE="$DESTINATION_DIR/scrcpy-server.jar"

# Create destination directory if it doesn't exist
mkdir -p "$DESTINATION_DIR"

# Download the zip file
echo "Downloading scrcpy-server.zip..."
if ! curl -s -L "$DOWNLOAD_URL" -o "$TEMP_DIR/scrcpy-server.zip"; then
    echo "Failed to download the file. Please check your internet connection and try again."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Unzip the file
echo "Extracting scrcpy-server.zip..."
if ! unzip -q "$TEMP_DIR/scrcpy-server.zip" -d "$TEMP_DIR"; then
    echo "Failed to extract the zip file. It might be corrupted."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Copy and rename the server file
echo "Copying server file to $DESTINATION_FILE..."
if ! cp -f "$TEMP_DIR/scrcpy-server" "$DESTINATION_FILE"; then
    echo "Failed to copy the server file to the destination."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Clean up
rm -rf "$TEMP_DIR"

echo "Successfully downloaded and placed scrcpy-server.jar in $DESTINATION_FILE"
