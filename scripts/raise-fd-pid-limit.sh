#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if the script is run as root
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" >&2
   exit 1
fi

# Define variables for maximum limits
MAX_FDS=2097152    # Maximum file descriptors
MAX_PIDS=4194304   # Maximum process IDs
MAX_NPROC=65536    # Maximum number of user processes

# Function to set limits temporarily
set_temp_limits() {
    echo "Setting temporary limits..."

    sysctl -w fs.file-max=$MAX_FDS
    sysctl -w kernel.pid_max=$MAX_PIDS
    ulimit -n $MAX_FDS
    ulimit -u $MAX_NPROC

    echo "Temporary limits set successfully."
}

# Function to set limits permanently
set_perm_limits() {
    echo "Setting permanent limits..."

    # Set limits in sysctl.conf
    if grep -q "fs.file-max" /etc/sysctl.conf; then
        sed -i "s/^fs.file-max.*/fs.file-max = $MAX_FDS/" /etc/sysctl.conf
    else
        echo "fs.file-max = $MAX_FDS" >> /etc/sysctl.conf
    fi

    if grep -q "kernel.pid_max" /etc/sysctl.conf; then
        sed -i "s/^kernel.pid_max.*/kernel.pid_max = $MAX_PIDS/" /etc/sysctl.conf
    else
        echo "kernel.pid_max = $MAX_PIDS" >> /etc/sysctl.conf
    fi

    # Set limits in security/limits.conf
    LIMITS_CONF="/etc/security/limits.conf"

    # Remove any existing entries for nofile and nproc
    sed -i '/.*nofile.*/d' $LIMITS_CONF
    sed -i '/.*nproc.*/d' $LIMITS_CONF

    # Add new entries
    cat << EOF >> $LIMITS_CONF
# Limits for non-root users
* soft nofile $MAX_FDS
* hard nofile $MAX_FDS
* soft nproc $MAX_NPROC
* hard nproc $MAX_NPROC
EOF

    # Reload sysctl settings
    sysctl -p

    echo "Permanent limits set successfully."
}

# Main script execution
echo "Starting execution of limit increases..."

set_temp_limits
set_perm_limits

echo "Script execution completed successfully."
echo "Temporary limits are now in effect."
echo "Permanent changes will take full effect after the next system reboot."
echo "Set limits for non-root users:"
echo "  Max File Descriptors: $MAX_FDS"
echo "  Max PIDs: $MAX_PIDS"
echo "  Max User Processes: $MAX_NPROC"
echo "Note: These limits do not apply to the root user, who is not constrained by security/limits.conf settings."
