# Amanda Mobile App

Cross-platform personal finance app built with **Expo** and **React Native**. Chat-first money assistant, spending insights, and structured savings (Auto Save, Spend & Save, HardLock, and goal-based pots).

**Repository:** [github.com/Safayaikechukwu/amanda-mobile-app](https://github.com/Safayaikechukwu/amanda-mobile-app)

> **GitHub About (short description):**  
> `Expo/React Native finance app — AI chat, insights, savings buckets, passkey auth (iOS, Android, web).`

---

## Features

| Area | What it does |
|------|----------------|
| **Udara (chat)** | Natural-language assistant for spending, bills, savings, and quick actions (add money, pay bill, record transactions). Voice notes, attachments, and smart replies. |
| **Insights** | Overview, transactions, bills, and subscriptions with period filtering and category/recipient breakdowns. |
| **Savings** | Four bucket types with rings, activity, Quick Save, and starter templates to begin plans from chat. |
| **Profile** | Account, security, preferences, notifications, beneficiaries, and spending discipline controls. |
| **Auth** | Email onboarding, passkey / biometrics, and secure return sign-in. |

---

## Tech stack

- **Expo SDK 57** · **Expo Router** (file-based navigation)
- **React 19** · **React Native 0.86** · **TypeScript**
- **Reanimated** · **Gesture Handler** · **Safe Area Context**
- Push notifications, local auth, image/document pickers, haptics, glass-style UI

---

## Requirements

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- For device builds: Xcode (iOS) and/or Android Studio (Android)
- Optional: [Expo Go](https://expo.dev/go) for quick device testing

---

## Getting started

```bash
git clone https://github.com/Safayaikechukwu/amanda-mobile-app.git
cd amanda-mobile-app
npm install
```

### Run locally

```bash
# Dev server (choose platform in terminal or press w/i/a)
npm start

# Web only
npm run web

# iOS simulator
npm run ios

# Android emulator / device
npm run android
```

Web dev server (example): `http://localhost:8081` (Expo may pick another port if busy).

### Lint & tests

```bash
npm run lint
npm run test:notifications
npm run test:links
npm run test:glass
npm run test:window
```

---

## Project layout

```
app/                 # Expo Router screens (auth, onboarding, tabs, savings stacks)
components/          # UI, chat, insights, savings, settings
constants/           # Mock data, themes, plan templates, copy
context/             # Auth, preferences, money controls
helpers/             # Chat navigation, notifications, formatting, tests
hooks/               # Clipboard, voice session, etc.
assets/              # Icons, splash, images
```

Main tabs: **Insights** · **Udara (chat)** · **Savings**.

---

## Configuration

- **`app.json`** — Expo app name, icons, splash, permissions, bundle IDs (`com.useudara.app`).
- **Environment** — Do not commit `.env` files. Copy secrets locally only; they are listed in `.gitignore`.

---

## Scripts reference

| Script | Command |
|--------|---------|
| Start | `npm start` |
| Web | `npm run web` |
| iOS | `npm run ios` |
| Android | `npm run android` |
| Lint | `npm run lint` |

---

## Contributing

1. Fork the repo and create a branch from `main`.
2. Keep changes focused; match existing TypeScript and component patterns.
3. Run `npm run lint` and relevant `npm run test:*` scripts before opening a PR.

---

## Author

**Safaya Ikechukwu** — [GitHub @Safayaikechukwu](https://github.com/Safayaikechukwu)

---

## License

[MIT](LICENSE) © Safaya Ikechukwu
