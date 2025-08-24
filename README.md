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

It can be run on a small TV-computer and has been tested on a Raspberry Pi 5.

- A media folder acceessible to the service (can be a network drive)
- X11 window manager
- A youtube search API key (configured in google cloud console)

## How to install?

The easiest way to install GullTV is over SSH.
First add a ssh-key to the known_hosts of your TV-device.
Next run these scripts to configure the TV-device and install the GullTV service onto it:

```bash
#
npm install

# Prepare a device for GullTV
npm run setup

# Deploy GullTV, run this every time you want to update the remote device
npm run deploy
```

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

## Useful docs

- https://github.com/videolan/vlc/blob/master/share/lua/http/requests/README.txt
