/**
 * GearGuard API Client
 * Handles communication with the Python FastAPI backend
 */

const API_BASE_URL = "http://localhost:8000";

const api = {
    /**
     * Add a new maintenance log
     * @param {Object} formData 
     */
    async addLog(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/add_log`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to add log:", error);
            throw error;
        }
    },

    /**
     * Search for logs by semantic similarity
     * @param {string} query 
     */
    async searchLogs(query) {
        try {
            const response = await fetch(`${API_BASE_URL}/search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ query: query, limit: 5 })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to search logs:", error);
            throw error;
        }
    }
};

// Expose to window for global access
window.gearGuardApi = api;
