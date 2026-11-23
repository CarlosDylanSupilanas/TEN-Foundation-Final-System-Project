/* DARIEL AND KE */

import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  isAdminSignedIn,
  isTraineeSignedIn,
  isLogbookSignedIn,
  loginAdmin,
  loginLogbook,
  loginUser,
  registerUser,
} from "../utils/auth";
import "../site.css";

const EMPTY = { name: "", email: "", password: "", contact: "", address: "" };

const COPY = {
  login: {
    title: "Sign in",
    intro: "Enter your registered account details.",
    submit: "Sign in",
    busy: "Signing in...",
    switchText: "Don't have an account?",
    switchLabel: "Create account",
    pitchTitle: "Welcome back.",
    pitchText: "Sign in to check the status of your application and continue your training.",
  },
  register: {
    title: "Create account",
    intro: "Register as a new trainee applicant.",
    submit: "Create account",
    busy: "Creating...",
    switchText: "Already have an account?",
    switchLabel: "Sign in",
    pitchTitle: "Start your training application.",
    pitchText: "Create an account, choose a program, and follow your application to a decision.",
  },
};

// /signin  -> sign in      /signin?mode=register -> create account
const SignIn = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "register" ? "register" : "login";
  const copy = COPY[mode];

  const [form, setForm] = useState(EMPTY);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAdminSignedIn()) {
    return <Navigate to="/admin" replace />;
  }
  if (isTraineeSignedIn()) {
    return <Navigate to="/training" replace />;
  }
  if (isLogbookSignedIn()) {
    return <Navigate to="/logbook" replace />;
  }



  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const switchMode = () => {
    setError("");
    setParams(mode === "login" ? { mode: "register" } : {});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleaned = {
      name: form.name.trim().replace(/\s+/g, " "),
      email: form.email.trim(),
      password: form.password,
      contact: form.contact.trim(),
      address: form.address.trim().replace(/\s+/g, " "),
    };

    if (mode === "register" && Object.values(cleaned).some((v) => !v)) {
      setError("Please complete all fields.");
      return;
    }
    if (mode === "login" && (!cleaned.email || !cleaned.password)) {
      setError("Enter your email and password.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        await registerUser(cleaned);
      } else { 
        
        // Admin
        let isAdmin = false;
        try {
          await loginAdmin(cleaned.email, cleaned.password);
          isAdmin = true;
        } catch {
          // not an admin (or the server is off): try trainee login below
        }

        if (isAdmin) {
          navigate("/admin", { replace: true });
          return;
        }

        // Logbook
                let isLogbook = false;
        try {
          await loginLogbook(cleaned.email, cleaned.password);
          isLogbook = true;
        } catch {
          // not the logbook account: try trainee login below
        }

        if (isLogbook) {
          navigate("/logbook", { replace: true });
          return;
        }

        await loginUser(cleaned.email, cleaned.password);
      }
      navigate("/training", { replace: true });
    } catch (e) {
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tr-page tr-auth">
      <aside className="tr-auth-side">
        <Link className="tr-brand tr-brand-light" to="/" aria-label="TEN Foundation home">
          <span className="tr-brand-mark tr-brand-mark-light">TEN</span>
          <span className="tr-brand-text">Foundation</span>
        </Link>

        <div className="tr-auth-pitch" key={mode}>
          <h2>{copy.pitchTitle}</h2>
          <p>{copy.pitchText}</p>
        </div>

        <p className="tr-auth-foot">TEN Foundation Training Programs</p>
      </aside>

      <main className="tr-auth-main">
        <Link className="tr-link tr-auth-back" to="/">Back to home</Link>

        <form className="tr-card" onSubmit={handleSubmit} noValidate>
          <div className="tr-card-head">
            <h1>{copy.title}</h1>
            <p className="tr-muted">{copy.intro}</p>
          </div>

          {mode === "register" && (
            <>
              <label htmlFor="auth-name">Full name</label>
              <input id="auth-name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" autoComplete="name" />
            </>
          )}

          <label htmlFor="auth-email">Email address</label>
          <input id="auth-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" autoComplete="email" />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={mode === "register" ? "Create a password" : "Enter your password"}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />

          <label className="tr-check" htmlFor="auth-show">
            <input
              id="auth-show"
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>

          {mode === "register" && (
            <>
              <label htmlFor="auth-contact">Contact number</label>
              <input id="auth-contact" type="text" inputMode="tel" name="contact" value={form.contact} onChange={handleChange} placeholder="Enter your contact number" autoComplete="tel" />

              <label htmlFor="auth-address">Address</label>
              <input id="auth-address" type="text" name="address" value={form.address} onChange={handleChange} placeholder="Enter your address" autoComplete="street-address" />
            </>
          )}

          {error && (
            <p className="tr-form-error" role="alert">{error}</p>
          )}

          <button className="tr-btn tr-btn-primary tr-btn-block" type="submit" disabled={submitting}>
            {submitting ? copy.busy : copy.submit}
          </button>

          <p className="tr-switch">
            {copy.switchText}
            <button type="button" onClick={switchMode}>{copy.switchLabel}</button>
          </p>
        </form>
      </main>
    </div>
  );
};

export default SignIn;