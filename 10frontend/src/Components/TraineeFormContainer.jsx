/* KE */

import { useState } from "react";

const PROGRAMS = ["Cutting Program", "Sewing Program", "Designing Program"];

const EMPTY = { name: "", email: "", password: "", contact: "", address: "", program: "" };

const COPY = {
  register: {
    title: "Create Account",
    intro: "Register as a new trainee applicant.",
    submit: "Create Account",
    busy: "Creating...",
    switchText: "Already have an account?",
    switchLabel: "Sign In",
    switchTo: "login",
  },
  login: {
    title: "Applicant Sign In",
    intro: "Enter your registered account details.",
    submit: "Sign In",
    busy: "Signing in...",
    switchText: "Don't have an account?",
    switchLabel: "Create Account",
    switchTo: "register",
  },
  apply: {
    title: "Training Application",
    intro: "Select your preferred training program.",
    submit: "Submit Application",
    busy: "Submitting...",
  },
};

// mode: "register" | "login" | "apply"
const TraineeFormContainer = ({ mode, onSubmit, onNavigate }) => {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const copy = COPY[mode];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleaned = {
      name: form.name.trim().replace(/\s+/g, " "),
      email: form.email.trim(),
      password: form.password,
      contact: form.contact.trim(),
      address: form.address.trim().replace(/\s+/g, " "),
      program: form.program,
    };

    if (mode === "register" && Object.entries(cleaned).some(([k, v]) => k !== "program" && !v)) {
      setError("Please complete all fields.");
      return;
    }
    if (mode === "login" && (!cleaned.email || !cleaned.password)) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "apply" && !cleaned.program) {
      setError("Please select a training program.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onSubmit(mode === "apply" ? cleaned.program : cleaned);
      setForm(EMPTY);
      setSubmitting(false);
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  return (
    <section id="FormContainer" className={mode === "apply" ? "section-card" : "form-card"}>
      <h1>{copy.title}</h1>
      <p>{copy.intro}</p>

      <form id={`${mode}Form`} onSubmit={handleSubmit} noValidate>
        {mode === "register" && (
          <>
            <label htmlFor="traineeName">Full Name</label>
            <input id="traineeName" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" autoComplete="name" />
          </>
        )}

        {mode !== "apply" && (
          <>
            <label htmlFor="traineeEmail">Email Address</label>
            <input id="traineeEmail" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" autoComplete="email" />

            <label htmlFor="traineePassword">Password</label>
            <input
              id="traineePassword"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={mode === "register" ? "Create a password" : "Enter your password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </>
        )}

        {mode === "register" && (
          <>
            <label htmlFor="traineeContact">Contact Number</label>
            <input id="traineeContact" name="contact" value={form.contact} onChange={handleChange} placeholder="Enter your contact number" autoComplete="tel" />

            <label htmlFor="traineeAddress">Address</label>
            <input id="traineeAddress" name="address" value={form.address} onChange={handleChange} placeholder="Enter your address" autoComplete="street-address" />
          </>
        )}

        {mode === "apply" && (
          <>
            <label>Available Training Programs</label>
            {PROGRAMS.map((program) => (
              <label className="program-card" key={program}>
                <input type="radio" name="program" value={program} checked={form.program === program} onChange={handleChange} />
                <span>{program}</span>
              </label>
            ))}
          </>
        )}

        <button type="submit" className="primary-btn" disabled={submitting}>
          {submitting ? copy.busy : copy.submit}
        </button>

        {error && (
          <p className="message form-error" role="alert"> {error} </p>
        )}
      </form>

      {copy.switchTo && (
        <p>
          {copy.switchText}
          <button type="button" onClick={() => onNavigate(copy.switchTo)}>
            {copy.switchLabel}
          </button>
        </p>
      )}
    </section>
  );
};

export default TraineeFormContainer;