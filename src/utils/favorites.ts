import { useState, useCallback, useEffect } from 'react';

const KEY = 'nexttool-favorites';

let store: string[] | null = null;
const listeners = new Set<() => void>();

const read = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};

const getStore = (): string[] => {
  if (!store) store = read();
  return store;
};

const persist = (ids: string[]) => {
  store = ids;
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* ignore */ }
  listeners.forEach(l => l());
};

export const loadFavorites = (): string[] => [...getStore()];

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(getStore());

  useEffect(() => {
    const update = () => setFavorites([...getStore()]);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  const toggle = useCallback((id: string) => {
    const cur = getStore();
    const next = cur.includes(id) ? cur.filter(f => f !== id) : [...cur, id];
    persist(next);
  }, []);

  const isFavorite = useCallback((id: string) => getStore().includes(id), []);

  return { favorites, toggle, isFavorite };
};
