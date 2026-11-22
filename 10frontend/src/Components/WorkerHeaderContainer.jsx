/* DARIEL */

const WorkerHeaderContainer = ({ activeTab = "qr", onNavigate, onLogout }) => {
  return (
    <header className="admin-bar">
      <div className="admin-brand">
        <img className="admin-logo" src="/TEN.jpeg" alt="TEN Foundation logo" />
        <div className="admin-title">
          <h1>TEN Foundation</h1>
          <p>Worker QR dashboard</p>
        </div>
      </div>

      <nav className="admin-nav" aria-label="Admin">
        <button
          type="button"
          className={`nav-btn${activeTab === "qr" ? " active" : ""}`}
          onClick={() => activeTab !== "qr" && onNavigate("/admin")}
          aria-current={activeTab === "qr" ? "page" : undefined}
        >
          QR Codes
        </button>
      </nav>

      <button type="button" className="logout" onClick={onLogout}>
        Logout
      </button>
    </header>
  );
};

export default WorkerHeaderContainer;