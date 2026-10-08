"use client";

let cachedJobs = null;
let pendingJobsPromise = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Returns currently cached jobs synchronously if fresh, or null.
 */
export function getCachedJobsData() {
  if (cachedJobs && Date.now() - lastFetchTime < CACHE_TTL_MS) {
    return cachedJobs;
  }
  return null;
}

/**
 * Pre-fetches the jobs data in the background so it is available when visiting /career.
 */
export function preloadJobsData() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (cachedJobs && Date.now() - lastFetchTime < CACHE_TTL_MS) {
    return Promise.resolve(cachedJobs);
  }
  if (pendingJobsPromise) {
    return pendingJobsPromise;
  }

  pendingJobsPromise = fetch("/api/careers/jobs")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    })
    .then((data) => {
      cachedJobs = data.jobs || [];
      lastFetchTime = Date.now();
      pendingJobsPromise = null;
      return cachedJobs;
    })
    .catch((err) => {
      pendingJobsPromise = null;
      throw err;
    });

  return pendingJobsPromise;
}

/**
 * Retrieves the jobs data, utilizing the cached result or in-flight promise if available.
 */
export async function getJobsData() {
  const syncCached = getCachedJobsData();
  if (syncCached) {
    return syncCached;
  }
  return preloadJobsData();
}
