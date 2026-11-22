import { API_URL, getUserToken, clearUserToken } from "../utils/auth";

// Change these two lines if your backend uses different routes
const MY_APPLICATIONS = "/trainee/applications";
const SUBMIT_APPLICATION = "/trainee/applications";

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getUserToken()}`,
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Can't reach the server. Make sure the backend is running on port 3000.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      clearUserToken();
      window.location.assign("/signin");
    }
    const error = new Error(data.error || data.message || "Something went wrong. Please try again.");
    error.status = response.status;
    throw error;
  }
  return data;
};

export const fetchMyApplications = () => request(MY_APPLICATIONS);

export const submitApplication = (program) =>
  request(SUBMIT_APPLICATION, { method: "POST", body: JSON.stringify({ program }) });