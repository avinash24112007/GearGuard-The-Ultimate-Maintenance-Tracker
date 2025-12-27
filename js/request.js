// Maintenance Request Form JavaScript

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('maintenanceForm');
    const newButton = document.getElementById('newButton');
    const priorityStars = document.querySelectorAll('.priority-icon');
    const priorityInput = document.getElementById('priorityInput');
    let currentPriority = 1;

    // Initialize star rating
    updateStarRating(currentPriority);

    // Status tab handlers
    const statusTabs = document.querySelectorAll('.status-step');
    let currentStatus = 'New Request';

    statusTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove active class from all tabs
            statusTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Update current status & map slug to readable string if needed
            const slug = this.getAttribute('data-status');
            currentStatus = formatStatus(slug);

            console.log('Status changed to:', currentStatus);
        });
    });

    function formatStatus(slug) {
        if (slug === 'new') return 'New Request';
        if (slug === 'in-progress') return 'In Progress';
        if (slug === 'repaired') return 'Repaired';
        if (slug === 'scrap') return 'Scrap';
        return slug;
    }

    // Star rating click handler
    priorityStars.forEach((star, index) => {
        star.addEventListener('click', function () {
            currentPriority = index + 1;
            if (priorityInput) priorityInput.value = currentPriority;
            updateStarRating(currentPriority);
        });
    });

    // Update star rating display
    function updateStarRating(rating) {
        priorityStars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.classList.remove('far'); // remove outline
                star.classList.add('fas');    // add filled
            } else {
                star.classList.remove('active');
                star.classList.remove('fas'); // remove filled
                star.classList.add('far');    // add outline
            }
        });
    }

    // Form submission handler
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Collect form data using FormData API
            const fData = new FormData(form);

            // Map HTML form names to Backend Schema (schemas.py)
            const payload = {
                title: document.getElementById('requestTitle').value || "Ex: Conveyor Belt Issue",
                description: fData.get('description') || "",
                created_by: "Mitchell Admin", // Hardcoded for demo, or read from session in real app
                equipment_category: fData.get('equipmentCategory'),
                maintenance_type: fData.get('maintenanceType'),
                team: fData.get('team'),
                responsible: fData.get('responsible'),
                request_date: fData.get('requestDate'),
                scheduled_date: fData.get('scheduledDate') || null,
                duration: fData.get('duration') ? fData.get('duration') + ":00" : null, // Ensure HH:MM:SS format
                priority: currentPriority,
                company: fData.get('company'),
                status: currentStatus
            };

            console.log("Submitting to Backend:", payload);

            try {
                // Call API from api.js
                // Check if api is available
                if (window.gearGuardApi) {
                    const result = await window.gearGuardApi.addLog(payload);
                    console.log("Backend Response:", result);
                    showSuccessMessage('Request saved to database successfully!');
                } else {
                    // Fallback to local storage if API is offline/missing
                    console.warn("API not found, falling back to LocalStorage");
                    saveToLocal(payload);
                    showSuccessMessage('Request saved locally (Backend unavailable).');
                }

                // Reset form after delay
                setTimeout(() => {
                    // resetForm(); // Optional: keep form filled for testing
                }, 1500);

            } catch (error) {
                console.error("Submission Error:", error);
                alert("Failed to save request: " + error.message);
            }
        });
    }

    function saveToLocal(data) {
        let requests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
        requests.push(data);
        localStorage.setItem('maintenanceRequests', JSON.stringify(requests));
    }

    // New button handler
    if (newButton) {
        newButton.addEventListener('click', function (e) {
            e.preventDefault();
            resetForm();
        });
    }

    // Reset form function
    function resetForm() {
        if (form) form.reset();
        document.getElementById('requestTitle').value = "";
        currentPriority = 1;
        updateStarRating(1);
        statusTabs.forEach(t => t.classList.remove('active'));
        statusTabs[0].classList.add('active'); // Reset to first
        currentStatus = 'New Request';
    }

    // Helper: Success Message
    function showSuccessMessage(msg) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.right = '20px';
        div.style.background = '#4CAF50';
        div.style.color = 'white';
        div.style.padding = '15px 25px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        div.style.zIndex = '9999';
        div.style.animation = 'fadeIn 0.5s, fadeOut 0.5s 2.5s';
        div.textContent = msg;

        document.body.appendChild(div);

        setTimeout(() => {
            div.remove();
        }, 3000);
    }

    // Add CSS animation for notification
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
    `;
    document.head.appendChild(style);
});
