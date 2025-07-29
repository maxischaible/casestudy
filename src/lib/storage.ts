import { Supplier } from '@/types/domain';

const SHORTLIST_KEY = 'tacto_shortlist';
const SIDEBAR_KEY = 'tacto_sidebar_collapsed';

export function getShortlist(): Supplier[] {
  try {
    const stored = localStorage.getItem(SHORTLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToShortlist(supplier: Supplier): void {
  const current = getShortlist();
  const exists = current.find(s => s.id === supplier.id);
  
  if (!exists) {
    const updated = [...current, supplier];
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(updated));
  }
}

export function removeFromShortlist(supplierId: string): void {
  const current = getShortlist();
  const updated = current.filter(s => s.id !== supplierId);
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(updated));
}

export function isInShortlist(supplierId: string): boolean {
  const shortlist = getShortlist();
  return shortlist.some(s => s.id === supplierId);
}

export function clearShortlist(): void {
  localStorage.removeItem(SHORTLIST_KEY);
}

export function getSidebarCollapsed(): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch {
    return false;
  }
}

export function setSidebarCollapsed(collapsed: boolean): void {
  localStorage.setItem(SIDEBAR_KEY, JSON.stringify(collapsed));
}