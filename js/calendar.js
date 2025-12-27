// Calendar Logic

// State
let currentDate = new Date(); // Use actual current date
let currentView = 'week'; // 'week', 'day', 'month'
const CAL_START_HOUR = 6;
const CAL_END_HOUR = 23;
const HOUR_HEIGHT = 60; // px

const monthNames = ["December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; // Hacky fix for prev year boundary issues if just using array index on Date.month? Actually better to use standard array.
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Store fetched events globally
let calendarEvents = [];

async function initCalendar() {
    console.log("Calendar Initialized");
    // Fetch events from backend
    try {
        if (window.gearGuardApi) {
            calendarEvents = await window.gearGuardApi.getLogs();
            console.log("Loaded calendar events:", calendarEvents.length);
        }
    } catch (e) {
        console.error("Failed to load calendar events:", e);
        calendarEvents = [];
    }
    setupEventListeners();
    render();
}

function setupEventListeners() {
    document.getElementById('btnPrev').addEventListener('click', () => navigate(-1));
    document.getElementById('btnNext').addEventListener('click', () => navigate(1));
    document.getElementById('btnToday').addEventListener('click', () => {
        currentDate = new Date(); // Reset to actual today
        render();
    });

    document.getElementById('btnViewWeek').addEventListener('click', () => switchView('week'));
    document.getElementById('btnViewDay').addEventListener('click', () => switchView('day'));
    document.getElementById('btnViewMonth').addEventListener('click', () => switchView('month'));
}

function navigate(direction) {
    if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + (direction * 7));
    } else if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() + (direction * 1));
    } else if (currentView === 'month') {
        // First set to 1st of month to avoid edge cases like Jump from Jan 31 to Feb (skips to March)
        currentDate.setDate(1);
        currentDate.setMonth(currentDate.getMonth() + direction);
    }
    render();
}

function switchView(view) {
    currentView = view;
    // Update button states
    document.querySelectorAll('.btn-group button').forEach(b => b.classList.remove('active'));
    if (view === 'week') document.getElementById('btnViewWeek').classList.add('active');
    if (view === 'day') document.getElementById('btnViewDay').classList.add('active');
    if (view === 'month') document.getElementById('btnViewMonth').classList.add('active');

    const gridHeader = document.querySelector('.grid-header');
    const gridCols = document.querySelector('.grid-cols');
    const timeLabels = document.querySelector('.time-labels');

    // Reset classes
    gridCols.classList.remove('month-view');
    if (timeLabels) timeLabels.classList.remove('month-view-hidden');

    // Clear content
    gridHeader.innerHTML = '';
    gridCols.innerHTML = '';

    if (view === 'week') {
        gridCols.innerHTML = '<div class="current-time-line" style="top: 750px;"></div>';
        for (let i = 0; i < 7; i++) {
            gridHeader.innerHTML += `
                <div class="day-col-header" id="header-col-${i}">
                    <div class="day-name">SHORT</div>
                    <div class="day-number">00</div>
                </div>`;
            gridCols.innerHTML += `<div class="grid-day-col" id="col-${i}"></div>`;
        }
    } else if (view === 'day') {
        gridCols.innerHTML = '<div class="current-time-line" style="top: 750px;"></div>';
        gridHeader.innerHTML = `
            <div class="day-col-header" id="header-col-0" style="flex:1; text-align:left; padding-left: 20px;">
                <div class="day-name" style="display:inline-block; margin-right:10px;">DAY</div>
                <div class="day-number" style="display:inline-block;">00</div>
            </div>`;
        gridCols.innerHTML += `<div class="grid-day-col" id="col-0"></div>`;
    } else if (view === 'month') {
        gridCols.classList.add('month-view');
        if (timeLabels) timeLabels.classList.add('month-view-hidden');

        // Month headers (SUN, MON...)
        for (let i = 0; i < 7; i++) {
            gridHeader.innerHTML += `
                <div class="day-col-header" style="border-bottom:none;">
                    <div class="day-name">${daysShort[i]}</div>
                </div>`;
        }
    }

    render();
}

function render() {
    updateHeaderDate();

    if (currentView === 'month') {
        renderMonth();
        return;
    }

    // Week/Day Render Logic
    let startOfPeriod;
    const realToday = new Date(); // FIX: Use real date for red dot

    if (currentView === 'week') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        startOfPeriod = startOfWeek;

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            const header = document.getElementById(`header-col-${i}`);
            if (header) {
                header.querySelector('.day-name').textContent = daysShort[d.getDay()];
                header.querySelector('.day-number').textContent = d.getDate();

                const numEl = header.querySelector('.day-number');
                // FIX: Highlight only if it matches REAL today
                if (isSameDate(d, realToday)) numEl.classList.add('active');
                else numEl.classList.remove('active');
            }
        }
    } else {
        startOfPeriod = new Date(currentDate);
        const header = document.getElementById('header-col-0');
        if (header) {
            header.querySelector('.day-name').textContent = daysShort[currentDate.getDay()];
            header.querySelector('.day-number').textContent = currentDate.getDate();

            const numEl = header.querySelector('.day-number');
            if (isSameDate(currentDate, realToday)) numEl.classList.add('active');
            else numEl.classList.remove('active');
        }
    }

    renderEvents(startOfPeriod);
    renderMiniCalendar(currentDate);
    updateTimeLine(); // FIX: Call timeline update
}

