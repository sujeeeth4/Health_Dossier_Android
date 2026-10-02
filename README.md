# Health Dossier for Android

A private, local-first medical record organizer built with Expo, React Native, TypeScript, Expo Router, SQLite, and the Android app file system.

## Features

- Branded landing and front-end-only signup flow
- Health summary with medications, allergies, conditions, care notes, and emergency contact
- PDF and image record import with a 25 MB limit
- Searchable record list and chronological timeline
- Original file preview, opening, sharing, editing, and deletion
- Care Collections with notes, timelines, and many-to-many record membership
- Permanent dark green interface designed for phones
- Offline, device-local storage with no backend
- Optional biometric app lock with automatic privacy cover and configurable re-lock timing

## Run locally

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` after configuring Android Studio and an emulator.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npx expo-doctor
npm run bundle:android
```

## Storage

Record metadata and health details live in `expo-sqlite`. Imported originals are copied into the app's private document directory. Removing a collection preserves its records; removing a record also removes its saved original.
