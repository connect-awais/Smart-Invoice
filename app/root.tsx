import React, { useState, useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Link } from "react-router-dom";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SmartBill</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth <= 900) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 900;

  return (
    <div className="app-layout">
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-header-row">
          <span className="sidebar-header">SmartBill</span>
          <button
            className="hamburger"
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <span className="hamburger-icon" />
          </button>
        </div>
        {/* Desktop nav stays in sidebar */}
        {!isMobile && (
          <nav className="sidebar-nav">
            <Link to="/">Home</Link>
            <Link to="/clients">Clients</Link>
            <Link to="/products">Products</Link>
            <Link to="/invoices">Invoices</Link>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        )}
      </aside>
      {/* Mobile nav and overlay rendered outside sidebar for proper overlay */}
      {isMobile && sidebarOpen && (
        <>
          <nav className="sidebar-nav sidebar-nav-mobile">
            <Link to="/" onClick={() => setSidebarOpen(false)}>Home</Link>
            <Link to="/clients" onClick={() => setSidebarOpen(false)}>Clients</Link>
            <Link to="/products" onClick={() => setSidebarOpen(false)}>Products</Link>
            <Link to="/invoices" onClick={() => setSidebarOpen(false)}>Invoices</Link>
            <Link to="/dashboard" onClick={() => setSidebarOpen(false)}>Dashboard</Link>
          </nav>
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        </>
      )}
      <main className="main-content fade-in">
        <Outlet />
      </main>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
