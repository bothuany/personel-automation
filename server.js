const express = require("express");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const notifier = require("node-notifier");
const app = express();

// Read config from file
const getConfig = () => {
  try {
    const configPath = path.join(__dirname, "config.json");
    const configData = fs.readFileSync(configPath, "utf8");
    return JSON.parse(configData);
  } catch (error) {
    console.error("Config dosyası okunurken hata:", error);
    return {
      playlistId: "37i9dQZF1DXcBWIGoYBM5M",
      port: 2626,
    };
  }
};

const config = getConfig();
const PORT = config.port || 2626;

// Parse JSON bodies
app.use(express.json());

// Function to show Windows notification
const showNotification = (title, message) => {
  notifier.notify({
    title: title,
    message: message,
    icon: path.join(
      __dirname,
      "node_modules",
      "node-notifier",
      "vendor",
      "toaster",
      "ToasterIcon.png"
    ),
    sound: true,
    wait: false,
  });
};

// Function to run commands without showing command window
const runHiddenCommand = (command) => {
  const subprocess = spawn(command, [], {
    shell: true,
    stdio: "ignore",
    detached: true,
    windowsHide: true,
  });
  subprocess.unref();
  return subprocess;
};

app.get("/open-code", (req, res) => {
  try {
    runHiddenCommand("code");
    res.send("VS Code başlatıldı.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Hata oluştu.");
  }
});

// Automation endpoint without query parameters
app.get("/home", (req, res) => {
  const config = getConfig();
  const playlistId = config.playlistId;

  try {
    // Show Windows notification
    showNotification("Otomasyon Başlatıldı", "VS Code ve Spotify açılıyor...");

    // Open VS Code without showing command window
    runHiddenCommand("code");

    // Open Spotify with the specified playlist without showing command window
    runHiddenCommand(`explorer spotify:playlist:${playlistId}`);

    res.send(
      `VS Code ve Spotify playlist başlatıldı. Playlist ID: ${playlistId}`
    );
  } catch (err) {
    console.error("Uygulama başlatılırken hata:", err);
    res.status(500).send("Uygulamalar başlatılırken hata oluştu.");
  }
});

// Work endpoint - opens Microsoft Teams, Visual Studio, and Spotify
app.get("/work", (req, res) => {
  const config = getConfig();
  const playlistId = config.playlistId;

  try {
    // Show Windows notification
    showNotification("İş Ortamı Başlatıldı", "Teams, Visual Studio ve Spotify açılıyor...");

    // Open Microsoft Teams without showing command window
    runHiddenCommand("explorer shell:AppsFolder\\Microsoft.Teams_8wekyb3d8bbwe!Microsoft.Teams");

    // Open Visual Studio without showing command window
    runHiddenCommand("start \"\" \"C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\IDE\\devenv.exe\"");

    // Open Spotify with the specified playlist without showing command window
    runHiddenCommand(`explorer spotify:playlist:${playlistId}`);

    res.send(`Microsoft Teams, Visual Studio ve Spotify playlist başlatıldı. Playlist ID: ${playlistId}`);
  } catch (err) {
    console.error("Uygulama başlatılırken hata:", err);
    res.status(500).send("Uygulamalar başlatılırken hata oluştu.");
  }
});

app.listen(PORT, () => {
  const config = getConfig();
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log(`Aktif Playlist ID: ${config.playlistId}`);

  // Show Windows notification when server starts
  showNotification(
    "Otomasyon Sunucusu Başlatıldı",
    `Sunucu çalışıyor: http://localhost:${PORT}`
  );
});
