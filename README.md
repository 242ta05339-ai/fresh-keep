# Re of Smart Fridge Keeper

Build a cross-platform app called "Smart Fridge Food Monitor" that helps families manage food items in their fridge. Core Features: 1. Food entry system with two options: - Manual entry (item name, quantity, expiry date). - Barcode scanner to auto-fetch product details. 2. Expiry date tracking with smart notifications (e.g., alert 3 days before expiry). 3. AI-based prediction: analyze purchase frequency and waste percentage (e.g., milk bought every 3 days but 30% wasted). 4. Food consumption analytics dashboard with charts for most consumed, most wasted, and monthly spending vs. waste. 5. Smart recipe generator that suggests recipes based on items nearing expiry (integrate with Spoonacular API). 6. Family sharing system with multiple user accounts and shared fridge data. 7. Smart notification system with priority alerts (urgent vs informative). 8. Sustainability score that gamifies eco-friendly consumption (Bronze → Silver → Gold). Tech Requirements: - Frontend: Flutter or React Native. - Backend: Firebase for authentication, notifications, and real-time sync. - Database: Firestore for cloud storage. - Analytics: Chart.js or similar for dashboard. - Recipe API integration: Spoonacular or Edamam. - Clean, modern UI with intuitive navigation. Deliverables: - Login/Signup screen. - Dashboard with food list and expiry alerts. - Barcode scanner screen. - Analytics dashboard. - Recipe suggestion screen. - Family sharing settings. - Notifications system. - Sustainability score badge.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://fresh-keep.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/81eb5e2a-0d84-47b7-9e19-bbb6202d9b6e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
