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
    },

    /**
     * Get all maintenance logs
     */
    async getLogs() {
        try {
            const response = await fetch(`${API_BASE_URL}/logs`);
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch logs:", error);
            return [];
        }
    },

    /**
     * Add new equipment
     */
    async addEquipment(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/equipment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to add equipment:", error);
            throw error;
        }
    },

    /**
     * Get all equipment
     */
    async getEquipment() {
        try {
            const response = await fetch(`${API_BASE_URL}/equipment`);
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch equipment:", error);
            return [];
        }
    },

    /**
     * Add new team
     */
    async addTeam(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/teams`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to add team:", error);
            throw error;
        }
    },

    /**
     * Get all teams
     */
    async getTeams() {
        try {
            const response = await fetch(`${API_BASE_URL}/teams`);
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch teams:", error);
            return [];
        }
    },

    async resetDatabase() {
        const response = await fetch(`${API_BASE_URL}/reset`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error("Failed to reset database");
        return await response.json();
    }
};

// Expose to window for global access
window.gearGuardApi = api;
