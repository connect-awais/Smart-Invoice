import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("clients", "./routes/clients.tsx"),
  route("products", "./routes/products.tsx"),
  route("invoices", "./routes/invoices.tsx"),
  route("dashboard", "./routes/dashboard.tsx"),
] satisfies RouteConfig;