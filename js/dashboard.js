// Dashboard Logic

// Mock Data matching the user's domain (Maintenance)
const requestsData = [
    { 
        subject: "Test activity", 
        employee: "Mitchell Admin", 
        technician: "Aka Foster", 
        category: "computer", 
        stage: "New Request", 
        company: "My company" 
    },
    { 
        subject: "Conveyor Belt Check", 
        employee: "Sarah Connor", 
        technician: "Kyle Reese", 
        category: "Machinery", 
        stage: "In Progress", 
        company: "Cyberdyne Systems" 
    },
    { 
        subject: "Hydraulic Press Issue", 
        employee: "John Doe", 
        technician: "Alice Smith", 
        category: "Tools", 
        stage: "Repaired", 
        company: "GearGuard Inc" 
    },
    { 
        subject: "AC Maintenance", 
        employee: "Jane Roe", 
        technician: "Bob Builder", 
        category: "HVAC", 
        stage: "New Request", 
        company: "CoolAir Ltd" 
    },
    { 
        subject: "Server Overheat", 
        employee: "Tech Lead", 
        technician: "Sys Admin", 
        category: "IT", 
        stage: "In Progress", 
        company: "DataCorp" 
    }
];

function initDashboard() {
    console.log("Dashboard Initialized");
    renderTable(requestsData);
    updateStats();
}

function updateStats() {
    // Simple logic to count stats if we wanted to make it dynamic
    const newCount = requestsData.filter(r => r.stage === 'New Request').length;
    // We could update the DOM elements here if we added IDs to the stat values
    // document.getElementById('openRequestsCount').textContent = newCount + " Pending";
}

function renderTable(data) {
    const tbody = document.getElementById('requestTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    data.forEach(req => {
        const tr = document.createElement('tr');
        
        // Generate Initials for Avatar
        const initials = req.technician.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        const avatarColor = stringToColor(req.technician);
        
        // Determine Chip Class
        const stageClass = req.stage.toLowerCase().replace(' ', '-'); // "New Request" -> "new-request"
        
        tr.innerHTML = `
          <td>${req.subject}</td>
          <td>${req.employee}</td>
          <td>
            <div class="avatar" style="background-color: ${avatarColor}">${initials}</div>
            ${req.technician}
          </td>
          <td>${req.category}</td>
          <td><div class="chip ${stageClass}">${req.stage}</div></td>
          <td>${req.company}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Utility to generate consistent colors from strings
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + "00000".substring(0, 6 - c.length) + c;
}

// Search Functionality
function handleSearch(e) {
    const term = e.target.value.toLowerCase();
    const filtered = requestsData.filter(item => 
        item.subject.toLowerCase().includes(term) ||
        item.employee.toLowerCase().includes(term) ||
        item.technician.toLowerCase().includes(term)
    );
    renderTable(filtered);
}

// Attach Search Listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('dashboardSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
});
