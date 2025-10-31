# TalentFlow — Front‑End Only (React + MSW + IndexedDB)

A hand‑built React app (no UI templates) that simulates a mini hiring platform.

- Jobs board: create/edit, archive/unarchive, server‑like pagination + filtering, drag‑and‑drop reorder with optimistic rollback, deep link /jobs/:jobId
- Candidates: 1k+ virtualized list with search + stage filter, profile + timeline, kanban stage transitions (optimistic + rollback), notes with @mentions
- Assessments: per‑job builder (sections, single/multi/short/long/number with range, file stub), live preview, validation (required/min/max/maxLength), conditional questions, save/load (local), submit stub

All persistence is local (IndexedDB via Dexie). The “API” is simulated with MSW (v2) and writes through into IndexedDB. Latency (200–1200ms) and random write errors (~7%) are injected to mimic a real network.

---

## Login (no signup required)

Use either demo account (also shown on login):

- Admin — Email: `admin@talentflow.dev` · Password: `Admin#2025`
- Hiring Manager — Email: `hr@talentflow.dev` · Password: `Hr#2025`

Notes:
- Auth is local to the demo (no backend).
- Roles are labels by default (both can use the app). UI‑only gating can be toggled (see “Optional role‑based UI” below).

---

## Tech

- React 18 + React Router 6, Vite (build only)
- MSW v2 (import from `msw/browser`) as a fake REST layer; handlers write to IndexedDB
- Dexie (IndexedDB) for persistence
- dnd‑kit (drag‑and‑drop reorder)
- react‑window (virtualized candidates)
- dayjs, @faker‑js/faker, nanoid
- Pure CSS (no UI frameworks)

---

## Project Structure
