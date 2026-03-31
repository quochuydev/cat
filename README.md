# Cat

### Installation

Download the latest release for your platform:

Download the latest release for your platform from the [Releases page](https://github.com/quochuydev/cat/releases/latest).

| Platform              | File pattern              | Note                                                                |
| --------------------- | ------------------------- | ------------------------------------------------------------------- |
| macOS (Apple Silicon) | `Cat_x.x.x_aarch64.dmg`  | Run `xattr -cr /Applications/Cat.app && open /Applications/Cat.app` |
| macOS (Intel)         | `Cat_x.x.x_x64.dmg`      | Run `xattr -cr /Applications/Cat.app && open /Applications/Cat.app` |
| Windows               | `Cat_x.x.x_x64-setup.exe`| Click **More info** → **Run anyway**                                |
| Linux (deb)           | `cat_x.x.x_amd64.deb`    |                                                                     |
| Linux (AppImage)      | `cat_x.x.x_amd64.AppImage`| Run `chmod +x` before opening                                      |

### UI

<img src="docs/readme.png" alt="Cat" width="400" />

<img src="docs/setting.png" alt="Cat Settings" width="400" />

### Chat API

Send a message to your cat from the terminal:

```bash
curl -X POST http://localhost:11451/say -d '{"message": "Hello from CLI!"}'
```

### Security

The source code is public, NO any personal information send to server or external.
