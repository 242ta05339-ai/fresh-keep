import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FoodItem, Notification } from './types';
import { mockFoodItems, mockNotifications } from './mock-data';

interface FridgeContextType {
  items: FoodItem[];
  notifications: Notification[];
  addItem: (item: Omit<FoodItem, 'id' | 'addedDate' | 'consumed'>) => void;
  removeItem: (id: string) => void;
  markConsumed: (id: string, percentage: number) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
}

const FridgeContext = createContext<FridgeContextType | null>(null);

export function FridgeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FoodItem[]>(mockFoodItems);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const addItem = useCallback((item: Omit<FoodItem, 'id' | 'addedDate' | 'consumed'>) => {
    const newItem: FoodItem = {
      ...item,
      id: crypto.randomUUID(),
      addedDate: new Date().toISOString().split('T')[0],
      consumed: 0,
    };
    setItems(prev => [newItem, ...prev]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const markConsumed = useCallback((id: string, percentage: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, consumed: Math.min(100, percentage) } : i));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <FridgeContext.Provider value={{ items, notifications, addItem, removeItem, markConsumed, markNotificationRead, unreadCount }}>
      {children}
    </FridgeContext.Provider>
  );
}

export function useFridge() {
  const ctx = useContext(FridgeContext);
  if (!ctx) throw new Error('useFridge must be used within FridgeProvider');
  return ctx;
}
