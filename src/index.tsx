import './index.css';
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { API_BASE_URL } from './config/apiConfig';

// Ping the backend on load so Render free tier starts waking up
fetch(`${API_BASE_URL}/health`, { method: 'GET' }).catch(() => {});

const root = createRoot(document.getElementById("root")!);
root.render(<App />);