function updateTimeLine() {
    const timeLines = document.querySelectorAll('.current-time-line');
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();

    // Hide if out of hours (optional, but keeps UI clean)
    if (hour < CAL_START_HOUR || hour > CAL_END_HOUR) {
        timeLines.forEach(el => el.style.display = 'none');
        return;
    }

    const hoursFromStart = (hour - CAL_START_HOUR) + (min / 60);
    const top = hoursFromStart * HOUR_HEIGHT;

    timeLines.forEach(el => {
        el.style.display = 'block';
        el.style.top = `${top}px`;
    });
}

function updateHeaderDate() {
    document.querySelector('.date-display').textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

function renderEvents(startOfPeriod) {
    const endOfPeriod = new Date(startOfPeriod);
    if (currentView === 'week') endOfPeriod.setDate(startOfPeriod.getDate() + 7);
    else endOfPeriod.setDate(startOfPeriod.getDate() + 1);

    const events = calendarEvents.filter(req => {
        // FIX: Fallback to request_date if scheduled_date is missing
        const dateStr = req.scheduled_date || req.request_date;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d >= startOfPeriod && d < endOfPeriod;
    });

    document.querySelectorAll('.event-chip').forEach(el => el.remove());

    events.forEach(req => {
        const dateStr = req.scheduled_date || req.request_date;
        const d = new Date(dateStr);
        let colIndex = 0;
        if (currentView === 'week') colIndex = d.getDay();
        else colIndex = 0;

        const hour = d.getHours();
        // If hour is 0 (default date), show at start hour (e.g. 9 AM)
        let displayHour = hour;
        if (hour === 0 && d.getMinutes() === 0) displayHour = 9;

        if (displayHour < CAL_START_HOUR) return;

        const hoursFromStart = (displayHour - CAL_START_HOUR);
        const top = hoursFromStart * HOUR_HEIGHT;

        let durationHours = 1;
        if (req.duration) {
            const parts = req.duration.split(':');
            durationHours = parseFloat(parts[0]) + (parseFloat(parts[1] || 0) / 60);
        }

        const height = durationHours * HOUR_HEIGHT;

        const chip = document.createElement('div');
        chip.className = `event-chip ${getStageColorClass(req.status)}`;
        chip.style.top = `${top}px`;
        chip.style.height = `${height}px`;
        chip.innerHTML = `<i class="fas fa-tools"></i> ${req.title}`;
        chip.title = `${req.title}\n${req.responsible || 'Unassigned'}\n${d.toLocaleDateString()}`;
        chip.onclick = () => alert(`Event: ${req.title}\nTechnician: ${req.responsible || 'Unassigned'}\nDate: ${d.toLocaleString()}`);

        const col = document.getElementById(`col-${colIndex}`);
        if (col) col.appendChild(chip);
    });
}

function renderMonth() {
    const gridCols = document.querySelector('.grid-cols');
    gridCols.innerHTML = ''; // Clear cells

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    // Find start date for grid (last Sunday)
    const startDate = new Date(firstDay);
    startDate.setDate(1 - startDate.getDay());

    // 42 cells (6 weeks) to cover all months comfortably
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + i);

        const isCurrentMonth = cellDate.getMonth() === month;
        const className = isCurrentMonth ? 'month-cell' : 'month-cell muted';
        const isToday = isSameDate(cellDate, currentDate);

        const cell = document.createElement('div');
        cell.className = className;
        if (isToday) cell.classList.add('today');

        // Date Number
        const num = document.createElement('div');
        num.className = 'day-number';
        num.textContent = cellDate.getDate();
        cell.appendChild(num);

        // Find Events for this day
        const dayEvents = calendarEvents.filter(req => {
            if (!req.scheduled_date) return false;
            const d = new Date(req.scheduled_date);
            return isSameDate(d, cellDate);
        });

        dayEvents.forEach(req => {
            const ev = document.createElement('div');
            ev.className = `month-event ${getStageColorClass(req.status)}`;
            ev.textContent = req.title;
            ev.onclick = (e) => {
                e.stopPropagation();
                alert(`${req.title} (${req.responsible || 'Unassigned'})`);
            };
            cell.appendChild(ev);
        });

        // Click on cell to go to day view?
        cell.onclick = () => {
            currentDate = new Date(cellDate);
            document.querySelectorAll('.month-cell').forEach(c => c.classList.remove('today'));
            cell.classList.add('today');
        };

        gridCols.appendChild(cell);
    }
}

function renderMiniCalendar(date) {
    const miniHeader = document.querySelector('.mini-cal-header span');
    miniHeader.textContent = `${months[date.getMonth()]} ${date.getFullYear()}`;

    const grid = document.querySelector('.mini-cal-grid');
    const oldDays = grid.querySelectorAll('.mini-day');
    oldDays.forEach(d => d.remove());

    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    for (let i = 0; i < startOffset; i++) {
        const d = document.createElement('div');
        d.className = 'mini-day muted';
        d.textContent = '•';
        grid.appendChild(d);
    }

    for (let i = 1; i <= totalDays; i++) {
        const d = document.createElement('div');
        d.className = 'mini-day';
        d.textContent = i;
        if (i === date.getDate()) d.classList.add('selected');

        d.onclick = () => {
            currentDate.setDate(i);
            render();
        };
        grid.appendChild(d);
    }
}

function getStageColorClass(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('new')) return 'event-pink';
    if (s.includes('progress')) return 'event-green';
    if (s.includes('repair')) return 'event-green';
    return 'event-green';
}

function isSameDate(d1, d2) {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
}

// Run on load
document.addEventListener('DOMContentLoaded', initCalendar);
