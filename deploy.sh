set -e

APP_NAME="Matsflix"
REMOTE_USER="matsj"
REMOTE_HOST="192.168.10.191"
REMOTE_DIR="/home/matsj/matsflix"

echo "Stopping service..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user stop ${APP_NAME}" || true

echo "Syncing files..."
rsync -az --delete ./dist ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}
rsync -az --delete ./package.json ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}
rsync -az --delete ./package-lock.json ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}
rsync -az --delete --chmod=744 ./nvm-start.sh ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}

echo "Updating Matsflix service .."
rsync -az --delete ./Matsflix.service ${REMOTE_USER}@${REMOTE_HOST}:/tmp/${APP_NAME}.service
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo mv /tmp/${APP_NAME}.service /etc/systemd/user/"
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user daemon-reload"

echo "Installing dependencies..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR}; source ~/.nvm/nvm.sh; npm i -g npm; npm install"

echo "Starting Matsflix service..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user restart ${APP_NAME}"

ssh ${REMOTE_USER}@${REMOTE_HOST} "journalctl --user-unit ${APP_NAME}.service -f"