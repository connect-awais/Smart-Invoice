# SmartBill

**Empowering Small Businesses with Offline Invoicing, Stock Management & Local Sales Analytics**

SmartBill is a modern, offline-first, fully responsive web app for shopkeepers, freelancers, and wholesalers to manage billing, inventory, and clients — even without an internet connection.

---

## 🌟 Features
- **Client Management:** Save, search, and manage client records with full contact history.
- **Product & Stock Management:** Add products with pricing, stock quantity, GST/tax, and barcode/QR support.
- **Smart Invoicing:** Instantly generate invoices, auto-calculate totals, and track payments.
- **Offline-First & Local Storage:** All data is saved in-browser using IndexedDB (Dexie.js). No backend or login required.
- **Sales Dashboard:** Graphical analytics to track daily/monthly revenue, best-selling products, and outstanding payments.
- **Barcode/QR Scanning:** Scan product barcodes to auto-fill details and update stock.
- **Responsive UI:** Works beautifully on desktop and mobile with a modern sidebar/hamburger menu.
- **Daily Sales Email:** Send daily sales summary to your email using EmailJS.

---

## 🛠️ Tech Stack
- **Frontend:** React.js (Vite) + CSS (custom, mobile-first)
- **Local Database:** IndexedDB (via Dexie.js)
- **PDF Generation:** jsPDF or html2pdf (future)
- **Charts:** SVG/JS (no external chart lib required)
- **Offline Support:** PWA-ready (Service Worker, future)
- **Barcode/QR:** react-qr-barcode-scanner
- **Email:** EmailJS

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/smartbill.git
cd smartbill
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

### 4. Open in your browser
Go to [http://localhost:5173](http://localhost:5173)

---

## 📱 Mobile Friendly
- The app is fully responsive. Try it on your phone or resize your browser!
- Hamburger menu and overlay navigation for easy mobile use.

---

## ⚡ Usage Notes
- **Offline:** All data is stored locally in your browser. No internet required for daily use.
- **Barcode/QR:** Use your device camera to scan product barcodes for fast stock management.
- **EmailJS:** Configure your EmailJS credentials in `dashboard.tsx` to enable daily sales emails.
- **Stock Management:** Product stock is auto-decremented on each sale/invoice.

---

## 📝 License
MIT
Develop By Abdul Raheem