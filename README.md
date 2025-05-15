# Automation Server

A Node.js server that provides automation for quickly starting your development environment. It can automatically open VS Code and Spotify with your favorite playlist.

## Features

- Open VS Code with a single HTTP request
- Launch Spotify with a configured playlist
- Windows notifications when automation is triggered
- Configurable port and playlist ID

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your settings in `config.json`

## Automatic Startup Settings

To start the server automatically when your computer boots:

### Method 1: Add Shortcut to Windows Startup Folder

1. Press `Win + R` and type `shell:startup` then press Enter
2. The Windows Startup folder will open
3. Right-click on the `start-server.bat` file in your project and select "Create shortcut"
4. Copy the created shortcut and paste it into the Startup folder you just opened
5. When you restart your computer, the server will start automatically

### Method 2: Using Task Scheduler

1. Press `Win + R` and type `taskschd.msc` then press Enter
2. Click on "Create Basic Task"
3. Give the task a name (e.g., "Automation Server")
4. Select "When the computer starts" option
5. Choose "Start a program" action
6. Click the "Browse" button and select the path to the `start-server.bat` file
7. Click the "Finish" button

### Method 3: Using VBScript

You can also use the included `autostart.vbs` script, which will run the server in the background without showing a command window.

## Usage

The server runs on port 2626 by default (configurable in `config.json`).

1. To automatically start VS Code and Spotify with your configured playlist:

   ```
   http://localhost:2626/automation
   ```

2. To start only VS Code:
   ```
   http://localhost:2626/open-code
   ```

## Configuration

Edit the `config.json` file to customize your settings:

```json
{
  "playlistId": "YOUR_SPOTIFY_PLAYLIST_ID",
  "port": 2626
}
```

- `playlistId`: The Spotify playlist ID you want to open (the last part of the Spotify playlist URL)
- `port`: The port number that the server will listen on
