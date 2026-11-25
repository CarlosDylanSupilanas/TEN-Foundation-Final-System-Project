const LATEST_KEY = "latestAttendance";
const RECORDS_KEY = "attendanceRecords";

const todayKey = () => new Date().toLocaleDateString("en-CA");

const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked
  }
};

export const loadLatestEvent = () => read(LATEST_KEY);
export const saveLatestEvent = (event) => write(LATEST_KEY, event);

export const loadTodayRecords = () => {
  const saved = read(RECORDS_KEY);
  if (!saved || saved.date !== todayKey() || !Array.isArray(saved.records)) return [];
  return saved.records;
};

export const saveTodayRecords = (records) =>
  write(RECORDS_KEY, { date: todayKey(), records });

export const upsertRecord = (records, record) => [
  record,
  ...records.filter((r) => r.id !== record.id),
];