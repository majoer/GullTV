# GullTV

GullTV is a smart TV replacement that allows any device on your home network to control your TV through a web-interface.
It runs on a linux device of your choice, just hook it up to your TV and home network.

## GullTV Apps

#### Matsflix

A remote-control for VLC

Features:

- Browse/search your media folder
- Automatically launch VLC and play any file accessible on your LAN
- Media controls (play, pause, resume, next, prev, volume, subtitles, audio-track)

#### NoobTube

A remote-control for youtube

Features:

- Search youtube videos
- Automatically launch Firefox and play any youtube video
- Media controls (play, pause, resume, next, prev, volume)

## Prerequisites

- A media folder acceessible to the service (can be a network drive)
- X11 window manager
- A youtube search API key (configured in google cloud console)

## Try it out / Develop

```bash
# Clone repo
git clone https://github.com/majoer/GullTV.git

# Install dependencies
cd GullTV
npm install

# Launch dev mode
npm run dev
```

## How to install on a device?

You have two options:

#### Install GullTV remotely over SSH from another machine

The easiest way to install GullTV is over SSH. This way you don't need a keyboard/mouse for your TV-device and you can deploy new versions fast.

First add a ssh-key to the known_hosts of your TV-device.
Next run these scripts from another computer to configure the TV-device and install the GullTV service onto it:

```bash
#Install node dependencies
npm install

# Prepare a device for GullTV (installs OS dependencies and configures the firewall. Assumes a Raspberry PI 5)
npm run setup

# Deploy GullTV, run this every time you want to update the remote device
npm run deploy
```

#### Install GullTV directly on the device

You can clone the repo onto your TV-device, but it is more work to set up correctly.

```bash
# Install node dependencies
npm install

# Install the OS dependencies
#TODO

# Build the project
npm run build

# Start the service (you should also set up a a process manager)
npm run start

```

## Useful docs

- https://github.com/videolan/vlc/blob/master/share/lua/http/requests/README.txt
