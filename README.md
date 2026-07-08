# openimis-fe-training_js

openIMIS frontend module for TASAF/CoreMIS training management.

## Developer Guide

Package: `@openimis/fe-training`.

Main entry point: `src/index.js`. It registers translations, the `training`
reducer, authenticated routes, the public QR check-in route, picker refs and menu
entries.

Routes:

- `/trainings` - training list/search.
- `/trainings/training/:training_uuid?` - training create/edit.
- `/trainings/trainers` - trainer profile list.
- `/trainings/trainers/trainer/:trainer_uuid?` - trainer profile create/edit.
- `/trainings/calendar` - training calendar.
- `/trainings/dashboard` - dashboard.
- `/trainings/attendance` - attendance list/search.
- `/training/checkin/:token` - public QR self check-in.

Important files:

- `src/actions.js` - GraphQL and REST upload/download/check-in operations.
- `src/constants.js` - rights, route refs, status/action enums.
- `src/pages/*` - top-level screens.
- `src/components/*` - training panels, attendance, dashboard and calendar UI.
- `src/pickers/*` - reusable trainer/category/status pickers.
- `src/translations/en.json` - module text.

Backend dependency: `openimis-be-training_py`. Keep frontend rights in sync with
the backend `21xxxx` rights. QR rendering uses `qrcode.react`.

Development:

```bash
npm install
npm run build
```

Register the built package in the openIMIS frontend bundle the same way as other
`@openimis/fe-*` modules.
