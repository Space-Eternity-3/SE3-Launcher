# SE3 Launcher

Launcher for Space Eternity 3

**NOTE**: Launcher is only built for Windows, because there is no game builds for other operating system. (You can still use Wine I think)

**Another note**: Both yarn and npm should be supported

## debugConfig.json

If you ~~somehow~~ have local copy of Version Api you can create file named debugConfig.json and set localServer to true

```json
{
    "localServer": true
}
```

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

### Versions.json

```json
{
  "Versions": [
    {
      "name": "SE3 Alpha 0.1",
      "tag": "SE3-Alpha-0.1",
      "file": "SE3-Alpha-0.1.zip",
      "hidden": false,
      "image": "SE3-Alpha-0.1.png"
    },
    {
      "name": "SE3 Alpha 0.2",
      "tag": "SE3-Alpha-0.2",
      "file": "SE3-Alpha-0.2.zip",
      "hidden": false,
      "image": "SE3-Alpha-0.2.png"
    },
    ...
  ],
  "latest": "SE3-Beta-1.11"
}
```

**Versions**