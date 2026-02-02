---
layout: default
title: Installation
permalink: /projects/simplevoicegeyser/installation/
sidebar: simplevoicegeyser
---

# Installation

This guide explains how to install and set up Simple Voice Geyser on your server.

## Requirements

Before installing, make sure your server has:

- A Bukkit-based server (Paper, Spigot, or similar)
- Simple Voice Chat installed on the server

Simple Voice Geyser will not work without Simple Voice Chat.

## Installation Steps

1. Download the latest version of Simple Voice Geyser from the repository.
   [SimpleVoiceGeyser](https://theodoremeyer.github.io/minecraft/)

2. Place the `.jar` file into your server’s `plugins` folder

3. Start or restart your server

4. Verify that:
    - Simple Voice Chat is running correctly
    - Simple Voice Geyser loads without errors 
    - If the server starts without errors, the plugin is installed.

5. Configure the plugin.

## Joining the Voice Chat from the same device as Server
1. Go to your web browser and enter 127.0.0.1:web server port (default: 8080)

## Joining the Voice Chat from the local network
1. Go to (device ip4 address):(web server port).
   - Device ip4 address usually begins with 192.168.x.xxx
   - web server port default is 8080.

## Joining the Voice Chat from a different network
1. Make Sure the Server has either port-forwarded the server, or uses a tunneler/proxy like playit.gg
    - Only Difference from port forwarding with SVC is that this plugin uses TCP instead of UDP.

2. Get the IP address to join, and join via that.

## Troubleshooting

- Make sure you are running a supported server version
- Check the server console for startup errors
- Confirm that both Geyser and Simple Voice Chat are up to date

If you run into issues, open an issue on the GitHub repository with your server version and logs.

## Notes

This plugin extends Simple Voice Chat. It does not replace it and does not add voice chat by itself.

The Audio (as of 0.0.2-DEV) is not encoded, and the server runs http. I would suggest using a proxy server to create a https
in order to make it secure.
