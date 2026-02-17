---
layout: projects
title: Commands
permalink: /projects/simplevoicegeyser/commands/
sidebar: simplevoicegeyser
---

# SimpleVoiceGeyser Commands

All commands use the base command: /svg

---

## /svg pswd

Sets your personal voice chat password.

### Usage


/svg pswd <new-password>


### Details

- Must be executed by a player
- Password length must be between 8 and 32 characters
- Used for password in Website
- It is recommended to go to the website and use Google's create Strong password feature, then copy and paste here.

---

## /svg cgroup

Creates a new voice group.

### Usage


/svg cgroup -name <group-name> [-t type] [-p password] [-ps]


### Flags

- `-name <group-name>`
    - Required
    - Defines the name of the group

- `-t <type>`
    - Optional
    - Available types:
        - `open`
        - `normal`
        - `isolated`

- `-p <password>`
    - Optional
    - Sets a password for the group

- `-ps`
    - Optional
    - Makes the group persistent
    - Persistent groups remain even when empty

### Permissions

- `svg.vc.creategroup.create`
- `svg.vc.creategroup.type.isolated`
- `svg.vc.creategroup.setpersistent`

---

## /svg jgroup

Joins an existing voice group.

### Usage


/svg jgroup -n <group-name> [-p password]


### Flags

- `-n <group-name>`
    - Required
    - Name of the group to join

- `-p <password>`
    - Optional
    - Required if the group is password protected

---

## /svg lgroup
### Will be implemented in 0.0.3-DEV

Leaves the current voice group.

### Usage


/svg lgroup


### Details

- Must be executed by a player
- Immediately removes the player from their current group

---

## /svg help
### Will be implemented in 0.0.3-DEV

Displays the command help menu.

### Usage

/svg help


---

## Group Persistence

- Persistent groups remain registered even when no players are inside
- Non-persistent groups are automatically deleted when empty  