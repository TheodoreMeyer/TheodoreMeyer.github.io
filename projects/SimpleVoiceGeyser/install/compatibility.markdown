---
layout: projects
title: Compatibility
permalink: /projects/simplevoicegeyser/install/compatibility/
sidebar: simplevoicegeyser
---

# Compatibility

This page outlines supported environments and known limitations.

---

## Browser Compatibility

| Version   | Chrome | Firefox | Edge |
|-----------|--------|---------|------|
| 0.0.1-DEV | ✅      | ❌       | ❌    |
| 0.0.2-DEV | ✅      | 🛠️     | ❌    |
| 0.0.3-DEV | ✅      | 🚧      | ❌    |

---

## Plugin Compatibility

| Version   | Spigot  | Voice Chat | Geyser         | Status |
|-----------|---------|------------|----------------|--------|
| 0.0.1-DEV | 1.21.8  | 2.5.27     | 2.4.1-SNAPSHOT | ❌      |
| 0.0.2-DEV | 1.21.8+ | 2.6.x      | 2.4.1-SNAPSHOT | ⚠️     |
| 0.0.3-DEV | 1.21.8+ | 2.6.x      | 2.9.0-SNAPSHOT | ✅      |

---

## Status Key

- ✅ Supported
- ⚠️ End of support / limited support
- 🚧 Not production-ready
- 🛠️ Work in progress
- ❌ Unsupported

---

## Notes

- Chrome is currently the only fully supported browser
- Firefox support is incomplete due to WebRTC / permission differences
- Edge is not tested and should be considered unsupported

---

## Recommendation

Use:
- Latest Chrome
- Latest supported plugin versions

Avoid mixing outdated components.