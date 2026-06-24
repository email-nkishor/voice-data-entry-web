# Voice Data Entry Web

Angular web application for **offline, free voice-based data entry**. Mirrors the NativeScript mobile app with browser storage and speech APIs.

## Stack

- Angular 20 (standalone components)
- **IndexedDB** via [Dexie](https://dexie.org/) for offline storage
- **Web Speech API** for voice input
- **Keyword parser** — fully local, no API keys, no paid AI
- Lazy-loaded feature routes

## Modules (all support voice entry)

| Route | Feature |
|---|---|
| `/dashboard` | Home navigation cards |
| `/student` | CRUD, voice entry, dynamic columns |
| `/attendance` | Attendance list & voice entry |
| `/expense` | Expense list & voice add |
| `/inventory` | Inventory list & voice add |
| `/survey` | Survey list & voice entry |
| `/patient` | Hospital registration + voice |
| `/*/columns` | Configure voice keywords per module |

## Voice entry

1. Open any module → **Add** / **Entry**
2. Tap **Start Speaking**
3. Say: `Rahul Kumar class 10 roll number 101 mobile 9876543210 address Noida`
4. Fields auto-fill from configured column keywords
5. **Save** — toast shows **Saved successfully**

Configure voice keywords at **Configure Voice Columns** on each form (e.g. `/student/columns`).

### Modify / reset

- Edit any field manually, or
- Say **reset** / **re entry**, or
- Tap **Reset**

## Validation

- **Student / Patient / Survey:** Name + Mobile required (mobile ≥ 10 digits)
- **Expense:** Expense name required
- **Inventory:** Item name required

## Offline

All data is stored in the browser **IndexedDB** database `VoiceDataEntryDB`. Changes are queued in `syncQueue` and pushed to the **voice-data-entry-api** Node server when you click **Sync Now**.

## Auth & sync

1. Start API: `cd ../voice-data-entry-api && npm run dev`
2. Login at `/login` (e.g. clerk@institute.local / clerk123)
3. Work offline — add students with voice entry
4. Click **Sync Now** in the top bar when API is online

## 3-phase student module

| Phase | Features |
|-------|----------|
| **1 — Offline camp** | Extended fields, groups, real dashboard, activity log |
| **2 — Sync** | Push queue to API, online/offline indicator |
| **3 — SIS foundation** | JWT auth, roles, admission approval workflow |

See root [README.md](../README.md) for full stack setup.

## Speech note

Speech uses **browser/device recognition** (Chrome may use cloud ASR). **Field mapping is 100% local and free** — no API keys or trials.

## Run

```bash
cd voice-data-entry-web
npm install
npm start
```

Open http://localhost:4200

> Voice recognition works best in **Chrome/Edge** over HTTPS or localhost.

## Build

```bash
npm run build
```

## Strategy (this POC)

- **Option A — Field tool:** Offline-first, voice on all modules ✅
- **Option B — traQtion integration:** Future sync API + auth (queue ready, worker not built)
- **Option C — Voice SDK:** Shared `voice-parser`, `voice-dynamic-form`, `column-config` components for traQtion reuse

## Related

Mobile version: `../VoiceDataEntry`
