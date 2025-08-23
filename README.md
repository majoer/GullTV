# Matsflix

A VLC Remote-control as a website.

Matsflix is a service you can run on a small TV-computer. It's been tested on a Raspberry Pi 5.

## How it works

It runs a website you can access on your LAN. From the website, everyone in your home can remote-control VLC.

## Prerequisites

- A media folder acceessible to the service (can be a network drive)
- X11 window manager
  - `sudo raspi-config`

## Useful docs

- https://github.com/videolan/vlc/blob/master/share/lua/http/requests/README.txt
