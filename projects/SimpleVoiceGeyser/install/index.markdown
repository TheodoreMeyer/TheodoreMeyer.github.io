---
layout: projects
title: Installation
permalink: /projects/simplevoicegeyser/install/
sidebar: simplevoicegeyser
---

# Installation

This guide covers installing and configuring Simple Voice Geyser.

---

## Requirements

Before installing, ensure your server has:

- A Bukkit-based server (Paper, Spigot, etc.)
- Simple Voice Chat installed
- GeyserMC installed
- (Optional) Floodgate

> This plugin depends on Simple Voice Chat and will not function without it.

---

## Installation Steps

1. Download the latest release:  
   https://github.com/TheodoreMeyer/SimpleVoice-Geyser/releases

2. Place the `.jar` file into your server’s `plugins/` folder

3. Install dependencies:
   - Simple Voice Chat
   - GeyserMC
   - Optional: Floodgate

4. Start or restart your server

5. Verify startup:
   - No errors in console
   - Plugin loads successfully
   - Voice Chat is functioning

---

## Server Configuration

The plugin is configured via:
```yaml
client:

   # default: 30
   # Timeout in seconds
   # WARNING: Developer Has disabled this for right now.
   vctimeout: 30

   # default: 2
   # idle websocket timeout in minutes
   idletimout: 2

   # default: false
   # Only allow bedrock players to join the chat
   requireBedrock: false

   # default: true
   # Allows for the bedrock client to open a menu just by opening the emotes menu
   # WARNING: Make sure you have off-hand-emote turned off in geyser or there may
   #          be conflict
   useEmoteForSVG: true

server:

   group:

      # Settings for the default group for Svg players.
      default:

         # default: true
         # This decides whether the Svg group is created for players who use the website
         enabled: true

         # default: 1a2b
         # This control's the default groups's password.
         password: 1a2b

   # default: 8080
   # port server will run on.
   port: 8080

   # default: 0.0.0.0
   # Address server binds to, use 127.0.0.1 to only connect from host device.
   # This is suggested to be changed only if you are running a proxy on the same network/device as the server to allow https/wss.
   bind-address: 0.0.0.0

# default: false
# Debug logs
# Do NOT use this in production. This will very quickly fill up your server logs.
Debug: false
```

## Upgrading Version
Some Versions may be incompatible and require manual updates.

See more at [Upgrading Compatibility](https://theodoremeyer.github.io/projects/simplevoicegeyser/upgrading/).

## Versioning notes
- versions that end in a -DEV/-Dev are testing releasing and not meant for production environment.

## Troubleshooting

- Make sure you are running a supported server version
- Check the server console for startup errors
- Confirm that both Geyser and Simple Voice Chat are up to date

If you run into issues, open an issue on the [GitHub repository](https://github.com/TheodoreMeyer/SimpleVoice-Geyser) with your server version and logs.

## Notes
- This plugin extends Simple Voice Chat. It does not replace it and does not add voice chat by itself.

- The Audio (as of 0.0.2-DEV) is not encoded, and the server runs http. I would suggest using a proxy server to create a https in order to make it secure.
