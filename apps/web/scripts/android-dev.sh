#!/bin/bash

# Define the base directories
SOURCE_BASE_DIR="../../pheidippides"
DEST_BASE_DIR="android"

# Traverse through each directory in the source base directory
for dir in "$SOURCE_BASE_DIR"/*/; do
  # Extract the directory name
  dir_name=$(basename "$dir")

  # Define the source APK path
  source_apk_path="$dir/app/build/outputs/apk/debug/app-debug.apk"

  # Define the destination directory and APK path
  dest_dir="$DEST_BASE_DIR/$dir_name"
  dest_apk_path="$dest_dir/app-debug.apk"

  # Create the destination directory if it doesn't exist
  mkdir -p "$dest_dir"

  # Copy the APK file to the destination directory
  if [ -f "$source_apk_path" ]; then
    cp "$source_apk_path" "$dest_apk_path"
  else
    echo "APK file not found: $source_apk_path"
  fi
done
