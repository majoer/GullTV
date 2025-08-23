set -e

APP_NAME="GullTV"
REMOTE_USER="gulltv"
REMOTE_HOST="192.168.10.195"
REMOTE_DIR="/home/gulltv/gulltv"

echo "Updating OS"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo apt-get update"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo apt-get upgrade -y"

echo "Installing OS dependencies"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo apt-get install -y xdotool wmctrl iptables iptables-persistent"

echo "Install NVM"
ssh ${REMOTE_USER}@${REMOTE_HOST} "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash"

echo "Install nodejs"
ssh ${REMOTE_USER}@${REMOTE_HOST} "source ~/.nvm/nvm.sh; nvm install 24; nvm use 24"

echo "Forward service port to 80"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo iptables -t nat -C PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000 2>/dev/null || sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo iptables -t nat -S"

echo "Setup firewall"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo iptables -C INPUT -i lo -j ACCEPT 2>/dev/null || sudo iptables -A INPUT -i lo -j ACCEPT"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo iptables -C INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo iptables -C INPUT -p tcp --dport 22 -j ACCEPT 2>/dev/null || sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo iptables -C INPUT -p tcp --dport 3000 -j ACCEPT 2>/dev/null || sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo iptables -C INPUT -p tcp --dport 3001 -j ACCEPT 2>/dev/null || sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo iptables -P INPUT DROP"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo iptables -P FORWARD DROP"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo iptables -S"

ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo bash -c 'iptables-save > /etc/iptables/rules.v4'"


