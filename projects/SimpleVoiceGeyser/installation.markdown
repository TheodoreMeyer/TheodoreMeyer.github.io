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

## Versioning notes
- versions that end in a -DEV/-Dev are testing releasing and not meant for production enviroment.

## Troubleshooting

- Make sure you are running a supported server version
- Check the server console for startup errors
- Confirm that both Geyser and Simple Voice Chat are up to date

If you run into issues, open an issue on the GitHub repository with your server version and logs.

## Notes

This plugin extends Simple Voice Chat. It does not replace it and does not add voice chat by itself.

The Audio (as of 0.0.2-DEV) is not encoded, and the server runs http. I would suggest using a proxy server to create a https
in order to make it secure.
