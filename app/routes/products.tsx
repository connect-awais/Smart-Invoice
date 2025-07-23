import React, { useEffect, useState } from "react";
import { db } from "../db";
import type { Product } from "../db";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

// Define default form values
const DEFAULT_FORM: Product = {
  name: "",
  price: 0,
  stock: 0,
  gst: 0,
  barcode: ""
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>({ ...DEFAULT_FORM });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setIsLoading(true);
    setError(null);
    try {
      const all = await db.products.toArray();
      setProducts(all);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate form
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (form.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (form.stock < 0) {
      setError("Stock cannot be negative");
      return;
    }
    if (form.gst < 0) {
      setError("GST cannot be negative");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (editingId) {
        await db.products.update(editingId, form);
        setEditingId(null);
      } else {
        await db.products.add(form);
      }
      setForm({ ...DEFAULT_FORM });
      await loadProducts();
    } catch (err) {
      console.error("Failed to save product:", err);
      setError("Failed to save product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(product: Product) {
    setForm({ ...product });
    setEditingId(product.id!);
    setError(null);
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsLoading(true);
    try {
      await db.products.delete(id);
      await loadProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError("Failed to delete product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBarcodeScan(barcode: string) {
    setShowScanner(false);
    if (!barcode) return;
    
    setForm(prev => ({ ...prev, barcode }));
    
    try {
      const found = await db.products.where("barcode").equals(barcode).first();
      if (found) {
        setForm({ ...found });
        setEditingId(found.id!);
      }
    } catch (err) {
      console.error("Failed to search product:", err);
    }
  }

  return (
    <div className="products-page">
      <h1>Products</h1>
      
      {error && (
        <div className="error-message" style={{ color: "red", margin: "1rem 0" }}>
          {error}
        </div>
      )}
      
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price (₹)</label>
            <input
              id="price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              min="0"
              step="0.01"
              required
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock"
              min="0"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="gst">GST (%)</label>
            <input
              id="gst"
              name="gst"
              type="number"
              value={form.gst}
              onChange={handleChange}
              placeholder="GST"
              min="0"
              step="0.1"
              required
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="barcode">Barcode</label>
            <input
              id="barcode"
              name="barcode"
              value={form.barcode}
              onChange={handleChange}
              placeholder="Scan or enter barcode"
              disabled={isLoading}
            />
          </div>
          <div className="form-group" style={{ flex: 1, alignSelf: "flex-end" }}>
            <button 
              type="button" 
              onClick={() => setShowScanner(true)} 
              style={{ width: "100%", marginTop: 22 }}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Scan Barcode"}
            </button>
          </div>
        </div>
        
        {showScanner && (
          <div style={{ 
            margin: "1rem 0", 
            background: "#fff", 
            borderRadius: 8, 
            boxShadow: "0 2px 8px #0001", 
            padding: 16 
          }}>
            <BarcodeScannerComponent
              width={350}
              height={200}
              onUpdate={(err, result) => {
                if (err) {
                  console.error("Scanner error:", err);
                  return;
                }
                if (result) {
                  handleBarcodeScan(result.getText());
                }
              }}
            />
            <button 
              type="button" 
              onClick={() => setShowScanner(false)} 
              style={{ marginTop: 8 }}
              disabled={isLoading}
            >
              Close Scanner
            </button>
          </div>
        )}
        
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : editingId ? "Update" : "Add"} Product
          </button>
          
          {editingId && (
            <button 
              type="button" 
              onClick={() => { 
                setForm({ ...DEFAULT_FORM }); 
                setEditingId(null); 
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      {isLoading && products.length === 0 ? (
        <div style={{ textAlign: "center", margin: "2rem 0" }}>Loading products...</div>
      ) : (
        <div className="product-list-wrapper">
          <table className="product-list">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>GST (%)</th>
                <th>Barcode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>₹{product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>{product.gst}</td>
                  <td>{product.barcode || "-"}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(product)}
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    No products found. Add your first product!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}