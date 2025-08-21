
# QuestBox

QuestBox is a seasonal, theme-driven, gamified life app for a kid. It tracks tasks, awards XP, and allows unlocking rewards.

## Features

- **Gamified Tasks:** Complete daily and weekly tasks to earn Experience Points (XP).
- **Level Up:** Gain levels as you accumulate XP.
- **Reward Shop:** Spend your XP on fun rewards like screen time or treats.
- **Streaks:** Keep up your daily tasks to build a streak for bonus rewards.
- **PIN Protection:** Parent-approved actions are protected by a 4-digit PIN.
- **Themes:** Customize the look and feel with manual, automatic (light/dark), and seasonal themes.
- **Data Management:** Easily export your progress or reset the game (with PIN).

---

## RUNBOOK

### How to Run QuestBox

#### Termux (Android, arm64)

This is the recommended way to run QuestBox on an Android device.

1.  **Install dependencies:**
    ```bash
    pkg update -y
    pkg install -y nodejs git
    ```

2.  **Clone the project (if you haven't already):**
    ```bash
    # Assuming you don't have the files yet
    # git clone <repository_url>
    # cd questbox
    ```

3.  **Run with the script (easiest):**
    Make the script executable first.
    ```bash
    chmod +x ./run-questbox.sh
    bash ./run-questbox.sh
    ```

4.  **Or, run manually:**
    ```bash
    # Make sure you are in the 'questbox' directory
    npm install
    npm run dev -- --host
    ```

#### Any Desktop Node Environment (Windows, macOS, Linux)

1.  **Navigate to the project directory:**
    ```bash
    cd questbox
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    Then open your browser to `http://localhost:5173`.


### Validate Configs

You can check if all your configuration files in the `/config` directory are valid according to their schemas.

```bash
node scripts/validate.js
```

### Quick Notes

-   **Accessing from LAN in Termux:** The `run-questbox.sh` script and the manual Termux command use the `--host` flag. This makes the app accessible to other devices on your same WiFi network. Find your phone's IP address (using the `ifconfig` command in Termux) and go to `http://<your-ip-address>:5173` on another device.

-   **Exported Configs:** When you click "Export Data", your browser will download a file named `questbox_data.json`. On Android, this typically saves to your `Downloads` folder.

-   **Resetting Progress:** The "Reset Progress" button is in the **Admin Panel**. It is a destructive action and requires the admin PIN to be entered. This cannot be undone.
