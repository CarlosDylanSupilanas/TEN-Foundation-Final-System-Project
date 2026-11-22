const STORAGE_KEY = "workers";

export const normalizeName = (name) =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

// QR has matched in ID and Name
export const qrMatchesWorker = (worker) => {
  try {
    const payload = JSON.parse(worker.qrPayload);
    return (
      Boolean(worker.qrCode) &&
      payload.workerId === worker.workerId &&
      payload.name === worker.name
    );
  } catch {
    return false;
  }
};

export const loadWorkers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(qrMatchesWorker) : [];
  } catch {
    return [];
  }
};

export const saveWorkers = (workers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workers));
  } catch {
    // storage full or blocked - the list still works for this session
  }
};