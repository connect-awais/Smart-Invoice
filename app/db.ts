import Dexie from "dexie";

export interface Client {
  id?: number;
  name: string;
  contact: string;
  history?: string;
}

export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  gst: number;
  barcode?: string;
}

export interface Invoice {
  id?: number;
  clientId: number;
  items: { productId: number; quantity: number; price: number; }[];
  total: number;
  gst: number;
  paid: boolean;
  date: string;
}

export interface Setting {
  id?: number;
  key: string;
  value: string;
}

export class SmartBillDB extends Dexie {
  clients!: Dexie.Table<Client, number>;
  products!: Dexie.Table<Product, number>;
  invoices!: Dexie.Table<Invoice, number>;
  settings!: Dexie.Table<Setting, number>;

  constructor() {
    super("SmartBillDB");
    this.version(2).stores({
      clients: "++id, name, contact",
      products: "++id, name, price, stock, gst, barcode",
      invoices: "++id, clientId, total, paid, date",
      settings: "++id, key, value",
    });
  }
}

export const db = new SmartBillDB(); 