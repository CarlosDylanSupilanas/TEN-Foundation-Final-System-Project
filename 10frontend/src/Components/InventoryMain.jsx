import { useState } from "react";
import { BAG_URL } from "../api/bagApi";
import "../StyleInventory.css";

function InventoryMain({ bags, loadBags }) {

  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("");

  // null = adding a new bag, a number = editing the bag with that id
  const [editingId, setEditingId] = useState(null);

  // Empties the form
  function clearForm() {
    setProductName("");
    setProductCode("");
    setCategory("");
    setColor("");
    setQuantity("");
    setEditingId(null);
  }

  // Add a new bag OR save the changes of an edited bag
  async function handleSubmit(event) {
    event.preventDefault();

    const bagData = {
      productName: productName,
      productCode: productCode,
      category: category,
      color: color,
      quantity: Number(quantity),
    };

    let url = BAG_URL;
    let method = "POST";

    if (editingId !== null) {
      url = BAG_URL + "/" + editingId;
      method = "PUT";
    }

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bagData),
    });

    const data = await response.json();

    // The backend says no (for example, duplicate product code)
    if (!response.ok) {
      alert(data.message);
      return;
    }

    clearForm();
    loadBags(); // refresh the table
  }

  // Put the bag's values into the form so they can be changed
  function handleEdit(bag) {
    setEditingId(bag.id);
    setProductName(bag.productName);
    setProductCode(bag.productCode);
    setCategory(bag.category);
    setColor(bag.color);
    setQuantity(bag.quantity);
  }

  async function handleDelete(id) {
    await fetch(BAG_URL + "/" + id, { method: "DELETE" });
    clearForm();
    loadBags(); // refresh the table
  }

  return (
    <>
      <div className="card">

        <h2>Manage Bag Records</h2>

        <form onSubmit={handleSubmit}>

          <input type="text" placeholder="Product Name" required
            value={productName}
            onChange={(e) => setProductName(e.target.value)} />

          <input type="text" placeholder="Product Code" required
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)} />

          <input type="text" placeholder="Category" required
            value={category}
            onChange={(e) => setCategory(e.target.value)} />

          <input type="text" placeholder="Color" required
            value={color}
            onChange={(e) => setColor(e.target.value)} />

          <input type="number" placeholder="Quantity" required min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)} />

          <button type="submit" className="buttonTab">
            {editingId === null ? "Add Bag" : "Save Changes"}
          </button>

          {editingId !== null && (
            <button type="button" className="buttonTab buttonGray" onClick={clearForm}>
              Cancel
            </button>
          )}

        </form>

        <h3>Bag List</h3>

        <section className="table">

          <article className="tableHeader">
            <div>Product Name</div>
            <div>Product Code</div>
            <div>Category</div>
            <div>Color</div>
            <div>Quantity</div>
            <div>Action</div>
          </article>

          {bags.length === 0 && (
            <article className="tableRow">No bags yet.</article>
          )}

          {bags.map((bag) => (
            <article className="tableRow" key={bag.id}>
              <div>{bag.productName}</div>
              <div>{bag.productCode}</div>
              <div>{bag.category}</div>
              <div>{bag.color}</div>
              <div>{bag.quantity}</div>
              <div>
                <button type="button" className="buttonTab buttonEdit" onClick={() => handleEdit(bag)}>
                  Edit
                </button>
                <button type="button" className="buttonTab buttonDelete" onClick={() => handleDelete(bag.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}

        </section>

      </div>
    </>
  );

}

export default InventoryMain;