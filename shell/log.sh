set -e

APP_NAME="GullTV"
REMOTE_USER="gulltv"
REMOTE_HOST="192.168.10.195"

ssh ${REMOTE_USER}@${REMOTE_HOST} "journalctl --user-unit ${APP_NAME}.service -f"