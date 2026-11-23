import { useState, useEffect } from "react";
import { BAG_URL, INVENTORY_LOGIN_URL } from "../api/bagApi";
import InventoryMain from "../Components/InventoryMain";
import "../StyleInventory.css";

function InventoryPage() {
  const [admin, setAdmin] = useState(() =>
    JSON.parse(sessionStorage.getItem("inventoryAdmin") || "null")
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bags, setBags] = useState([]);

  async function loadBags() {
    try {
      const response = await fetch(BAG_URL);
      const data = await response.json();
      setBags(Array.isArray(data) ? data : []);
    } catch (err) {
      setBags([]);
    }
  }

  useEffect(() => {
    if (admin) loadBags();
  }, [admin]);

  async function handleLogin(event) {
    event.preventDefault();

    const response = await fetch(INVENTORY_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    sessionStorage.setItem("inventoryAdmin", JSON.stringify(data));
    setAdmin(data);
  }

  function handleLogout() {
    sessionStorage.removeItem("inventoryAdmin");
    setAdmin(null);
    setBags([]);
    setEmail("");
    setPassword("");
  }

  // Not logged in -> inventory login form
  if (!admin) {
    return (
      <section className="inventory">
        <h1>Inventory</h1>
        <div className="card">
          <h2>Inventory Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="buttonTab">Login</button>
          </form>
        </div>
      </section>
    );
  }

  // Logged in -> your 2.1.1 code
  return (
    <section className="inventory">
      <h1>Bag Inventory</h1>
      <div className="menu">
        <span></span>
        <button className="buttonTab buttonGray" onClick={handleLogout}>Logout</button>
      </div>
      <InventoryMain bags={bags} loadBags={loadBags} />
    </section>
  );
}

export default InventoryPage;