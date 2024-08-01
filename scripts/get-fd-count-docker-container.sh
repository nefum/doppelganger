#!/bin/bash

# Check if a container name/ID was provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <container_name_or_id>"
    exit 1
fi

CONTAINER=$1

# Get the PID of the container
CONTAINER_PID=$(docker inspect --format '{{.State.Pid}}' "$CONTAINER" 2>/dev/null)

# Check if the container exists
if [ -z "$CONTAINER_PID" ]; then
    echo "Container not found or not running."
    exit 1
fi

# Function to get unique FD count for the container
get_unique_fd_count() {
    # shellcheck disable=SC2155
    # shellcheck disable=SC2016
    local unique_fds=$(nsenter -t $CONTAINER_PID -m -p bash -c '
        pids=$(find /proc -maxdepth 1 -regex "/proc/[0-9]+" -printf "%P\n")
        for pid in $pids; do
            ls -l /proc/$pid/fd 2>/dev/null | sed "1d" | awk "{print \$11}"
        done | sort -u | wc -l
    ')
    echo "$unique_fds"
}

# Get and print the unique FD count
UNIQUE_FD_COUNT=$(get_unique_fd_count)
echo "$UNIQUE_FD_COUNT"
