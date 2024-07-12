#!/bin/sh

# Define the submodule path
SUBMODULE_PATH="src/noVNC"

# Remove the submodule entry from .gitmodules
echo "Removing submodule entry from .gitmodules..."
git config -f .gitmodules --remove-section submodule.$SUBMODULE_PATH

# Remove the submodule entry from .git/config
echo "Removing submodule entry from .git/config..."
git config -f .git/config --remove-section submodule.$SUBMODULE_PATH

# Remove the submodule directory from the working directory and the staging area
echo "Removing submodule directory..."
git rm -rf $SUBMODULE_PATH

# Remove the submodule metadata from .git/modules
echo "Removing submodule metadata..."
rm -rf .git/modules/$SUBMODULE_PATH

# Commit the changes
echo "Committing the changes..."
git add .gitmodules
git commit -m "Remove submodule $SUBMODULE_PATH"

echo "Submodule $SUBMODULE_PATH has been removed successfully."
