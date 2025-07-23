import React from "react";

export default function Home() {
  return (
    <div className="home-dashboard">
      <h1>Welcome to SmartBill</h1>
      <p>
        Manage your invoices, products, clients, and view sales analytics — all offline and securely on your device.
      </p>
      <ul>
        <li>• Fast, offline-first billing</li>
        <li>• Stock & product management</li>
        <li>• Professional PDF invoices</li>
        <li>• Sales dashboard & analytics</li>
      </ul>
      <p style={{marginTop: '2rem', color: '#888'}}>Get started by adding your first client or product!</p>
    </div>
  );
}
