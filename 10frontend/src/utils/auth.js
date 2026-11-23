export const API_URL = "http://localhost:3000";

// >>> If your Express routes are named differently, change ONLY these three lines <<<
const ROUTES = {
  adminLogin: "/auth/login",
  userLogin: "/trainee/login",  // ADDED KE
  userRegister: "/trainee/register", // KE
};

const ADMIN_KEY = "adminToken";
const USER_KEY = "traineeToken"; // KE

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage blocked - user will be asked to sign in again
  }
};
const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

export const getToken = () => read(ADMIN_KEY);
export const setToken = (token) => write(ADMIN_KEY, token);
export const clearToken = () => remove(ADMIN_KEY);


// KE
export const getUserToken = () => read(USER_KEY);
export const clearUserToken = () => remove(USER_KEY);

export const isAdminSignedIn = () => Boolean(getToken());
export const isTraineeSignedIn = () => Boolean(getUserToken()); // KE
export const isSignedIn = isAdminSignedIn;

const post = async (path, body) => {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Make sure the backend is running on port 3000.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || "Something went wrong. Please try again.");
  }
  return data;
};

export const loginAdmin = async (email, password) => {
  const data = await post(ROUTES.adminLogin, { email, password });
  if (!data.token) throw new Error("Login failed.");
  setToken(data.token);
};

export const loginUser = async (email, password) => {
  const data = await post(ROUTES.userLogin, { email, password });
  if (!data.token) throw new Error("Login failed.");
  write(USER_KEY, data.token);
};

export const registerUser = async (details) => {
  const data = await post(ROUTES.userRegister, details);
  if (data.token) write(USER_KEY, data.token);
};

// Logbook
const LOGBOOK_KEY = "logbookToken";
const LOGBOOK_LOGIN_ROUTE = "/logbook/login";

export const getLogbookToken = () => read(LOGBOOK_KEY);
export const clearLogbookToken = () => remove(LOGBOOK_KEY);
export const isLogbookSignedIn = () => Boolean(getLogbookToken());

export const loginLogbook = async (email, password) => {
  const data = await post(LOGBOOK_LOGIN_ROUTE, { email, password });
  if (!data.token) throw new Error("Login failed.");
  write(LOGBOOK_KEY, data.token);
};


// ADDED KE


// ===================== ADDED (nothing above this line was changed) =====================

// ADDED: reads the trainee's details (name, email) from the login token, if your
// backend puts them in the token. Returns null when there is no token or no details.
export const getUser = () => {
  try {
    const base64 = getUserToken().split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};
