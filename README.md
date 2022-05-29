# SE3 Launcher

![image](https://user-images.githubusercontent.com/81181783/170561949-3ff63da7-a5da-44b0-b0ec-111983316914.png)
[![build](https://img.shields.io/github/workflow/status/Space-Eternity-3/SE3-Launcher/Build?style=for-the-badge)](https://github.com/Space-Eternity-3/SE3-Launcher/actions/workflows/build.yml)
[![version](https://img.shields.io/github/v/tag/Space-Eternity-3/SE3-Launcher?label=version&style=for-the-badge)](https://github.com/Space-Eternity-3/SE3-Launcher/releases/)
[![discord badge](https://img.shields.io/discord/909014300088213547?label=Discord&logo=Discord&style=for-the-badge)](https://discord.gg/e4ppBTRKhg)

Launcher for Space Eternity 3

**NOTE**: Launcher is only built for Windows, because there are no game builds for other operating system. (You can still use Wine I think)

**Another note**: Both yarn and npm should be supported

## Table of Contents

- [SE3 Launcher](#se3-launcher)
  - [Table of Contents](#table-of-contents)
  - [Version api](#version-api)
    - [Versions.php](#versionsphp)
      - [Versions](#versions)
      - [latest](#latest)
    - [Launcher.md](#launchermd)

## Version api

Root: `https://nadwey.pl/` (this may change)

Api structure:

```text
Root/kamiloso (https://nadwey.pl/kamiloso)
└───SE3
    ├───Images
    │       SE3-Alpha-0.1.png
    │       SE3-Alpha-0.2.png
    │       SE3-Alpha-0.3.png
    │       ...
    │
    ├───Launcher
    |       Launcher.md
    └───Versions
        │   Versions.json
        │   Versions.php
        │
        └───Releases
                SE3-Alpha-0.1.zip
                SE3-Alpha-0.2.zip
                SE3-Alpha-0.3.zip
                ...
```

### Versions.php

[Versions.php](https://nadwey.pl/kamiloso/SE3/Versions/Versions.php) file takes [Versions.json](https://nadwey.pl/kamiloso/SE3/Versions/Versions.json) contents and appends `size` property to it.

#### Versions

| Name   | Type    | Description                                                                                                 |
| ------ | ------- | ----------------------------------------------------------------------------------------------------------- |
| name   | string  | Display name.                                                                                               |
| tag    | string  | Version tag. Used for images, files, latest version and for installed versions and other things.            |
| file   | string  | File name on the server.                                                                                    |
| hidden | bool    | Is version hidden (for example: because of critical bugs)                                                   |
| image  | string? | Image file name on the server. May be null                                                                  |
| size   | number  | Version size in bytes. (~~Please use this, instead of spamming my servers with HEAD requests. Thank You.~~) |

#### latest

Latest version tag

---

Example (may be out of date):

```jsonc
{
    "Versions": [
        {
            "name": "SE3 Alpha 0.1",
            "tag": "SE3-Alpha-0.1",
            "file": "SE3-Alpha-0.1.zip",
            "hidden": false,
            "image": "SE3-Alpha-0.1.png",
            "size": 16678417
        },
        {
            "name": "SE3 Alpha 0.2",
            "tag": "SE3-Alpha-0.2",
            "file": "SE3-Alpha-0.2.zip",
            "hidden": false,
            "image": "SE3-Alpha-0.2.png",
            "size": 16718926
        },
        {
            "name": "SE3 Alpha 0.3",
            "tag": "SE3-Alpha-0.3",
            "file": "SE3-Alpha-0.3.zip",
            "hidden": false,
            "image": "SE3-Alpha-0.3.png",
            "size": 16719918
        },
        ...
    ],
    "latest": "SE3-Beta-1.12"
}
```

### Launcher.md

[Launcher.md](https://nadwey.pl/kamiloso/SE3/Launcher/Launcher.md) is a markdown file displayed in Launcher tab.