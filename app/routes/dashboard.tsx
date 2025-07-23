import React, { useEffect, useState } from "react";
import { db } from "../db";
import emailjs from "@emailjs/browser";

export default function Dashboard() {
  const [clientCount, setClientCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesData, setSalesData] = useState<{ date: string; total: number }[]>([]);
  const [sending, setSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const clients = await db.clients.count();
    const products = await db.products.count();
    const invoices = await db.invoices.toArray();
    setClientCount(clients);
    setProductCount(products);
    setInvoiceCount(invoices.length);
    setTotalRevenue(invoices.reduce((sum, inv) => sum + inv.total, 0));
    // Sales by date (last 7 days)
    const salesMap: Record<string, number> = {};
    invoices.forEach((inv) => {
      const d = new Date(inv.date).toLocaleDateString();
      salesMap[d] = (salesMap[d] || 0) + inv.total;
    });
    const sorted = Object.entries(salesMap)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7)
      .map(([date, total]) => ({ date, total }));
    setSalesData(sorted);
  }

  async function sendDailySalesEmail() {
    setSending(true);
    setEmailMsg("");
    // Get today's sales
    const today = new Date().toLocaleDateString();
    const invoices = await db.invoices.toArray();
    const todaysInvoices = invoices.filter(inv => new Date(inv.date).toLocaleDateString() === today);
    const total = todaysInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const items = todaysInvoices.map(inv => `Invoice #${inv.id}: ₨${inv.total.toFixed(2)}`).join("\n");
    const templateParams = {
      date: today,
      total: `₨${total.toFixed(2)}`,
      items: items || "No sales today.",
      to_email: "shopkeeper@email.com" // <-- Replace with your email or use template variable
    };
    try {
      await emailjs.send(
        "service_ola374j", // <-- Replace with your EmailJS service ID
        "template_7l8ffstad", // <-- Replace with your EmailJS template ID
        templateParams,
        "mwAlHbvd0iWdsD8m3" // <-- Replace with your EmailJS public key
      );
      setEmailMsg("Daily sales email sent!");
    } catch (err) {
      setEmailMsg("Failed to send email. Check your EmailJS config.");
    }
    setSending(false);
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: 32 }}>
        <div style={cardStyle}><div style={labelStyle}>Clients</div><div style={valueStyle}>{clientCount}</div></div>
        <div style={cardStyle}><div style={labelStyle}>Products</div><div style={valueStyle}>{productCount}</div></div>
        <div style={cardStyle}><div style={labelStyle}>Invoices</div><div style={valueStyle}>{invoiceCount}</div></div>
        <div style={cardStyle}><div style={labelStyle}>Total Revenue</div><div style={valueStyle}>₨{totalRevenue.toFixed(2)}</div></div>
      </div>
      <button onClick={sendDailySalesEmail} disabled={sending} style={{ marginBottom: 16 }}>
        {sending ? "Sending..." : "Send Daily Sales Email"}
      </button>
      {emailMsg && <div style={{ marginBottom: 16, color: emailMsg.includes("sent") ? "green" : "red" }}>{emailMsg}</div>}
      <h2 style={{ margin: "2rem 0 1rem 0", fontSize: 20 }}>Sales (Last 7 Days)</h2>
      <div style={{ width: "100%", maxWidth: 500, minHeight: 220, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001", padding: 16 }}>
        {salesData.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888" }}>No sales data yet.</div>
        ) : (
          <svg width="100%" height="180" viewBox="0 0 500 180">
            {/* Axis */}
            <line x1="40" y1="10" x2="40" y2="160" stroke="#bbb" strokeWidth="2" />
            <line x1="40" y1="160" x2="480" y2="160" stroke="#bbb" strokeWidth="2" />
            {/* Bars */}
            {salesData.map((d, i) => {
              const max = Math.max(...salesData.map(s => s.total), 1);
              const barHeight = (d.total / max) * 120;
              return (
                <g key={d.date}>
                  <rect x={60 + i * 60} y={160 - barHeight} width={40} height={barHeight} fill="#2d8cff" rx={6} />
                  <text x={80 + i * 60} y={175} fontSize={12} textAnchor="middle" fill="#232e3a">{d.date}</text>
                  <text x={80 + i * 60} y={160 - barHeight - 8} fontSize={12} textAnchor="middle" fill="#2d8cff">₨{d.total.toFixed(0)}</text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 2px 8px #0001",
  padding: "1.2rem 2rem",
  minWidth: 120,
  textAlign: "center" as const,
  flex: 1,
};
const labelStyle = { color: "#888", fontSize: 15, marginBottom: 6 };
const valueStyle = { fontWeight: 800, fontSize: 28, color: "#232e3a" }; 