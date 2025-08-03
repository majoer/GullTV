#!/bin/bash

STORAGE_HOST="192.168.10.190"

read -s -p "Enter your password: " password

sudo mkdir /mnt/media || true
sudo mount -t cifs //${STORAGE_HOST}/gullstore /mnt/media -o username=mats,password=$password,iocharset=utf8,uid=matsj,gid=matsj,ro


