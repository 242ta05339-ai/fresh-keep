import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { FoodItem, Notification as AppNotification } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';

interface FridgeContextType {
  items: FoodItem[];
  notifications: Notification[];
  addItem: (item: Omit<FoodItem, 'id' | 'addedDate' | 'consumed'>) => Promise<void>;
  removeItem: (id: string) => void;
  markConsumed: (id: string, percentage: number) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
  loading: boolean;
}

const FridgeContext = createContext<FridgeContextType | null>(null);

function mapRowToItem(row: any): FoodItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    expiryDate: row.expiry_date,
    category: row.category,
    addedDate: row.added_date,
    addedBy: row.added_by,
    consumed: row.consumed,
    cost: row.cost ? Number(row.cost) : undefined,
  };
}

function generateNotifications(items: FoodItem[]): Notification[] {
  const now = Date.now();
  const notifications: Notification[] = [];

  for (const item of items) {
    const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      notifications.push({
        id: `exp-${item.id}`,
        title: `${item.name} has expired! ⚠️`,
        message: 'Remove it or check if it\'s still usable.',
        type: 'urgent',
        timestamp: new Date().toISOString(),
        read: false,
        foodItemId: item.id,
      });
    } else if (daysLeft === 1) {
      notifications.push({
        id: `exp-${item.id}`,
        title: `${item.name} expires tomorrow!`,
        message: 'Use it today or freeze it to avoid waste.',
        type: 'urgent',
        timestamp: new Date().toISOString(),
        read: false,
        foodItemId: item.id,
      });
    } else if (daysLeft <= 3) {
      notifications.push({
        id: `exp-${item.id}`,
        title: `${item.name} — ${daysLeft} days left`,
        message: 'Plan a meal to use it before it expires.',
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        foodItemId: item.id,
      });
    }

    if (item.consumed >= 80) {
      notifications.push({
        id: `save-${item.id}`,
        title: `Great job on ${item.name}! 🎉`,
        message: `${item.consumed}% consumed — minimal waste!`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: true,
        foodItemId: item.id,
      });
    }
  }

  return notifications.sort((a, b) => {
    const priority = { urgent: 0, warning: 1, info: 2 };
    return priority[a.type] - priority[b.type];
  });
}

export function FridgeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data.map(mapRowToItem));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel('food_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchItems]);

  // Browser push notifications for urgent items
  useEffect(() => {
    if (!('Notification' in window) || items.length === 0) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    if (Notification.permission !== 'granted') return;

    const now = Date.now();
    for (const item of items) {
      const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 1 && daysLeft >= 0) {
        new Notification(`🚨 ${item.name} ${daysLeft === 0 ? 'expires today!' : 'expires tomorrow!'}`, {
          body: 'Open FreshKeep to use it before it goes to waste.',
          icon: '/placeholder.svg',
        });
      }
    }
  }, [items]);

  const notifications = useMemo(() => {
    const generated = generateNotifications(items);
    return generated.map(n => ({ ...n, read: readIds.has(n.id) ? true : n.read }));
  }, [items, readIds]);

  const addItem = useCallback(async (item: Omit<FoodItem, 'id' | 'addedDate' | 'consumed'>) => {
    let familyId: string | null = null;
    if (user) {
      const { data } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      if (data) familyId = data.family_id;
    }

    const { error } = await supabase.from('food_items').insert({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      expiry_date: item.expiryDate,
      category: item.category,
      added_by: item.addedBy,
      cost: item.cost ?? null,
      user_id: user?.id ?? null,
      family_id: familyId,
    });

    if (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  }, [user]);

  const removeItem = useCallback(async (id: string) => {
    await supabase.from('food_items').delete().eq('id', id);
  }, []);

  const markConsumed = useCallback(async (id: string, percentage: number) => {
    await supabase.from('food_items').update({ consumed: Math.min(100, percentage) }).eq('id', id);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setReadIds(prev => new Set(prev).add(id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <FridgeContext.Provider value={{ items, notifications, addItem, removeItem, markConsumed, markNotificationRead, unreadCount, loading }}>
      {children}
    </FridgeContext.Provider>
  );
}

export function useFridge() {
  const ctx = useContext(FridgeContext);
  if (!ctx) throw new Error('useFridge must be used within FridgeProvider');
  return ctx;
}
