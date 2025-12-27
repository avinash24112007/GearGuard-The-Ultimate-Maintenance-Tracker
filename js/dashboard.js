// Dashboard Logic

// Mock Data matching the user's domain (Maintenance)
const requestsData = [
    {
        subject: "Test activity",
        employee: "Mitchell Admin",
        technician: "Aka Foster",
        category: "computer",
        stage: "New Request",
        company: "My company",
        scheduledDate: "2024-12-15T09:00:00", // Sunday
        duration: 2 // hours
    },
    {
        subject: "Conveyor Belt Check",
        employee: "Sarah Connor",
        technician: "Kyle Reese",
        category: "Machinery",
        stage: "In Progress",
        company: "Cyberdyne Systems",
        scheduledDate: "2024-12-16T14:00:00", // Monday
        duration: 3
    },
    {
        subject: "Hydraulic Press Issue",
        employee: "John Doe",
        technician: "Alice Smith",
        category: "Tools",
        stage: "Repaired",
        company: "GearGuard Inc",
        scheduledDate: "2024-12-18T11:00:00", // Wednesday
        duration: 1.5
    },
    {
        subject: "AC Maintenance",
        employee: "Jane Roe",
        technician: "Bob Builder",
        category: "HVAC",
        stage: "New Request",
        company: "CoolAir Ltd",
        scheduledDate: "2024-12-15T16:00:00", // Sunday
        duration: 1
    },
    {
        subject: "Server Overheat",
        employee: "Tech Lead",
        technician: "Sys Admin",
        category: "IT",
        stage: "In Progress",
        company: "DataCorp",
        scheduledDate: "2024-12-19T08:00:00", // Thursday
        duration: 4
    },
    {
        subject: "Cuddly Bee (Checkup)",
        employee: "Zoo Keeper",
        technician: "Dr. Vet",
        category: "Animals",
        stage: "Planned",
        company: "City Zoo",
        scheduledDate: "2024-12-15T06:00:00", // Mon (in orig image it was Mon 15, wait image is dates: Sun 14? Image: Sun 14, Mon 15. Wait. Dec 2024: Sun is Dec 1? No. Dec 2024: Dec 1 is Sunday. So Sun 14 is not Dec 2024. 
        // Let's check 2025? Dec 1 2025 is Monday. 
        // Let's check the valid dates for Sun 14... 
        // Sep 2025: Sun 14. Dec 2025: Sun 14. 
        // Image says "December 202...". Likely Dec 2024? Dec 2024: Sun 15.
        // User image has Sun 14. 
        // I will use Dec 2024 for "current" context but align dates to the visual if possible.
        // Actually, if I use 2024-12-15 (Sun), it matches standard calendar. 
        // The image shows Sun 14... that implies Maybe Nov 2021? Or Dec 2014? 
        // Let's stick to valid 2024 dates. Sun Dec 15 2024.
        // I will update the calendar to render REAL dates for Dec 2024.
        duration: 2
    },
    {
        subject: "Dependable Sparrow",
        employee: "Bird Watcher",
        technician: "Ornithologist",
        category: "Animals",
        stage: "In Progress",
        company: "Avian Inc",
        scheduledDate: "2024-12-20T17:00:00", // Friday
        duration: 1
    }
];

async function initDashboard() {
    console.log("Dashboard Initialized");
    try {
        const logs = await window.gearGuardApi.getLogs();
        renderTable(logs);
        updateStats(logs);
    } catch (e) {
        console.error("Error loading dashboard:", e);
    }
}

function updateStats(data) {
    if (!data) return;
    // Simple logic to count stats if we wanted to make it dynamic
    const newCount = data.filter(r => r.status === 'New Request').length;
    // We could update the DOM elements here if we added IDs to the stat values
    // document.getElementById('openRequestsCount').textContent = newCount + " Pending";
}

function renderTable(data) {
    const tbody = document.getElementById('requestTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    data.forEach(req => {
        const tr = document.createElement('tr');

        // Map backend fields to UI
        // Backend: title, created_by, responsible, equipment_category, status, company
        const subject = req.title || "Untitled";
        const employee = req.created_by || "Unknown";
        const technician = req.responsible || "Unassigned";
        const category = req.equipment_category || "General";
        const stage = req.status || "New";
        const company = req.company || "";

        // Generate Initials for Avatar
        const initials = technician.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const avatarColor = stringToColor(technician);

        // Determine Chip Class
        const stageClass = stage.toLowerCase().replace(' ', '-'); // "New Request" -> "new-request"

        tr.innerHTML = `
          <td>${subject}</td>
          <td>${employee}</td>
          <td>
            <div class="avatar" style="background-color: ${avatarColor}">${initials}</div>
            ${technician}
          </td>
          <td>${category}</td>
          <td><div class="chip ${stageClass}">${stage}</div></td>
          <td>${company}</td>
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

// Attach Search Listener and Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard data
    initDashboard();

    const searchInput = document.getElementById('dashboardSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Refresh Button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            initDashboard();
        });
    }

    // Reset DB Button
    const resetBtn = document.getElementById('resetDbBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            if (confirm("WARNING: This will delete ALL data (Reports, Equipment, Teams). Are you sure?")) {
                try {
                    await window.gearGuardApi.resetDatabase();
                    alert("Database reset successfully.");
                    initDashboard(); // Refresh empty
                } catch (e) {
                    alert("Failed to reset: " + e.message);
                }
            }
        });
    }
});
