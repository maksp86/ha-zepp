# Home Assistant companion for Zepp OS devices
Application that allows you to control a smart home based on the Home Assistant

## Features
- Sensor status and graph
- Toggle switch
- Toggle light, change its effect, brightness and color (if this possible)
- Media player support with play/pause, prev/next, volume control
- Vacuum robots support (cleaning status, battery monitoring, start/pause/stop global cleaning, locate vacuum and send it back to dock)
- Input buttons support (press, see last press time)
- Scenes support (turn on, see last time it was turned on)

## Screenshots  
![image](images/1.png)  
<details>
  <summary>Light</summary>
  <img src="images/3.png">
  <img src="images/3.1.png">
  <img src="images/3.2.png">
  <img src="images/3.3.png">
</details>
<details>
  <summary>Media player</summary>
  <img src="images/2.png">
  <img src="images/2.1.png">
</details>
<details>
  <summary>Sensor</summary>
  <img src="images/4.png">
</details>
<details>
  <summary>Vacuum (TODO: Add screenshots)</summary>
  <img src="images/5.png">
</details>
<details>
  <summary>Input Button (TODO: Add screenshots)</summary>
  <img src="images/6.png">
</details>
<details>
  <summary>Scene (TODO: Add screenshots)</summary>
  <img src="images/7.png">
</details>

### To Do:
- Editing colors for lights
- Maybe something else that I don't already have in HA.

### Devices supported
- Mi Band 7 (You need modified Zepp app (see preparations))
- Amazfit Band 7
- All other Zepp OS (square) devices, but there is no proper UI for them

### Preparations
#### Mi Band 7
- [Modified Zepp App (France for Smart Band 7)](https://4pda.to/forum/index.php?showtopic=797981&st=16040#entry123924881) (registration required for downloading)
- You need to connect Mi Band 7 to Modified Zepp App the same way you would with Zepp Life (google auth is not  supported)
- You need to enable [Developer Mode](https://docs.zepp.com/docs/1.0/guides/tools/zepp-app/) in app
- Install app with QR-code (soon) or build yourself
- Open the application settings and specify the addresses of Home Assistant, Long-lived access token and select the sensors you want to display on Zepp OS device
#### Home Assistant
- Long-lived access token (you can generate it on your-ha-instance.local/profile page)
- "If you are not using the [`frontend`](https://www.home-assistant.io/integrations/frontend/) in your setup then you need to add the [`api` integration](https://www.home-assistant.io/integrations/api/) to your `configuration.yaml` file."

### TLDR
#### Install the requirements and ZEPP SDK
- Register an account at [Open Platform](https://user.zepp.com/universalLogin/index.html#/register?project_name=open_platform&project_redirect_uri=https%3A%2F%2Fconsole.zepp.com%2F%23%2F&platform_app=com.huami.webapp)
- Install Node and NPM (follow your distribution guidelines to install it, you should have working 'npm' command)
- Run `sudo npm install @zeppos/zeus-cl -G` to install `zeus` tool
#### Build and install the app
- Run `zeus preview` in this repository's root directory (where this file is placed)
- Sign in to your Open Platform account at the page opened by `zeus preview` command (you should do this just once)
- If the build was successful - you will see a short-lived (2 hours) QR code
- Scan the code using Zepp app to install it to your device
#### Debug the app (check logs)
- Follow the [official debugging guide](https://docs-testing.zepp.com/docs/v2/guides/best-practice/debug/)
- As the last resort follow [View real machine logs](https://docs-testing.zepp.com/docs/v2/guides/tools/zepp-app/#view-real-machine-logs) guide for logs and do debugging-by-logging
#### Develop the app
- Check [ZEPP SDK documentation](https://docs.zepp.com/docs/reference/app-json/) for SDK usage information and code examples
