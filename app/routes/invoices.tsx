import React, { useEffect, useState } from "react";
import { db } from "../db";
import type { Client, Product, Invoice } from "../db";

interface InvoiceFormItem {
  productId: number;
  quantity: number;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<{
    clientId: number | "";
    items: InvoiceFormItem[];
  }>({ clientId: "", items: [] });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setInvoices(await db.invoices.toArray());
    setClients(await db.clients.toArray());
    setProducts(await db.products.toArray());
  }

  function handleFormChange(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>, idx?: number) {
    if (e.target.name === "clientId") {
      setForm({ ...form, clientId: Number(e.target.value) });
    } else if (e.target.name === "productId" && idx !== undefined) {
      const items = [...form.items];
      items[idx].productId = Number(e.target.value);
      setForm({ ...form, items });
    } else if (e.target.name === "quantity" && idx !== undefined) {
      const items = [...form.items];
      items[idx].quantity = Number(e.target.value);
      setForm({ ...form, items });
    }
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, { productId: products[0]?.id || 0, quantity: 1 }] });
  }

  function removeItem(idx: number) {
    const items = [...form.items];
    items.splice(idx, 1);
    setForm({ ...form, items });
  }

  function calcTotals() {
    let total = 0;
    let gst = 0;
    form.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        total += product.price * item.quantity;
        gst += ((product.price * product.gst) / 100) * item.quantity;
      }
    });
    return { total, gst };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientId || form.items.length === 0) return;
    // Check stock for each product
    for (const item of form.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        alert(`Insufficient stock for product: ${product ? product.name : 'Unknown'}`);
        return;
      }
    }
    const { total, gst } = calcTotals();
    const invoice: Invoice = {
      clientId: Number(form.clientId),
      items: form.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product ? product.price : 0,
        };
      }),
      total,
      gst,
      paid: false,
      date: new Date().toISOString(),
    };
   if (editingId) {
  await db.invoices.update(editingId, (obj) => {
    Object.assign(obj, invoice);
  });
  setEditingId(null);
}else {
      await db.invoices.add(invoice);
      // Decrement stock for each product
      for (const item of form.items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          await db.products.update(product.id!, { stock: product.stock - item.quantity });
        }
      }
    }
    setForm({ clientId: "", items: [] });
    loadAll();
  }

  async function markPaid(id?: number, paid?: boolean) {
    if (!id) return;
    await db.invoices.update(id, { paid: !paid });
    loadAll();
  }

  return (
    <div className="invoices-page">
      <h1>Invoices</h1>
      <form className="invoice-form" onSubmit={handleSubmit}>
        <select name="clientId" value={form.clientId} onChange={handleFormChange} required>
          <option value="">Select Client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {form.items.map((item, idx) => (
          <div className="invoice-item-row" key={idx}>
            <select name="productId" value={item.productId} onChange={(e) => handleFormChange(e, idx)} required>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              name="quantity"
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => handleFormChange(e, idx)}
              required
            />
            <button type="button" onClick={() => removeItem(idx)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addItem} disabled={products.length === 0}>Add Product</button>
        <div className="invoice-totals">
          <span>Total: ₨{calcTotals().total.toFixed(2)}</span>
          <span>GST: ₨{calcTotals().gst.toFixed(2)}</span>
        </div>
        <button type="submit">{editingId ? "Update" : "Create"} Invoice</button>
      </form>
      <div className="invoice-list-wrapper">
        <table className="invoice-list">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Total</th>
              <th>GST</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const client = clients.find((c) => c.id === inv.clientId);
              return (
                <tr key={inv.id}>
                  <td>{new Date(inv.date).toLocaleDateString()}</td>
                  <td>{client ? client.name : "Unknown"}</td>
                  <td>₨{inv.total.toFixed(2)}</td>
                  <td>₨{inv.gst.toFixed(2)}</td>
                  <td>{inv.paid ? "Paid" : "Unpaid"}</td>
                  <td>
                    <button onClick={() => markPaid(inv.id, inv.paid)}>{inv.paid ? "Mark Unpaid" : "Mark Paid"}</button>
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 