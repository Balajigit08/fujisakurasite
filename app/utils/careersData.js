// Client-side state manager for Careers positions using localStorage with fallback to default jobs

export const DEFAULT_JOBS = [];

const STORAGE_KEY = "fujisakura_careers_jobs";
const CUSTOM_EVENT_NAME = "fujisakura_careers_updated";

let cachedJobs = null;

/**
 * Get all career positions (returns user-added jobs from localStorage or empty array)
 */
export function getPositions() {
    if (typeof window === "undefined") return DEFAULT_JOBS;
    if (cachedJobs !== null) return cachedJobs;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                cachedJobs = parsed;
                return cachedJobs;
            }
        }
    } catch (err) {
        console.error("Error reading positions from localStorage:", err);
    }
    cachedJobs = DEFAULT_JOBS;
    return cachedJobs;
}

/**
 * Get single position by ID
 */
export function getPositionById(id) {
    const jobs = getPositions();
    return jobs.find((j) => j.id.toString() === id.toString()) || null;
}

/**
 * Save full array of positions to localStorage and trigger change event
 */
export function savePositions(jobs) {
    if (typeof window === "undefined") return;
    cachedJobs = jobs;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
        window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
    } catch (err) {
        console.warn("localStorage quota exceeded. Optimizing stored position images to fit storage limit...", err);
        try {
            // Truncate huge base64 image data to prevent QuotaExceededError crashes
            const optimizedJobs = jobs.map((job) => {
                if (job.image && typeof job.image === "string" && job.image.length > 50000) {
                    return { ...job, image: "/FS-images/Logo-fs.png" };
                }
                return job;
            });
            cachedJobs = jobs; // Keep original in memory
            localStorage.setItem(STORAGE_KEY, JSON.stringify(optimizedJobs));
            window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
        } catch (retryErr) {
            console.error("Unable to write to localStorage:", retryErr);
        }
    }
}

/**
 * Add a new position
 */
export function addPosition(newJob) {
    const jobs = getPositions();
    const createdJob = {
        ...newJob,
        id: Date.now().toString(),
        company: newJob.company || "Fujisakura pvt.Ltd",
        location: newJob.location || "Chennai",
        featured: newJob.featured ?? true,
        image: newJob.image || "/FS-images/Logo-fs.png",
        bannerImage: newJob.bannerImage || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80",
    };
    const updated = [createdJob, ...jobs];
    savePositions(updated);
    return createdJob;
}

/**
 * Update an existing position
 */
export function updatePosition(id, updatedFields) {
    const jobs = getPositions();
    const updated = jobs.map((job) => {
        if (job.id.toString() === id.toString()) {
            return { ...job, ...updatedFields };
        }
        return job;
    });
    savePositions(updated);
    return updated;
}

/**
 * Delete a position by ID
 */
export function deletePosition(id) {
    const jobs = getPositions();
    const updated = jobs.filter((job) => job.id.toString() !== id.toString());
    savePositions(updated);
    return updated;
}

/**
 * Subscribe to position updates (for reactive React components)
 */
export function subscribePositions(callback) {
    if (typeof window === "undefined") return () => { };
    const handler = () => {
        callback(getPositions());
    };
    window.addEventListener(CUSTOM_EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
        window.removeEventListener(CUSTOM_EVENT_NAME, handler);
        window.removeEventListener("storage", handler);
    };
}
