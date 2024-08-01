#!/bin/bash

set -e

# Function to check if running as root
check_root() {
    if [ "$(id -u)" -ne 0 ]; then
        echo "Error: This script must be run as root" >&2
        exit 1
    fi
}

# Function to check if container exists
check_container() {
    local container=$1
    CONTAINER_PID=$(docker inspect --format '{{.State.Pid}}' "$container" 2>/dev/null) || {
        echo "Error: Container not found or not running." >&2
        exit 1
    }
}

# Function to count FDs using bash
count_fds_bash() {
    # shellcheck disable=SC2016
    nsenter -t "$CONTAINER_PID" -m -p bash -c '
        pids=$(find /proc -maxdepth 1 -regex "/proc/[0-9]+" -printf "%P\n")
        for pid in $pids; do
            ls -l /proc/$pid/fd 2>/dev/null | sed "1d" | awk "{print \$11}"
        done | sort -u | wc -l
    ' 2>/dev/null
}

# Function to count FDs using sh
count_fds_sh() {
    # shellcheck disable=SC2016
    nsenter -t "$CONTAINER_PID" -m -p sh -c '
        find /proc -maxdepth 1 -regex "/proc/[0-9]+" -printf "%P\n" | while read pid; do
            ls -l /proc/$pid/fd 2>/dev/null | sed "1d" | awk "{print \$11}"
        done | sort -u | wc -l
    ' 2>/dev/null
}

# Function to count FDs using basic commands
count_fds_basic() {
    nsenter -t "$CONTAINER_PID" -m -p unshare -f --mount-proc bash -c '
        find /proc -maxdepth 1 -regex "/proc/[0-9]+" -printf "%P\n" |
        xargs -I {} find /proc/{}/fd -type l 2>/dev/null |
        xargs readlink 2>/dev/null |
        sort -u | wc -l
    ' 2>/dev/null
}

# Function to get unique FD count for the container
get_unique_fd_count() {
    local unique_fds

    unique_fds=$(count_fds_bash) || unique_fds=""
    if [ -z "$unique_fds" ]; then
        unique_fds=$(count_fds_sh) || unique_fds=""
    fi
    if [ -z "$unique_fds" ]; then
        unique_fds=$(count_fds_basic) || unique_fds=""
    fi

    if [ -z "$unique_fds" ]; then
        echo "Error: Failed to count file descriptors using all available methods." >&2
        exit 1
    fi

    echo "$unique_fds"
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        echo "Usage: $0 <container_name_or_id>" >&2
        exit 1
    fi

    local container=$1

    check_root
    check_container "$container"

    local fd_count
    fd_count=$(get_unique_fd_count)
    echo "$fd_count"
}

# Run main function
main "$@"
