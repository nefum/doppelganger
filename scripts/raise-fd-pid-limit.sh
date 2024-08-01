#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define variables for maximum limits
MAX_FDS=2097152    # Maximum file descriptors
MAX_PIDS=4194304   # Maximum process IDs

# Function to check if script is run as root
check_root() {
    if [ "$(id -u)" != "0" ]; then
        echo "This script must be run as root" >&2
        exit 1
    fi
}

# Function to set system-wide limits
set_system_limits() {
    echo "Setting temporary system-wide limits..."

    if ! sysctl -w fs.file-max=$MAX_FDS; then
        echo "Failed to set fs.file-max" >&2
        return 1
    fi

    if ! sysctl -w kernel.pid_max=$MAX_PIDS; then
        echo "Failed to set kernel.pid_max" >&2
        return 1
    fi

    echo "Temporary system-wide limits set successfully."
    return 0
}

# Function to set permanent limits
set_perm_limits() {
    echo "Setting permanent limits..."

    local SYSCTL_CONF="/etc/sysctl.conf"

    # Update fs.file-max
    if grep -q "^fs.file-max" $SYSCTL_CONF; then
        sed -i "s/^fs.file-max.*$/fs.file-max = $MAX_FDS/" $SYSCTL_CONF
    else
        echo "fs.file-max = $MAX_FDS" >> $SYSCTL_CONF
    fi

    # Update kernel.pid_max
    if grep -q "^kernel.pid_max" $SYSCTL_CONF; then
        sed -i "s/^kernel.pid_max.*$/kernel.pid_max = $MAX_PIDS/" $SYSCTL_CONF
    else
        echo "kernel.pid_max = $MAX_PIDS" >> $SYSCTL_CONF
    fi

    echo "Permanent limits set in $SYSCTL_CONF."
    echo "Reloading sysctl settings..."

    if ! sysctl -p; then
        echo "Failed to reload sysctl settings" >&2
        return 1
    fi

    echo "Permanent limits set and applied successfully."
    return 0
}

# Main function
main() {
    check_root

    echo "Starting system limits configuration..."

    if set_system_limits && set_perm_limits; then
        echo "System-wide limits have been set successfully:"
        echo "  Max File Descriptors: $MAX_FDS"
        echo "  Max PIDs: $MAX_PIDS"
        echo "Note: Some changes may require a system reboot to take full effect."
    else
        echo "Failed to set system limits. Check the output above for details." >&2
        exit 1
    fi
}

# Call main function
main
