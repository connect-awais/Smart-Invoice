import React, { useEffect, useState } from "react";
import { db } from "../db";
import type { Client } from "../db";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<Client>({ name: "", contact: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const all = await db.clients.toArray();
    setClients(all);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) return;
    if (editingId) {
      await db.clients.update(editingId, form);
      setEditingId(null);
    } else {
      await db.clients.add(form);
    }
    setForm({ name: "", contact: "" });
    loadClients();
  }

  function handleEdit(client: Client) {
    setForm({ name: client.name, contact: client.contact });
    setEditingId(client.id!);
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    await db.clients.delete(id);
    loadClients();
  }

  return (
    <div className="clients-page">
      <h1>Clients</h1>
      <form className="client-form" onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Client Name"
          required
        />
        <input
          name="contact"
          value={form.contact}
          onChange={handleChange}
          placeholder="Contact Info"
          required
        />
        <button type="submit">{editingId ? "Update" : "Add"} Client</button>
        {editingId && (
          <button type="button" onClick={() => { setForm({ name: "", contact: "" }); setEditingId(null); }}>
            Cancel
          </button>
        )}
      </form>
      <div className="client-list-wrapper">
        <table className="client-list">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.contact}</td>
                <td>
                  <button onClick={() => handleEdit(client)}>Edit</button>
                  <button onClick={() => handleDelete(client.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 