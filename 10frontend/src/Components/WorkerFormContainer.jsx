/* DARIEL */

import { useState } from "react";

const WorkerFormContainer = ({ onRegister, query, onQueryChange }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleaned = name.trim().replace(/\s+/g, " ");
    if (!cleaned) {
      setError("Enter the worker’s name.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onRegister(cleaned);
      setName("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="FormContainer" className="admin-form-card">
      {/* Search (left) */}
      <div className="search-box">
        <label htmlFor="workerSearch">Search workers</label>

        <div className="search-field">
          <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <input
            type="text"
            id="workerSearch"
            placeholder="Search by name or ID"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => onQueryChange("")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Register (right) */}
      <form id="studentForm" className="register-box" onSubmit={handleSubmit} noValidate>
        <label htmlFor="workerName">Register a new worker</label>

        <div className="input-fields">
          <input
            type="text"
            name="name"
            id="workerName"
            placeholder="Worker’s name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
          <button id="generateBtn" type="submit" disabled={submitting}>
            {submitting ? "Generating..." : "Generate QR Code"}
          </button>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
};

export default WorkerFormContainer;