set -e

APP_NAME="GullTV"
REMOTE_USER="gulltv"
REMOTE_HOST="192.168.10.195"
REMOTE_DIR="/home/gulltv/gulltv"

if [ "$1" = "clean" ]; then
  echo "Removing tmp files"
  ssh ${REMOTE_USER}@${REMOTE_HOST} "rm -rf ~/.gulltv/cache" || true
fi

echo "Stopping service..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user stop ${APP_NAME}" || true

echo "Syncing files..."
rsync -az --delete ./dist ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}
rsync -az --delete --chmod=744 ./shell/mount.sh ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}
rsync -az --delete ./.env.production ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/.env
rsync -az --delete ./package.json ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}
rsync -az --delete ./package-lock.json ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}
rsync -az --delete --chmod=744 ./shell/nvm-start.sh ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}

echo "Updating GullTV service .."
rsync -az --delete ./GullTV.service ${REMOTE_USER}@${REMOTE_HOST}:/tmp/${APP_NAME}.service
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo mv /tmp/${APP_NAME}.service /etc/systemd/user/"
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user daemon-reload"
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user enable ${APP_NAME}"

echo "Installing dependencies..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR}; source ~/.nvm/nvm.sh; npm i -g npm; npm install"

echo "Starting GullTV service..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user restart ${APP_NAME}"

ssh ${REMOTE_USER}@${REMOTE_HOST} "journalctl --user-unit ${APP_NAME}.service -f"