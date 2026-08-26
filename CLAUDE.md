# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A reference/example app demonstrating how to integrate with the **Nice HMS ABDM** API (Ayushman Bharat Digital Mission), used to make third-party HIMS software ABDM-compliant. It shows two ways to call the API: via the bundled `nice-hms-integration` npm SDK, and via raw `axios` calls in `index.js`.

## Commands

```bash
npm install       # install dependencies (axios, dotenv, express, nice-hms-integration)
node index.js     # run the example Express server (listens on port 2500)
npm test          # no tests configured (echoes an error and exits 1)
```

There is no build step, lint, or test suite. The code is plain CommonJS JavaScript.

## Configuration

`index.js` loads `.env` via `dotenv`. Required variables:

- `DOMAIN` — the Nice HMS base URL. **Must end with a trailing slash**; endpoint paths are appended without a slash (e.g. `${domain}auth_token`).
- `EMAIL` / `PASSWORD` — Nice HMS credentials (obtained from Nice HMS directly).

Credentials are also hardcoded in a few example functions (ABHA address `savitribilagi@sbx`, doctor GCP IDs). These are sample/sandbox values.

## Architecture

- **`index.js`** is the only application code. It starts an Express server (port 2500) exposing two demo routes:
  - `GET /` → `"hello world"`
  - `GET /authToken` → calls `niceIntegration.authToken(email, password, domain)`
  - `GET /dischargeSummary` → calls `niceIntegration.dischareSummary(...)`

  The bottom of the file also contains standalone example functions (`getPatientById`, `getPatientByAbhaAddress`, `admitPatient`, `dischargeSummary`) that use raw `axios` against endpoints the SDK does not yet wrap. These are commented out and not wired to routes; treat them as reference patterns.

- **`nice-hms-integration`** (in `node_modules/`) is the SDK. Its entire public API is two functions:
  - `authToken(email, password, baseUrl)` → `{ token }`. The token expires in 15–30 minutes and must be sent as `Authorization: Bearer <token>` on all subsequent calls.
  - `dischareSummary(options, token, baseUrl)` → a FHIR `COMPOSITION`. **Note the misspelling `dischareSummary`** — this is the real exported name (also `DISCHARGE_SUMMARY` / `COMPOSITION` types). The `options` shape is `{ abhaAddress? | patientId?, text, doctorDetails: [{doctorName, doctorGcpId}], status: "final"|"draft", date }`.

- **`swagger.yaml`** is the canonical OpenAPI 3.0 spec for the full Nice HMS API — broader than the SDK. It documents all endpoints and request/response schemas, so prefer it over `index.js` for request shapes.

- **`Nice HMS integration.postman_collection.json`** — Postman collection for exercising the API; `ERROR_REFERENCE.pdf` — the error-envelope / per-route error code reference. `x509-self-signed-certificate.pem` is an unused self-signed cert.

## API conventions worth knowing

- A patient is identified by either Nice HMS `patientId` or `abhaAddress`.
- Only `status: "final"` documents are shared with ABDM; `"draft"` is internal.
- Document text (discharge summary, consultation, etc.) is sent as **simple HTML** — it is rendered to PDF server-side, so complex HTML produces poor output.
- `date` fields expect ISO-8601 (`2023-05-08T19:21:23.918Z`).
- Call order matters: `discharge_patient` must be called before `discharge_summary`, since it sets the discharge date. Check for active OPD/IPD visits before creating a new one.
