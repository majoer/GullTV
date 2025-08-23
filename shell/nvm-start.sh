#!/bin/bash

REMOTE_USER="gulltv"
REMOTE_HOST="192.168.10.195"

source /home/$REMOTE_USER/.nvm/nvm.sh
env NODE_ENV=production node /home/$REMOTE_USER/gulltv/dist/server/server.js