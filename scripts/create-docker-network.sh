#!/bin/bash

docker network create \
  -d bridge \
  --ipv6 \
  doppelganger
