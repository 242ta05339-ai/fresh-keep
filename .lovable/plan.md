

## Plan: User Isolation, Live Notifications, and Data Freshness

### Problem Summary

1. **No user scoping on queries** — `fetchItems` in fridge-context selects all `food_items` without filtering by `user_id` or `family_id`. RLS policies exist but the anon policies also return orphaned rows.
2. **Notifications are hardcoded mock data** — not derived from actual fridge items.
3. **Dashboard eco score uses `mockSustainability`** — stale, not computed from real items.
4. **Barcode scanner** still sets an expiry date instead of leaving it blank for manual entry.
5. **Chatbot** passes `mockSustainability` instead of computed values.
6. **Family invites** work via invite code only — no email-based invite flow or admin-only controls.

### Changes

#### 1. Database: Tighten RLS, Remove Anon Policies (Migration)

Remove the four `anon` policies on `food_items` so unauthenticated users cannot see any data. Update authenticated SELECT policy to require `user_id = auth.uid()` OR family membership — ensuring user isolation even without family groups.

```sql
DROP POLICY "Anon read food items" ON public.food_items;
DROP POLICY "Anon insert food items" ON public.food_items;
DROP POLICY "Anon update food items" ON public.food_items;
DROP POLICY "Anon delete food items" ON public.food_items;

-- Tighten authenticated policies to always require user ownership or family membership
DROP POLICY "Read food items" ON public.food_items;
CREATE POLICY "Read food items" ON public.food_items FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_family_member(auth.uid(), family_id));

DROP POLICY "Insert food items" ON public.food_items;
CREATE POLICY "Insert food items" ON public.food_items FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY "Update food items" ON public.food_items;
CREATE POLICY "Update food items" ON public.food_items FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_family_member(auth.uid(), family_id));

DROP POLICY "Delete food items" ON public.food_items;
CREATE POLICY "Delete food items" ON public.food_items FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR is_family_member(auth.uid(), family_id));
```

#### 2. Fridge Context: Scope Queries + Generate Live Notifications

**`src/lib/fridge-context.tsx`:**
- Add `user` dependency to `fetchItems` and filter query: `.or(`user_id.eq.${user.id},family_id.not.is.null`)` — though RLS handles isolation, explicit filtering is belt-and-suspenders.
- Replace `mockNotifications` with a `useMemo` that generates notifications from `items`:
  - Items expiring today → `urgent`
  - Items expiring in 1-3 days → `warning`  
  - Items with >80% consumed → `info` (positive feedback)
- Notifications update automatically whenever `items` changes (real-time via Supabase channel).
- Add `useEffect` for browser Notification API: request permission on mount, show push-style desktop notifications for urgent items.

#### 3. Dashboard: Replace Mock Sustainability with Computed Score

**`src/pages/Dashboard.tsx`:**
- Remove `import { mockSustainability }` 
- Compute sustainability stats from `items` using same logic as `Sustainability.tsx` (avg consumed → score → tier → waste%)
- Display live values in stat cards and badge

#### 4. Barcode Scanner: Leave Expiry Blank

**`src/pages/AddFood.tsx` — `handleProductScanned`:**
- When product is found: set name, category, but set `expiryDate` to `''` (blank) instead of calling `guessShelfLife`
- Update the prompt to say "Please enter the expiry date, or leave blank for smart default"
- The existing form submit logic already applies `guessShelfLife` as fallback when expiry is empty

#### 5. Chatbot: Use Computed Sustainability

**`src/components/FridgeChatbot.tsx`:**
- Remove `import { mockSustainability }`
- Compute sustainability from `items` inline (same formula: avg consumed = score, tier thresholds)
- Pass computed data in `getFridgeContext`

#### 6. Family Invites: Share Link + Admin Controls

**`src/pages/Family.tsx`:**
- Add "Share Invite Link" button that copies a URL like `https://<app-url>?join=<invite_code>` 
- Only show invite code and share/remove controls when `isOwner` is true
- Add handling in `App.tsx` or `Family.tsx` to auto-detect `?join=` query param and prompt joining

### Files Modified

| File | Change |
|------|--------|
| Migration SQL | Drop anon policies, tighten authenticated policies |
| `src/lib/fridge-context.tsx` | Remove mock notifications, generate from items, add browser push |
| `src/pages/Dashboard.tsx` | Replace mockSustainability with computed values |
| `src/pages/AddFood.tsx` | Leave expiry blank after scan |
| `src/components/FridgeChatbot.tsx` | Replace mockSustainability with computed values |
| `src/pages/Family.tsx` | Owner-only invite controls, share link |

