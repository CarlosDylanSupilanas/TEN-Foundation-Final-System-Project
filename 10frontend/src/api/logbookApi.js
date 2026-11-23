// 1.1.2

import { API_URL, getLogbookToken, clearLogbookToken } from "../utils/auth";

// Sends the text read from a QR code to the backend for checking
export const scanQr = async (qr) => {
  let response;
  try {
    response = await fetch(`${API_URL}/logbook/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getLogbookToken()}`,
      },
      body: JSON.stringify({ qr }),
    });
  } catch {
    throw new Error("Can't reach the server. Make sure the backend is running on port 3000.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      clearLogbookToken();
      window.location.assign("/signin");
    }
    const error = new Error(data.error || "Something went wrong. Please try again.");
    error.code = data.code;
    error.status = response.status;
    throw error;
  }
  return data;
};