# Plimsoll Pilot - Mobile Architecture

**"The Pilot's Ecosystem" - Phase 3.0**

This mobile application is designed for **extreme reliability** in harsh maritime environments.

## Core Pillars
1.  **Offline-First**: Uses internal SQLite/MMKV database. Syncs when connection is restored.
2.  **High-Contrast UI**: Optimized for direct sunlight (Day Mode) and night vision preservation (Red/Black Mode).
3.  **Low Latency**: Direct WebSocket connection to the backend for real-time telemetry.

## Tech Stack
-   **Framework**: React Native (Expo)
-   **Styling**: NativeWind (Tailwind CSS)
-   **State**: Zustand + React Query
-   **Navigation**: Expo Router (File-based)
-   **Storage**: MMKV (Fast Key-Value) + SQLite (Complex Data)

## Directory Structure
```
mobile/
├── app/                # Screens & Navigation (Expo Router)
├── components/         # Reusable UI Components
├── store/              # Zustand Stores (useAuth, useDraft)
├── services/           # API & WebSocket Services
├── assets/             # Images & Fonts
└── hooks/              # Custom Hooks
```

## Setup
```bash
cd mobile
npm install
npx expo start
```
