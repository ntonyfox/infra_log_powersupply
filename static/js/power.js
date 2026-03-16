// ===== GLOBAL VARIABLES =====
let globalMode = false; // false = WORK, true = BOOT
let servers = [];
let extraLoads = [];
let tempServers = [];
let sortOrder = 'desc'; // 'desc' or 'asc'

// ===== LOAD DATA FROM SERVER =====
async function loadData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        globalMode = false;
        servers = data.servers || [];
        extraLoads = data.extraLoads || [];
        
        servers = servers.map(s => ({
            ...s,
            enabled: s.enabled !== undefined ? s.enabled : true,
            individualMode: null
        }));
        
        renderServers();
        renderExtraLoads();
        updateGlobalButton();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// ===== SORTING =====
function toggleSort() {
    sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    const sortBtn = document.getElementById('sort-btn');
    sortBtn.textContent = sortOrder === 'desc' ? '▼ Descending' : '▲ Ascending';
    
    if (document.getElementById('edit-panel').style.display === 'block') {
        sortServers(tempServers);
        renderEditMode();
    } else {
        sortServers(servers);
        renderServers();
    }
}

function sortServers(serversList) {
    serversList.sort((a, b) => {
        const aVal = getServerValues(a).amps;
        const bVal = getServerValues(b).amps;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
}

// ===== GLOBAL MODE TOGGLE =====
function toggleGlobalMode() {
    globalMode = !globalMode;
    updateGlobalButton();
    
    if (document.getElementById('edit-panel').style.display === 'block') {
        sortServers(tempServers);
        renderEditMode();
    } else {
        sortServers(servers);
        renderServers();
    }
}

function updateGlobalButton() {
    const btn = document.getElementById('global-mode-btn');
    if (btn) {
        btn.textContent = globalMode ? '🔴 BOOT MODE' : '🟢 WORK MODE';
        btn.style.background = globalMode ? '#ff9500' : '#34c759';
    }
}

// ===== VIEW MODE =====
function renderServers() {
    const tbody = document.getElementById('servers-tbody');
    if (!tbody) return;
    
    sortServers(servers);
    tbody.innerHTML = '';
    
    servers.forEach((server, index) => {
        const values = getServerValues(server);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" 
                           ${server.enabled ? 'checked' : ''} 
                           onchange="toggleServerEnabled(${index}, this.checked)"
                           style="width: 16px; height: 16px; cursor: pointer;">
                    <span style="font-weight: 500; font-size: 1em; ${!server.enabled ? 'opacity: 0.5;' : ''}">${server.name}</span>
                    <div style="display: flex; gap: 4px; margin-left: 8px;">
                        <button class="mode-btn-small ${getModeButtonClass(server, false)}" 
                                onclick="toggleIndividualMode(${index}, false)"
                                ${!server.enabled ? 'disabled style="opacity: 0.3;"' : ''}>
                            W
                        </button>
                        <button class="mode-btn-small ${getModeButtonClass(server, true)}" 
                                onclick="toggleIndividualMode(${index}, true)"
                                ${!server.enabled ? 'disabled style="opacity: 0.3;"' : ''}>
                            B
                        </button>
                    </div>
                </div>
            </td>
            <td>
                <span style="font-size: 1.1em; font-weight: 500; ${!server.enabled ? 'opacity: 0.5;' : ''}">
                    ${values.amps.toFixed(2)} A
                </span>
                <div class="value-hint">
                    W:${server.work.amps.toFixed(2)} / B:${server.boot.amps.toFixed(2)}
                </div>
            </td>
            <td>
                <span style="font-size: 1.1em; font-weight: 500; ${!server.enabled ? 'opacity: 0.5;' : ''}">
                    ${values.watts} W
                </span>
                <div class="value-hint">
                    W:${server.work.watts} / B:${server.boot.watts}
                </div>
            </td>
            <td>
                <button class="btn btn-delete" onclick="deleteServer(${index})">✕</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    calculateTotal();
}

// ===== EDIT MODE =====
function enterEditMode() {
    tempServers = JSON.parse(JSON.stringify(servers));
    document.getElementById('edit-panel').style.display = 'block';
    document.getElementById('view-panel').style.display = 'none';
    sortServers(tempServers);
    renderEditMode();
}

function cancelEdit() {
    document.getElementById('edit-panel').style.display = 'none';
    document.getElementById('view-panel').style.display = 'block';
    renderServers();
}

async function saveEdit() {
    servers = JSON.parse(JSON.stringify(tempServers));
    
    await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servers)
    });
    
    document.getElementById('edit-panel').style.display = 'none';
    document.getElementById('view-panel').style.display = 'block';
    renderServers();
    alert('Changes saved');
}

function renderEditMode() {
    const tbody = document.getElementById('edit-servers-tbody');
    if (!tbody) return;
    
    sortServers(tempServers);
    tbody.innerHTML = '';
    
    tempServers.forEach((server, index) => {
        const values = getServerValues(server);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" 
                               ${server.enabled ? 'checked' : ''} 
                               onchange="toggleTempServerEnabled(${index}, this.checked)"
                               style="width: 16px; height: 16px; cursor: pointer;">
                        <input type="text" value="${server.name}" 
                               onchange="updateTempName(${index}, this.value)"
                               style="padding: 4px 8px; border: 1px solid #0071e3; border-radius: 6px; flex-grow: 1; font-size: 0.9em;">
                    </div>
                    <div style="display: flex; gap: 4px; margin-left: 24px;">
                        <button class="mode-btn-small ${getModeButtonClass(server, false)}" 
                                onclick="toggleIndividualMode(${index}, false)"
                                ${!server.enabled ? 'disabled style="opacity: 0.3;"' : ''}>
                            W
                        </button>
                        <button class="mode-btn-small ${getModeButtonClass(server, true)}" 
                                onclick="toggleIndividualMode(${index}, true)"
                                ${!server.enabled ? 'disabled style="opacity: 0.3;"' : ''}>
                            B
                        </button>
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; gap: 4px;">
                        <input type="number" step="0.01" value="${server.work.amps}" 
                               placeholder="Work"
                               onchange="updateTempWork(${index}, 'amps', parseFloat(this.value) || 0)"
                               style="width: 70px; padding: 4px; border: 1px solid #34c759; border-radius: 6px;">
                        <input type="number" step="0.01" value="${server.boot.amps}" 
                               placeholder="Boot"
                               onchange="updateTempBoot(${index}, 'amps', parseFloat(this.value) || 0)"
                               style="width: 70px; padding: 4px; border: 1px solid #ff9500; border-radius: 6px;">
                    </div>
                    <div class="value-hint">
                        Current: ${values.amps.toFixed(2)} A
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; gap: 4px;">
                        <input type="number" value="${server.work.watts}" 
                               placeholder="Work"
                               onchange="updateTempWork(${index}, 'watts', parseFloat(this.value) || 0)"
                               style="width: 70px; padding: 4px; border: 1px solid #34c759; border-radius: 6px;">
                        <input type="number" value="${server.boot.watts}" 
                               placeholder="Boot"
                               onchange="updateTempBoot(${index}, 'watts', parseFloat(this.value) || 0)"
                               style="width: 70px; padding: 4px; border: 1px solid #ff9500; border-radius: 6px;">
                    </div>
                    <div class="value-hint">
                        Current: ${values.watts} W
                    </div>
                </div>
            </td>
            <td>
                <button class="btn btn-delete" onclick="deleteTempServer(${index})">✕</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    calculateTotal();
}

// ===== SERVER ENABLE/DISABLE =====
async function toggleServerEnabled(index, enabled) {
    servers[index].enabled = enabled;
    await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servers)
    });
    sortServers(servers);
    renderServers();
}

