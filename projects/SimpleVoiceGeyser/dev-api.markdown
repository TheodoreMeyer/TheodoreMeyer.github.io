---
layout: projects
title: API
permalink: /projects/simplevoicegeyser/api/
sidebar: simplevoicegeyser
---
# API
This plugin/addon to SVG is not planning (currently) to have a large API. Instead, developers will be expected to connect over websocket to the server, via the server's configured address.

This is due to the fact I built this as a websocket-based plugin, where anyone with the correct password/information can connect with any client to the websocket.

## To Be added
- Connection types, so server admins can limit how you can connect.
- More Websocket support for diverse client types (whether an app, or an HTML page that is in the server website itself, etc. myserver.com/svg).