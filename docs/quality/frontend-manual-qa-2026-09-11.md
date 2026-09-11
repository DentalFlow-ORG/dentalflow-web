# Frontend browser QA — continuation from 2f21c07

Status: **not executed**. Unit tests validate application decisions and mocked integration boundaries; they do not certify the browser behaviors below. Record browser/version, viewport, role, plan, fixture identifiers and evidence for each execution. Use synthetic patient data.

## Clinical records

- [ ] Chrome, Edge and Safari: allow/deny microphone permission, missing device, device busy and permission resolved after navigation. Confirm recording indicators stop and the microphone is released.
- [ ] Click recording repeatedly while permission is pending. Confirm one permission request, visible pending state and recovery after refusal.
- [ ] Record and play representative short/180-second audio. Verify the actual codec, duration and transcription request remain accepted by the existing API.
- [ ] Simulate timeout, retry, then late recorder/API completion. Confirm the current recording and suggestions remain intact and obsolete media is released.
- [ ] Mobile camera and file picker: cancel, retake, unsupported format, oversized image, repeat the same file and switch apps during capture.
- [ ] Check real image decoding, orientation, aspect ratio, thumbnail quality and canvas compression. Confirm previews show the intended patient image.
- [ ] Navigate between patients during print preparation. Confirm no prior patient data or odontogram appears in the new document.
- [ ] Print/PDF in light and dark themes, with long text, images, notes-only odontogram and absent optional data. Check pagination, margins, signatures and exclusion of private notes.
- [ ] Confirm browser print cancellation/completion restores the tab title.
- [ ] Test unsaved drafts with back/forward, route changes, refresh and tab close; verify stay/leave choices and native unload confirmation.

## Scheduling and responsive interactions

- [ ] Native date/time pickers, keyboard focus, Escape, outside click and touch interactions on desktop/iOS/Android.
- [ ] Compare mobile list/timeline and desktop table/week views for the same appointments, date boundaries and role-visible actions.
- [ ] Confirm calendar clipping, overlapping appointments, scrolling, viewport resizing and touch selection geometry.
- [ ] Google Calendar authorization popup/redirect, browser history cleanup, canceled authorization and reconnection.

## Finance, fiscal, inventory and reports

- [ ] Recharts pointer hit-testing, tooltips, legends and resize behavior with empty, sparse and dense datasets.
- [ ] Invoice printing/downloads: native save dialogs, filenames, content, cancellation, blocked popups and repeated downloads.
- [ ] Print an invoice with number, service code, zero ISS and observations containing angle brackets/quotes. Confirm readable literal text and native page layout.
- [ ] Delay CEP responses and change/shorten the postal code. Confirm only the current lookup affects the address and its loading indicator.
- [ ] Change invoice filters during refresh or saving, and close/reopen the appointment picker during loading. Confirm the current search remains visible when older requests finish.
- [ ] Close finance edit dialogs and the appointment invoice picker using Escape, outside click and touch. Confirm one dismissal and correct focus restoration.
- [ ] OWNER, DENTIST and ASSISTANT views: confirm visible actions, navigation and plan gates using distinct authorized test accounts. Backend authorization must be checked independently.
- [ ] Check drawers/modals with keyboard and touch, focus restoration, mobile soft keyboard and long validation/API messages.
- [ ] Switch products while movement history is loading, then refresh after a stock movement. Confirm the displayed history always belongs to the selected product.
- [ ] Validate native quantity constraints on desktop/mobile: blank and negative final stock must not submit; explicit zero adjustment must remain allowed.

## Shared shell and marketing

- [ ] Production lazy chunks: direct entry, reload, offline/loading failure and recovery with browser back/forward navigation.
- [ ] WebGL support/failure, reduced motion, intersection animations and offscreen cleanup across supported browsers.
- [ ] Cookie consent persistence and browser storage restrictions; inspect focus and screen-reader announcements in global alerts and confirmation dialogs.

No item is marked passed solely because a jsdom test, build or coverage command passes. This checklist supplements the exact D/E/F inventory and does not waive open A/B work.