function toggleTempServerEnabled(index, enabled) {
    tempServers[index].enabled = enabled;
    sortServers(tempServers);
    renderEditMode();
}

// ===== UPDATE TEMP VALUES =====
function updateTempName(index, value) {
    tempServers[index].name = value;
}

function updateTempBoot(index, field, value) {
    tempServers[index].boot[field] = value;
    calculateTotal();
}

function updateTempWork(index, field, value) {
    tempServers[index].work[field] = value;
    calculateTotal();
}

function deleteTempServer(index) {
    if (confirm('Delete server?')) {
        tempServers.splice(index, 1);
        sortServers(tempServers);
        renderEditMode();
    }
}

function addTempServer() {
    tempServers.push({ 
        name: "New Server",
        enabled: true,
        boot: { amps: 0, watts: 0 },
        work: { amps: 0, watts: 0 },
        individualMode: null
    });
    sortServers(tempServers);
    renderEditMode();
}

// ===== MODE FUNCTIONS =====
function toggleIndividualMode(index, mode) {
    const currentServers = document.getElementById('edit-panel').style.display === 'block' ? tempServers : servers;
    
    if (currentServers[index].individualMode === mode) {
        currentServers[index].individualMode = null;
    } else {
        currentServers[index].individualMode = mode;
    }
    
    if (document.getElementById('edit-panel').style.display === 'block') {
        sortServers(tempServers);
        renderEditMode();
    } else {
        sortServers(servers);
        renderServers();
    }
}

