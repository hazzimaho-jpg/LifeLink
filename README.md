# LifeLink

A community platform connecting people to local services, alerts, healthcare data, and each other —
now backed by **Firebase** (Auth + Firestore + Cloud Functions) with a **Gemini-powered chatbot**.

## What's included

- **Home dashboard** — live weather, community pulse stats, recent alerts, top providers
- **Local Services** directory with search/filter, and a **provider profile** page with a
  "Message on WhatsApp" button (opens `wa.me` with a prefilled message) and a review/rating system
- **Community Map** (Leaflet + OpenStreetMap) plotting providers and alerts
- **Healthcare** page using **live** hospital/clinic/pharmacy data from OpenStreetMap's Overpass API
- **Alerts** page for crime, fraud, and news reports, filterable by type
- **Real user accounts** via Firebase Authentication, with profiles stored in Firestore
- **Become a Provider** application form, reviewed from the admin dashboard
- A separate **Admin Login** (password checked server-side) + **Admin Dashboard** to approve
  providers, publish alerts, and view registered users
- A **Gemini-powered chatbot assistant** (floating widget, bottom-right, on every page), with a
  rule-based fallback if the AI backend is briefly unavailable
- Full **PWA support** — installable, works offline for previously visited pages

## Architecture

```
Browser (static HTML/CSS/JS, any host)
   │
   ├── Firebase Authentication      → user accounts (email/password)
   ├── Cloud Firestore              → providers, reviews, alerts, users, provider requests
   └── Cloud Functions (2 endpoints)
         ├── adminLogin   → checks admin password (server-side secret), issues a
         │                  custom auth token with an `admin: true` claim
         └── geminiChat   → calls the Gemini API with your server-side API key
                            and returns the assistant's reply
```

No traditional server to run — Firebase *is* the backend. The frontend is still plain
HTML/CSS/JS (no build step) and can be hosted anywhere; it just talks to Firebase over the network.

## One-time setup

### 1. Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. In your new project, go to **Build → Authentication → Get started** → enable the
   **Email/Password** sign-in method
3. Go to **Build → Firestore Database → Create database** → start in **production mode**
4. Go to **Project settings → Your apps → Add app → Web** → copy the config object into
   `firebase-config.js` at the root of this project (replace the `YOUR_...` placeholders)

### 2. Get a Gemini API key
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Create an API key — you'll store it as a Firebase secret in step 4, never in frontend code

### 3. Install the Firebase CLI and log in
```bash
npm install -g firebase-tools
firebase login
```
Then set your project ID in `.firebaserc` (replace `YOUR_PROJECT_ID`), or run:
```bash
firebase use --add
```

### 4. Set your secrets (never committed to code)
```bash
firebase functions:secrets:set ADMIN_PASSWORD
firebase functions:secrets:set GEMINI_API_KEY
```
You'll be prompted to paste each value.

### 5. Install function dependencies and deploy
```bash
cd functions
npm install
cd ..
firebase deploy --only functions,firestore:rules
```

### 6. Deploy the frontend
Either use Firebase Hosting (already configured in `firebase.json`):
```bash
firebase deploy --only hosting
```
...or any static host (Netlify, Vercel, GitHub Pages, S3, Cloudflare Pages) — just upload the
folder as-is. `index.html` is the entry point. The frontend talks to Firebase over the internet
regardless of where it's hosted.

## How the pieces fit together

- **`firebase-config.js`** — your project's public Firebase config (safe to expose; Firestore
  security rules are what actually protect your data, not this file)
- **`js/app.js`** — the `LL` module: wraps Firebase Auth, Firestore, and the two Cloud Functions
  behind the same friendly API used throughout the site (`LL.getProviders()`, `LL.addReview()`, etc.)
- **`js/chatbot.js`** — the chat widget; calls `LL.chatWithGemini()`, and falls back to simple
  rule-based answers if that call fails (e.g. Firebase isn't configured yet)
- **`functions/index.js`** — the two Cloud Functions (`adminLogin`, `geminiChat`)
- **`firestore.rules`** — server-enforced permissions: anyone can read providers/alerts/reviews;
  only an authenticated admin (custom claim) can write providers/alerts or manage requests; a
  user can only edit their own profile

## Security model

- **User passwords** are handled entirely by Firebase Authentication — never stored or seen by
  your own code
- **Admin access** has no separate account to manage: entering the correct password (checked
  server-side in `adminLogin`) mints a Firebase custom token with an `admin: true` claim, which
  Firestore rules check on every write to `providers`/`alerts`
- **Gemini API key** never reaches the browser — it lives only in the `geminiChat` Cloud Function
  as a Firebase secret
- **Reviews** are open for anyone to submit (matching a public community-review model), but
  Firestore rules validate shape (rating 1–5, length limits) before accepting a write. If spam
  becomes an issue, tighten `firestore.rules` to require sign-in, or add
  [Firebase App Check](https://firebase.google.com/docs/app-check)

## Customizing

- **Colors / fonts** — design tokens live at the top of `css/style.css` (`:root` variables)
- **Gemini model / persona** — `GEMINI_MODEL` and `SYSTEM_INSTRUCTION` in `functions/index.js`.
  Google periodically retires older models — check
  [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) if you
  see a "model not found" error and swap in the current Flash model
- **Chatbot fallback answers** — `RULES` array in `js/chatbot.js`
- **App icons** — replace files in `icons/` (keep filenames/sizes, or update `manifest.json`)
- **Firestore data** — seed initial providers/alerts directly from the Firebase Console
  (Firestore Database → Start collection), or temporarily add a one-off seed script

## Local development

Run the Firebase emulators to test without touching production data:
```bash
firebase emulators:start
```
Then point `js/app.js` at the emulator by adding, right after `initializeApp(...)`:
```js
import { connectAuthEmulator } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-functions.js";
connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectFunctionsEmulator(fns, "127.0.0.1", 5001);
```
(Remove or comment this out before deploying to production.)

## Costs

Firebase's free "Spark" plan covers Auth and Firestore for small/testing traffic. Cloud Functions
require the pay-as-you-go **Blaze** plan (still has a generous free tier), because outbound
network calls — which `geminiChat` needs to reach Google's Gemini API — aren't available on Spark.
Gemini API usage is billed separately by Google based on tokens used; check current pricing at
[ai.google.dev/pricing](https://ai.google.dev/pricing).
