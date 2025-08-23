#!/bin/bash

STORAGE_HOST="192.168.10.190"
USER="gulltv"

read -s -p "Enter your password: " password

sudo mkdir /mnt/gullstore || true
sudo mount -t cifs //${STORAGE_HOST}/gullstore /mnt/gullstore -o username=mats,password=$password,iocharset=utf8,uid=$USER,gid=$USER,ro


