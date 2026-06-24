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

All data is stored in the browser **IndexedDB** database `VoiceDataEntryDB`. Changes are queued in `syncQueue` for a future Node.js API sync (not implemented yet).

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
