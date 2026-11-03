# 🇮🇳 Mausam India — Native Windows Desktop Floating Widget

A standalone, ultra-lightweight desktop widget that floats directly on your **Windows Desktop wallpaper** (just like an Android home screen widget).

---

## 🚀 How to Launch

### Method 1: Instant Launch
Double-click **`Launch-Widget.vbs`**.
The widget immediately appears on the top-right of your Windows desktop without showing any black console window.

### Method 2: Create a Desktop Shortcut
Right-click **`Create-Desktop-Shortcut.ps1`** $\to$ **Run with PowerShell**.
A shortcut titled **"Mausam India Desktop Widget"** will be placed directly onto your Windows Desktop!

### Method 3: Auto-Start with Windows
If you want the widget to open automatically whenever your computer turns on:
Right-click **`Enable-Startup.ps1`** $\to$ **Run with PowerShell**.  
*(To disable later, simply run `Disable-Startup.ps1`)*.

---

## ⚙️ Customizing the Widget

Open **`config.json`** in Notepad to change settings:

```json
{
  "city": "Bengaluru",
  "theme": "dark",
  "showAqi": true,
  "alwaysOnTop": true,
  "width": 340,
  "height": 205,
  "position": "top-right"
}
```

* **`city`**: Any Indian city name (e.g. `"Mumbai"`, `"New Delhi"`, `"Bengaluru"`, `"Kolkata"`, `"Jaipur"`, etc.).
* **`theme`**: `"dark"`, `"light"`, or `"auto"`.
* **`alwaysOnTop`**: Set `true` to keep the widget floating above other windows, or `false` to let it sit quietly on the desktop wallpaper behind other windows (classic gadget style).
* **`position`**: `"top-right"` (default), `"bottom-right"`, `"top-left"`, or `"bottom-left"`.
* **`showAqi`**: `true` or `false`.

---

## 💡 How It Works
* Uses Windows' native Microsoft Edge / WebView2 runtime engine ($0\text{MB}$ extra installation needed).
* Runs in dedicated standalone `--app` mode with zero tabs, zero address bar, and zero toolbars.
* Drops background CPU to $0.0\%$ when not in focus.
