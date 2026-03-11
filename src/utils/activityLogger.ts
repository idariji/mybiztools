/**
 * Activity logger utility for tracking user document actions
 */

interface ActivityEntry {
  id: string;
  type: 'invoice' | 'quotation' | 'receipt' | 'payslip';
  action: 'created' | 'updated';
  label: string; // e.g. "Invoice #INV-001"
  timestamp: string; // ISO string
}

const ACTIVITY_KEY = 'activity-log';
const MAX_ENTRIES = 50;

function readLog(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ActivityEntry[];
  } catch {
    return [];
  }
}

function writeLog(entries: ActivityEntry[]): void {
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries));
  } catch {
    // Silently fail if localStorage is full
  }
}

export function logActivity(
  type: ActivityEntry['type'],
  action: ActivityEntry['action'],
  label: string
): void {
  const existing = readLog();
  const newEntry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    action,
    label,
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
  writeLog(updated);
}

export function getRecentActivity(limit = 10): ActivityEntry[] {
  const entries = readLog();
  return entries.slice(0, limit);
}

export function clearActivity(): void {
  localStorage.removeItem(ACTIVITY_KEY);
}
