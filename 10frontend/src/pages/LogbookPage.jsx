
// DARIEL
// 1.1.2

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { scanQr, fetchToday } from "../api/logbookApi";
import {
  loadLatestEvent,
  saveLatestEvent,
  loadTodayRecords,
  saveTodayRecords,
  upsertRecord,
} from "../utils/attendanceStorage";
import { clearLogbookToken } from "../utils/auth";
import "../logbook.css";

const READER_ID = "qr-reader";
const PAUSE_MS = 2500; // wait between scans so one QR isn't sent many times
const CAMERAS = [{ facingMode: "environment" }, { facingMode: "user" }];

const STATUS_TEXT = {
  idle: "Scanner is off. Click Start Scanner.",
  starting: "Starting the camera...",
  scanning: "Scanning. Hold a QR code in front of the camera.",
  stopped: "Scanner stopped.",
  error: "Scanner error.",
};

// Backend error code -> message style
const RESULT_BY_CODE = {
  INVALID_QR: "invalid",
  UNREGISTERED: "unregistered",
  ALREADY_LOGGED: "duplicate",
  COMPLETED: "duplicate",
};


const ACTION_LABEL = { TIME_IN: "Time In", TIME_OUT: "Time Out" };

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })
    : "—";

  const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : "—";

const LogbookPage = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const busyRef = useRef(false);

  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null); // { type, text }


  const [latest, setLatest] = useState(loadLatestEvent);
  const [today, setToday] = useState(loadTodayRecords);
  const [todayError, setTodayError] = useState("");

  const refreshToday = async () => {
    try {
      const data = await fetchToday();
      setToday(data.records);
      saveTodayRecords(data.records);
      setTodayError("");
    } catch (e) {
      setTodayError(`${e.message} Showing activity saved in this browser.`);
    }
  };

  useEffect(() => {
    refreshToday();
  }, []);


  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      await scanner.stop();
    } catch {
      // already stopped
    }
    try {
      scanner.clear();
    } catch {
      // ignore
    }
  };

  // Turn the camera off when leaving the page
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleScan = async (text) => {
    if (busyRef.current) return;
    busyRef.current = true;

    try {

      const data = await scanQr(text);
      const record = data.attendance;

      setResult({
        type: "success",
        text: `${data.message} (${formatTime(data.recordedAt)})`,
      });

      const event = {
        workerId: record.workerId,
        name: record.name,
        action: data.action,
        timeIn: record.timeIn,
        timeOut: record.timeOut,
        recordedAt: data.recordedAt,
      };
      setLatest(event);
      saveLatestEvent(event);

      const records = upsertRecord(loadTodayRecords(), record);
      setToday(records);
      saveTodayRecords(records);

      refreshToday();


    } catch (e) {
      setResult({ type: RESULT_BY_CODE[e.code] || "error", text: e.message });
    } finally {
      setTimeout(() => {
        busyRef.current = false;
      }, PAUSE_MS);
    }
  };

  const handleStart = async () => {
    if (scannerRef.current) return;

    setResult(null);
    setStatus("starting");

    const scanner = new Html5Qrcode(READER_ID);
    scannerRef.current = scanner;

    let started = false;
    for (const camera of CAMERAS) {
      try {
        await scanner.start(
          camera,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScan,
          () => {} // no QR in this frame: ignore
        );
        started = true;
        break;
      } catch {
        // try the next camera
      }
    }

    if (started) {
      setStatus("scanning");
    } else {
      scannerRef.current = null;
      setStatus("error");
      setResult({
        type: "error",
        text: "Can't open the camera. Allow camera access and close other apps that use it.",
      });
    }
  };

  const handleStop = async () => {
    await stopScanner();
    setStatus("stopped");
  };

  const handleLogout = async () => {
    await stopScanner();
    clearLogbookToken();
    navigate("/signin", { replace: true });
  };

  return (
    <div className="logbook">
      <header className="lb-bar">
        <div className="lb-brand">
          <img className="lb-logo" src="/TEN.jpeg" alt="TEN Foundation logo" />
          <div>
            <h1>TEN Foundation</h1>
            <p>Worker Attendance</p>
          </div>
        </div>
        <button type="button" className="lb-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="lb-content">
        <section className="lb-card">
          <h2>QR scanner</h2>
          <p className="lb-muted">Scan a worker's QR code to record attendance.</p>

          <div className="lb-status-row">
            <span>Scanner status:</span>
            <span className={`lb-status lb-status-${status}`}>{STATUS_TEXT[status]}</span>
          </div>

          <div className="lb-scanner-box">
            <div id={READER_ID} className="lb-reader" />
            {status !== "scanning" && status !== "starting" && (
              <p className="lb-placeholder">Camera is off</p>
            )}
          </div>

          <div className="lb-actions">
            <button
              type="button"
              className="lb-btn lb-btn-start"
              onClick={handleStart}
              disabled={status === "starting" || status === "scanning"}
            >
              Start Scanner
            </button>
            <button
              type="button"
              className="lb-btn lb-btn-stop"
              onClick={handleStop}
              disabled={status !== "scanning"}
            >
              Stop Scanner
            </button>
          </div>

          {result && (
            <p className={`lb-result lb-result-${result.type}`} role="status">
              {result.text}
            </p>
          )}

        </section>


        <div className="lb-side">
        <section className="lb-card lb-section">
          <h2>Latest attendance event</h2>
          {latest ? (
            <div className="lb-latest">
              <div>
                <p className="lb-latest-name">{latest.name}</p>
                <p className="lb-muted lb-latest-id">{latest.workerId}</p>
              </div>
              <span className={`lb-badge lb-badge-${latest.action === "TIME_IN" ? "in" : "out"}`}>
                {ACTION_LABEL[latest.action] || latest.action}
              </span>
              <p className="lb-latest-time">{formatTime(latest.recordedAt)}</p>
            </div>
          ) : (
            <p className="lb-muted">No attendance recorded yet.</p>
          )}
        </section>

        <section className="lb-card lb-section lb-today">
          <div className="lb-section-head">
            <h2>Today's Activity <span className="lb-muted">· {formatDate(new Date())}</span></h2>
            <span className="lb-muted">{today.length} record{today.length === 1 ? "" : "s"}</span>
          </div>

          {todayError && <p className="lb-result lb-result-unregistered">{todayError}</p>}

          {today.length === 0 ? (
            <p className="lb-muted">No activity yet today.</p>
          ) : (
            <div className="lb-table-wrap">
              <table className="lb-table">
                <thead>
  <tr>
    <th>Worker</th>
    <th>ID</th>
    <th>Date</th>
    <th>Time In</th>
    <th>Time Out</th>
    <th>Status</th>
  </tr>
</thead>
<tbody>
  {today.map((r) => (
    <tr key={r.id}>
      <td>{r.name}</td>
      <td>{r.workerId}</td>
      <td>{formatDate(r.timeIn)}</td>
      <td>{formatTime(r.timeIn)}</td>
      <td>{formatTime(r.timeOut)}</td>
      <td>
        <span className={`lb-badge lb-badge-${r.timeOut ? "out" : "in"}`}>
          {r.timeOut ? "OUT" : "IN"}
        </span>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          )}
        </section>
        </div>
      </main>
    </div>
  );
};

export default LogbookPage;