function getServerValues(server) {
    if (!server.enabled) {
        return { amps: 0, watts: 0 };
    }
    
    if (server.individualMode !== null) {
        return server.individualMode ? server.boot : server.work;
    } else {
        return globalMode ? server.boot : server.work;
    }
}

function getModeButtonClass(server, mode) {
    if (!server.enabled) return 'mode-btn-small';
    
    if (server.individualMode !== null) {
        if (server.individualMode === mode) {
            return `mode-btn-small ${mode ? 'boot' : 'work'} active`;
        } else {
            return 'mode-btn-small';
        }
    } else {
        if (globalMode === mode) {
            return `mode-btn-small ${mode ? 'boot' : 'work'} active`;
        } else {
            return 'mode-btn-small';
        }
    }
}

// ===== SERVER MANAGEMENT IN VIEW MODE =====
async function deleteServer(index) {
    if (confirm('Delete server?')) {
        servers.splice(index, 1);
        await fetch('/api/servers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(servers)
        });
        sortServers(servers);
        renderServers();
    }
}

async function addServer() {
    servers.push({ 
        name: "New Server",
        enabled: true,
        boot: { amps: 0, watts: 0 },
        work: { amps: 0, watts: 0 },
        individualMode: null
    });
    await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servers)
    });
    sortServers(servers);
    renderServers();
}

// ===== EXTRA LOADS =====
function renderExtraLoads() {
    const container = document.getElementById('extra-loads');
    if (!container) return;
    
    container.innerHTML = '';
    
    extraLoads.forEach((load, index) => {
        const div = document.createElement('div');
        div.className = 'extra-load-item';
        div.innerHTML = `
            <label>
                <input type="checkbox" ${load.enabled ? 'checked' : ''} 
                       onchange="toggleExtraLoad(${index}, this.checked)">
                ${load.name}
            </label>
        `;
        container.appendChild(div);
    });
}

async function toggleExtraLoad(index, enabled) {
    extraLoads[index].enabled = enabled;
    await fetch('/api/extraloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extraLoads)
    });
    calculateTotal();
}

// ===== CALCULATE TOTALS =====
function calculateTotal() {
    const currentServers = document.getElementById('edit-panel').style.display === 'block' ? tempServers : servers;
    
    const serversTotal = currentServers.reduce((sum, server) => {
        const values = getServerValues(server);
        return sum + values.amps;
    }, 0);
    
    const extraTotal = extraLoads.reduce((sum, l) => sum + (l.enabled ? l.value : 0), 0);
    const total = serversTotal + extraTotal;
    
    const serversEl = document.getElementById('servers-total');
    const extraEl = document.getElementById('extra-total');
    const totalEl = document.getElementById('grand-total');
    
    if (serversEl) {
        serversEl.textContent = serversTotal.toFixed(2) + ' A';
        extraEl.textContent = extraTotal.toFixed(2) + ' A';
        totalEl.textContent = total.toFixed(2) + ' A';
        
        totalEl.className = 'total-value';
        totalEl.classList.remove('total-green', 'total-yellow', 'total-red', 'total-burgundy');
        if (total > 20) totalEl.classList.add('total-burgundy');
        else if (total > 18) totalEl.classList.add('total-red');
        else if (total > 16) totalEl.classList.add('total-yellow');
        else totalEl.classList.add('total-green');
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});