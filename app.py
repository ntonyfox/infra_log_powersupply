from flask import Flask, render_template, jsonify, request, make_response
from flask_httpauth import HTTPBasicAuth
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os

app = Flask(__name__)
auth = HTTPBasicAuth()

# ===== USER CONFIGURATION =====
# You can add/modify users here
# Format: 'username': generate_password_hash('password')
users = {
    "admin": generate_password_hash("admin123"),
    "user": generate_password_hash("user123"),
    "guest": generate_password_hash("guest123")
}

@auth.verify_password
def verify_password(username, password):
    if username in users and check_password_hash(users.get(username), password):
        return username
    return None

@auth.error_handler
def auth_error():
    return make_response(jsonify({'error': 'Authentication required'}), 401)

# ===== DATA STORAGE =====
DATA_FILE = 'server_data.json'

# Default servers (5 test servers)
DEFAULT_SERVERS = [
    {"name": "Test_Server_1", "boot": {"amps": 1.5, "watts": 330}, "work": {"amps": 0.8, "watts": 176}, "enabled": True},
    {"name": "Test_Server_2", "boot": {"amps": 2.1, "watts": 462}, "work": {"amps": 1.2, "watts": 264}, "enabled": True},
    {"name": "Test_Server_3", "boot": {"amps": 0.9, "watts": 198}, "work": {"amps": 0.5, "watts": 110}, "enabled": True},
    {"name": "Test_Server_4", "boot": {"amps": 3.2, "watts": 704}, "work": {"amps": 2.0, "watts": 440}, "enabled": True},
    {"name": "Test_Server_5", "boot": {"amps": 1.8, "watts": 396}, "work": {"amps": 1.1, "watts": 242}, "enabled": True}
]

# Default additional loads - you can modify these values
# If you have other constant consumers or interference on your line, edit these values
DEFAULT_EXTRA_LOADS = [
    {"name": "Additional load 1 (1A) - modify in code if needed", "value": 1.0, "enabled": True},
    {"name": "Additional load 2 (1A) - modify in code if needed", "value": 1.0, "enabled": True}
]

def load_data():
    """Load data from JSON file"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {
                'servers': DEFAULT_SERVERS,
                'extraLoads': DEFAULT_EXTRA_LOADS,
                'globalMode': False
            }
    else:
        return {
            'servers': DEFAULT_SERVERS,
            'extraLoads': DEFAULT_EXTRA_LOADS,
            'globalMode': False
        }

def save_data(data):
    """Save data to JSON file"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ===== ROUTES =====
@app.route('/')
@auth.login_required
def index():
    return render_template('power.html')

@app.route('/api/data', methods=['GET'])
@auth.login_required
def get_data():
    """Get all data"""
    return jsonify(load_data())

@app.route('/api/servers', methods=['POST'])
@auth.login_required
def update_servers():
    """Update servers list"""
    data = load_data()
    new_servers = request.json
    data['servers'] = new_servers
    save_data(data)
    return jsonify({'status': 'ok'})

@app.route('/api/extraloads', methods=['POST'])
@auth.login_required
def update_extra_loads():
    """Update extra loads"""
    data = load_data()
    new_extra_loads = request.json
    data['extraLoads'] = new_extra_loads
    save_data(data)
    return jsonify({'status': 'ok'})

@app.route('/api/globalmode', methods=['POST'])
@auth.login_required
def update_global_mode():
    """Update global mode"""
    data = load_data()
    new_mode = request.json.get('globalMode', False)
    data['globalMode'] = new_mode
    save_data(data)
    return jsonify({'status': 'ok'})

@app.route('/api/reset', methods=['POST'])
@auth.login_required
def reset_data():
    """Reset to default data"""
    data = {
        'servers': DEFAULT_SERVERS,
        'extraLoads': DEFAULT_EXTRA_LOADS,
        'globalMode': False
    }
    save_data(data)
    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8500, debug=False)