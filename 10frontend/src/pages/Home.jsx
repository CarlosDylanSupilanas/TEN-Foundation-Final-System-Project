/* KE */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { isAdminSignedIn, isTraineeSignedIn } from "../utils/auth";
import "../site.css";

const Icon = ({ children }) => (
  <span className="tr-icon-wrap" aria-hidden="true">
    <svg className="tr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </span>
);

const PROGRAMS = [
  {
    name: "Cutting Program",
    text: "Learn pattern cutting, fabric handling, and accurate preparation for production.",
    icon: (
      <Icon>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </Icon>
    ),
  },
  {
    name: "Sewing Program",
    text: "Build skill in machine operation, stitching techniques, and garment assembly.",
    icon: (
      <Icon>
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </Icon>
    ),
  },
  {
    name: "Designing Program",
    text: "Develop sketching, pattern making, and garment design from concept to finish.",
    icon: (
      <Icon>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </Icon>
    ),
  },
];

const STEPS = [
  { title: "Create an account", text: "Register with your details, or sign in if you already have an account." },
  { title: "Apply for a program", text: "Choose Cutting, Sewing, or Designing and submit your application." },
  { title: "Evaluation and CI", text: "Your application is evaluated, then moves to character investigation." },
  { title: "Decision", text: "Your status changes to Accepted or Rejected on your training page." },
];

// Sample application shown in the hero card
const STAGES = [
  { name: "Application submitted", note: "Documents received", state: "done" },
  { name: "Evaluation", note: "Reviewed by the foundation", state: "done" },
  { name: "Character investigation", note: "For CI", state: "current" },
  { name: "Decision", note: "Accepted or Rejected", state: "todo" },
];

const ABOUT_POINTS = [
  {
    title: "Hands-on learning",
    text: "Every program is built around practical work, not just theory.",
    icon: (
      <Icon>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </Icon>
    ),
  },
  {
    title: "A clear process",
    text: "Apply online and follow your status from review to decision.",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </Icon>
    ),
  },
  {
    title: "Skills for the trade",
    text: "Trainees finish with abilities the garment industry looks for.",
    icon: (
      <Icon>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Icon>
    ),
  },
];

// Contact details
const CONTACTS = [
  {
    label: "Email",
    value: "tenfoundation@gmail.com",
    href: "mailto:tenfoundation@gmail.com",
    icon: (
      <Icon>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </Icon>
    ),
  },
  {
    label: "Phone",
    value: "0912 345 6789",
    href: "tel:+639123456789",
    icon: (
      <Icon>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </Icon>
    ),
  },
  {
    label: "Address",
    value: "Taludtod, Balayan, Batangas",
    icon: (
      <Icon>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </Icon>
    ),
  },
];

const Home = () => {
    const admin = isAdminSignedIn();
  const signedIn = admin || isTraineeSignedIn();
  const rootRef = useRef(null);

  // Reveal the lower sections once, as they scroll into view
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("tr-ready");

    const items = root.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

const target = admin ? "/admin" : "/training";
const targetLabel = admin ? "Open dashboard" : "Go to training";

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollTo = (id) => (event) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="tr-page" ref={rootRef}>
      <header className="tr-header">
        <Link className="tr-brand" to="/" aria-label="TEN Foundation home">
          <span className="tr-brand-mark">TEN</span>
          <span className="tr-brand-text">Foundation</span>
        </Link>

        <nav className="tr-nav-center" aria-label="Main">
          <Link className="tr-link" to="/" onClick={scrollToTop}>Home</Link>
          <a className="tr-link" href="#about" onClick={scrollTo("about")}>About</a>
          <a className="tr-link" href="#contact" onClick={scrollTo("contact")}>Contact</a>
        </nav>

        <div className="tr-nav-actions">
          {signedIn ? (
            <Link className="tr-btn tr-btn-primary" to={target}>{targetLabel}</Link>
          ) : (
            <>
              <Link className="tr-link" to="/signin">Sign in</Link>
              <Link className="tr-btn tr-btn-primary" to="/signin?mode=register">Create account</Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="tr-hero">
          <div className="tr-hero-inner">
            <div className="tr-hero-copy">
              <h1>Hands-on training in cutting, sewing, and designing.</h1>
              <p className="tr-lead">
                TEN Foundation trains people in the skills the garment trade needs.
                Create an account, apply to a program, and follow your application from review to decision.
              </p>
            </div>

            <figure className="tr-track-card" aria-label="Sample application progress">
              <figcaption>
                <span className="tr-track-kicker">Sample application</span>
                <strong>Sewing Program</strong>
              </figcaption>
              <ol className="tr-track">
                {STAGES.map((s, i) => (
                  <li key={s.name} data-state={s.state} style={{ "--i": i }}>
                    <span className="tr-dot" aria-hidden="true" />
                    <span className="tr-track-text">
                      <span className="tr-track-name">{s.name}</span>
                      <small>{s.note}</small>
                    </span>
                  </li>
                ))}
              </ol>
            </figure>
          </div>
          <div className="tr-stitch" aria-hidden="true" />
        </section>

        <section className="tr-section" aria-labelledby="tr-programs-title">
          <h2 id="tr-programs-title">Training programs</h2>
          <p className="tr-section-intro">Three focused programs, each built around practical work.</p>
          <div className="tr-programs">
            {PROGRAMS.map((p, i) => (
              <article className="tr-program tr-reveal" data-reveal style={{ "--i": i }} key={p.name}>
                {p.icon}
                <h3>{p.name}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tr-section tr-tint" aria-labelledby="tr-steps-title">
          <h2 id="tr-steps-title">How applying works</h2>
          <p className="tr-section-intro">Every application passes through the same four stages.</p>
          <ol className="tr-steps">
            {STEPS.map((s, i) => (
              <li className="tr-reveal" data-reveal style={{ "--i": i }} key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="tr-about" id="about" aria-labelledby="tr-about-title">
          <div className="tr-about-inner">
            <div className="tr-about-copy">
              <span className="tr-about-kicker">About us</span>
              <h2 id="tr-about-title">Building skills for the garment trade.</h2>
              <div className="tr-about-line" aria-hidden="true" />
              <p>
                TEN Foundation trains people in the skills the garment trade needs.
                Our Cutting, Sewing, and Designing programs are built around practical,
                hands-on work, so trainees finish with skills they can use right away.
              </p>
              <p>
                From the first application to the final decision, we keep the process
                simple and open, so every applicant knows where they stand.
              </p>
            </div>

            <div className="tr-about-points">
              {ABOUT_POINTS.map((p) => (
                <article className="tr-about-point" key={p.title}>
                  {p.icon}
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="tr-contact" id="contact" aria-labelledby="tr-contact-title">
          <div className="tr-contact-inner">
            <span className="tr-contact-kicker">Get in touch</span>
            <h2 id="tr-contact-title">Contact us</h2>
            <p className="tr-contact-intro">
              Have a question about the programs or your application? We would be glad to hear from you.
            </p>

            <div className="tr-contact-grid">
              {CONTACTS.map((c) => {
                const body = (
                  <>
                    {c.icon}
                    <span className="tr-contact-label">{c.label}</span>
                    <span className="tr-contact-value">{c.value}</span>
                  </>
                );
                return c.href ? (
                  <a className="tr-contact-card" href={c.href} key={c.label}>
                    {body}
                  </a>
                ) : (
                  <div className="tr-contact-card" key={c.label}>
                    {body}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="tr-footer">TEN Foundation Training Programs</footer>
    </div>
  );
};

export default Home;