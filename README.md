# ⚡ Infrastructure Log - Power Consumption Monitor

A simple web-based tool for monitoring and managing server power consumption with Boot/Work mode support.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![Flask](https://img.shields.io/badge/flask-2.0+-lightgrey)

## 📋 Description

Infrastructure Log is an internal web service designed to track and visualize power consumption of servers in a local network. It features real-time calculations, mode switching (Boot/Work), and color-coded overload indicators.

## ✨ Features

- **Real-time monitoring** of server power consumption
- **Dual mode support**: Boot (peak) and Work (normal operation)
- **Global mode toggle** for all servers at once
- **Individual server control** with W/B buttons
- **Enable/disable servers** with checkboxes (excluded from calculations)
- **Sort servers** by consumption (ascending/descending)
- **Edit mode** for modifying server names and values
- **Additional loads** tracking (e.g., line losses, measurement errors)
- **Color-coded total**:
  - 🟢 < 16A - Normal (green)
  - 🟡 16-18A - Warning (yellow)
  - 🔴 18-20A - Critical (red)
  - 🟤 > 20A - Overload (burgundy)
- **HTTP Basic Authentication** for access control
- **Persistent storage** in JSON file

## 🛠️ Tech Stack

- **Backend**: Python 3.8+ / Flask
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Flask-HTTPAuth
- **Storage**: JSON file
- **Deployment**: systemd service

## 📁 Project Structure

infra_log/
- app.py # Main Flask application
- server_data.json # Data storage (auto-generated)
- templates/
- - power.html # Web interface
- static/
- - js/
- - power.js # Frontend logic
- README.md # This file


## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Step-by-step setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ntonyfox/infra_log_powersupply.git
   cd infra_log_powersupply
2. **Install dependencies**
     ```bash
pip install flask flask-httpauth

4. **Configure users (optional)**
Edit app.py and modify the users dictionary:

users = {
    "admin": generate_password_hash("your_password"),
    "user": generate_password_hash("another_password")
}

4. **Run the application**
python app.py
5. **http://localhost:8500**

## Running as a Service (systemd)

1. **Create a systemd service file**
sudo nano /etc/systemd/system/infra-log.service
2. **Add the following content**

[Unit]
Description=Infrastructure Log App
After=network.target

[Service]
User=your_username          # Change this to your actual username
WorkingDirectory=/path/to/infra_log_powersupply  # Change to your actual path
ExecStart=/usr/bin/python3 /path/to/infra_log_powersupply/app.py  # Change path
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

3. **Enable and start the service**
sudo systemctl daemon-reload
sudo systemctl enable infra-log.service
sudo systemctl start infra-log.service
sudo systemctl status infra-log.service

## 📖 Usage Guide

### 👁️ View Mode

| Feature | Description |
|---------|-------------|
| **Global mode button** | Switch between WORK (🟢) and BOOT (🔴) for all servers |
| **Individual W/B buttons** | Override mode for specific servers |
| **Checkboxes** | Enable/disable servers (excluded from total calculation) |
| **Sort button** | Toggle between ascending/descending order by consumption |
| **Delete button** | Remove a server permanently |

### ✎ Edit Mode

| Feature | Description |
|---------|-------------|
| **"✎ Edit" button** | Click to enter edit mode |
| **Modify values** | Change server names, Boot values (orange), or Work values (green) |
| **"+ Add" button** | Add new servers |
| **"💾 Save" button** | Persist changes to server |
| **"Cancel" button** | Discard all changes |

### 📊 Additional Loads

| Load | Default Value | How to Modify |
|------|---------------|---------------|
| **Additional load 1** | 1.0 A | Edit `DEFAULT_EXTRA_LOADS` in `app.py` |
| **Additional load 2** | 1.0 A | Edit `DEFAULT_EXTRA_LOADS` in `app.py` |

> 💡 **Note:** If you have other constant consumers or interference on your line, you can add or modify these values directly in the code. Look for the `DEFAULT_EXTRA_LOADS` array in `app.py`.

Example from `app.py`:
```python
DEFAULT_EXTRA_LOADS = [
    {"name": "Additional load 1 (1A) - modify in code if needed", "value": 1.0, "enabled": True},
    {"name": "Additional load 2 (1A) - modify in code if needed", "value": 1.0, "enabled": True}
]
```

## 🔧 Configuration

### Users and Passwords
Edit the users dictionary in app.py:

users = {
    "admin": generate_password_hash("admin123"),
    "user": generate_password_hash("user123"),
    "guest": generate_password_hash("guest123")
}

### Default Servers
Modify the DEFAULT_SERVERS list in app.py to change initial data:

DEFAULT_SERVERS = [
    {"name": "Test_Server_1", "boot": {"amps": 1.5, "watts": 330}, "work": {"amps": 0.8, "watts": 176}},
    # ... more servers
]

### Port Number
Change the port in the last line of app.py:

app.run(host='0.0.0.0', port=8500, debug=False)

## 🎨 Color Code Reference

| Color | Range | Meaning |
|-------|-------|---------|
| 🟢 **Green** | < 16A | Normal operation |
| 🟡 **Yellow** | 16-18A | Warning - approaching limit |
| 🔴 **Red** | 18-20A | Critical - near overload |
| 🟤 **Burgundy** | > 20A | Overload - exceeds capacity |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Project Link: [https://github.com/ntonyfox/infra_log_powersupply](https://github.com/ntonyfox/infra_log_powersupply)

## 🙏 Acknowledgments

- Built with Flask and vanilla JavaScript
- Icons and emojis for better UX
- Inspired by real-world server room monitoring needs
