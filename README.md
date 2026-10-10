# us, actually.
An iOS-first, cross-platform-ready Expo app. First mini-game: **insync**, a cooperative word convergence game for two friends. Sage and cream light theme, forest dark theme. All games are free.

## Run on your iPhone
Requires Node 20.19+ and Expo Go compatible with Expo SDK 55 (or a development build).

```sh
cd us-actually
npm install
cp .env.example .env
```
Set `EXPO_PUBLIC_API_URL` in `.env` to your computer's LAN address, e.g. `http://192.168.1.20:8787`. Both phones and the computer must be on the same Wi-Fi. Allow port 8787 through your computer firewall.

In terminal one:
```sh
npm run server
```
In terminal two:
```sh
npm start
```
Scan the QR code with your iPhone. Create a room, share its six-character code, and join on another device. To run on a Mac iOS simulator: `npm run ios`. For browser development: `npm run web`.

## Included
- App home, insync lobby/game/results, local history, settings.
- Persistent theme and room credentials; polling reconnects after interruptions while the server is running.
- Server-side secret submissions. Opponent words are never sent before both guesses are locked.
- Case-insensitive Unicode word matching, round history, shared results, two-player rematch voting.
- Platform-independent rules in `src/engine.mjs`; isolated networking server.

## Verify
```sh
npm test
npm run typecheck
```
The integration test runs two clients against a real HTTP server and checks hidden words, unauthorized access, room capacity, duplicate guesses, stale rounds, invalid words, match detection and rematch voting.

## Current development limits
The included server is a single-process development backend with in-memory rooms; restart loses games. Rooms expire after one hour of inactivity. Public remote play needs an HTTPS deployment and `EXPO_PUBLIC_API_URL` set to its URL. Before App Store release: add durable storage, production rate limiting/monitoring, expired-room recovery UX, proper app icons/splash artwork, device QA and App Store configuration. iPhone rendering has not yet been verified in a simulator here. No accounts or purchases are implemented.

## Add another game
Keep rules independent of React Native. Add a game module, room state handler and screens; reuse theme, sessions and shared UI. Introduce a registry when a second game is added. Platform-specific behavior should stay in adapters. Do not expose premium UI until premium games actually exist.
