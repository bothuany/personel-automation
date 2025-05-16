const express = require("express");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const notifier = require("node-notifier");
const app = express();
require('dotenv').config(); // Load environment variables from .env file

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

// Function to kill any process using the specified port
const killProcessOnPort = (port) => {
  return new Promise((resolve, reject) => {
    // Use PowerShell command to directly find and kill process on port
    const killCommand = `powershell -Command "try { Stop-Process -Id (Get-NetTCPConnection -LocalPort ${port}).OwningProcess -Force -ErrorAction Stop; Write-Host 'Successfully killed process on port ${port}' } catch { Write-Host 'No process found on port ${port} or failed to kill: $_' }"`;
    
    exec(killCommand, (error, stdout, stderr) => {
      console.log(stdout.trim());
      if (stderr) {
        console.error(`Error while killing process on port ${port}:`, stderr);
      }
      resolve(); // Continue regardless of kill result
    });
  });
};

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

    // Try multiple methods to open Microsoft Teams
    try {
      // Method 1: Using shell:AppsFolder
      runHiddenCommand("explorer shell:AppsFolder\\Microsoft.Teams_8wekyb3d8bbwe!Microsoft.Teams");
      
      // Method 2: Try direct execution if Method 1 fails
      runHiddenCommand("start ms-teams:");
      
      // Method 3: Try starting from Program Files if above methods fail
      runHiddenCommand("start \"\" \"C:\\Program Files\\Microsoft Teams\\current\\Teams.exe\"");
      
      // Method 4: Try starting from AppData if above methods fail
      runHiddenCommand("start \"\" \"%LOCALAPPDATA%\\Microsoft\\Teams\\current\\Teams.exe\"");
    } catch (teamErr) {
      console.error("Teams başlatılamadı:", teamErr);
    }

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

// VPN connection endpoint - opens the specified portal and enters credentials
app.post("/vpn", (req, res) => {
  const domainType = req.body.domain || "tradesoft"; // Default to tradesoft if not specified
  const otpCode = req.body.otp || ""; // OTP code from request body
  
  console.log("domainType: " + domainType);
  console.log("otpCode: " + otpCode);
  
  try {
    // Set credentials based on VPN type
    let username, password, portalName;
    if (domainType.toLowerCase() === "tradesoft") {
      username = process.env.TRADESOFT_USERNAME;
      password = process.env.TRADESOFT_PASSWORD;
      portalName = "Tradesoft VPN";
    } else if (domainType.toLowerCase() === "ata") {
      username = process.env.ATA_USERNAME;
      password = process.env.ATA_PASSWORD;
      portalName = "ATA VPN";
    } else {
      throw new Error("Geçersiz domain tipi " + domainType);
    }

    // Check if credentials are available
    if (!username || !password) {
      throw new Error(`${domainType} VPN için kimlik bilgileri bulunamadı. .env dosyasını kontrol edin.`);
    }

    console.log("username: " + username);
    console.log("password: " + password);

    // Show Windows notification
    //showNotification("VPN Bağlantısı", `${portalName} bağlantısı başlatılıyor...`);

    // Create a temporary PowerShell script to automate the GlobalProtect VPN login
    const scriptPath = path.join(__dirname, "vpn_login.ps1");
    const scriptContent = `
# Start GlobalProtect VPN client if not already running
$gpProcess = Get-Process -Name "PanGPA" -ErrorAction SilentlyContinue
if ($null -eq $gpProcess) {
    Start-Process "C:\\Program Files\\Palo Alto Networks\\GlobalProtect\\PanGPA.exe"
    Start-Sleep -Seconds 2
}

# Using SendKeys to automate the form filling
Add-Type -AssemblyName System.Windows.Forms

# Click on the GlobalProtect icon in system tray to open it
[System.Windows.Forms.SendKeys]::SendWait("^{ESC}")
Start-Sleep -Seconds 1
[System.Windows.Forms.SendKeys]::SendWait("GlobalProtect")
Start-Sleep -Seconds 1
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Seconds 2
# Skip portal selection and just press ENTER to continue
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Seconds 2

[System.Windows.Forms.SendKeys]::SendWait("{TAB}")
[System.Windows.Forms.SendKeys]::SendWait("{TAB}")
[System.Windows.Forms.SendKeys]::SendWait("{TAB}")
[System.Windows.Forms.SendKeys]::SendWait("{TAB}")
# Enter username and password
[System.Windows.Forms.SendKeys]::SendWait("${username}")
Start-Sleep -Seconds 1
[System.Windows.Forms.SendKeys]::SendWait("{TAB}")
Start-Sleep -Seconds 1
[System.Windows.Forms.SendKeys]::SendWait("${password}")
Start-Sleep -Seconds 2
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Seconds 7
[System.Windows.Forms.SendKeys]::SendWait("${otpCode}")
Start-Sleep -Seconds 1
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    `;

    fs.writeFileSync(scriptPath, scriptContent);

    // Execute the PowerShell script with hidden window
    runHiddenCommand(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);

    // Delete the temporary script after a delay
    setTimeout(() => {
      try {
        fs.unlinkSync(scriptPath);
      } catch (err) {
        console.error("Geçici script dosyası silinemedi:", err);
      }
    }, 10000);

    let responseMessage = `${portalName} bağlantısı başlatıldı.`;
    if (otpCode) {
      responseMessage += ` OTP kodu (${otpCode}) otomatik olarak girildi.`;
    } else {
      responseMessage += ` OTP kodu elle girilmeli.`;
    }

    // Show notification about credentials
    //showNotification("VPN Bilgileri", responseMessage);

    res.send(responseMessage);
  } catch (err) {
    console.error("VPN bağlantısı başlatılırken hata:", err);
    res.status(500).send("VPN bağlantısı başlatılırken hata oluştu: " + err.message);
  }
});

// First kill any process using the port, then start the server
killProcessOnPort(PORT).then(() => {
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
}).catch(err => {
  console.error("Server başlatılırken hata:", err);
});
