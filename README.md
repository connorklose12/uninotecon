# NDSU UniNote Swap

A class-based discussion board for NDSU students. Pick your course, then swap notes, ask questions, share advice, and help classmates get through it together.

**Live demo:** [connorklose12.github.io/uninotecon](https://connorklose12.github.io/uninotecon/)

## Why I built it

Group chats and Discord servers are great until you need last semester's notes or a straight answer about a professor. I wanted one searchable place organized by course, with no sign-up wall for browsing. I built it solo, from the data model to the deploy.

## Features

- **Course browser:** 1,300+ NDSU courses preloaded, searchable by code or name. Students can add missing classes.
- **Activity indicators:** a ⭐ marks classes that already have posts, so you can see where the conversation is.
- **Posts with flairs:** tag posts as Notes, Question, Advice, Discussion, or Other, and optionally list your professor.
- **Image uploads:** attach photos of notes or whiteboards.
- **Likes:** a "found this helpful" heart, one like per user.
- **Threaded replies:** reply to a post or to a specific comment, with @mentions.
- **Reply notifications:** an in-app bell plus an email when someone replies to you.
- **Accounts:** email/password or Google sign-in, custom display names, and delete only your own posts and replies.
- **Real-time updates:** new posts, replies, and likes show up instantly without a refresh.
- **Feedback box:** a form on the home page that emails me bug reports and ideas.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | Angular 21 (standalone components), TypeScript, RxJS, Bootstrap |
| Backend | Firebase: Firestore, Authentication, Cloud Storage |
| Email | EmailJS |
| Tooling | Angular CLI, Vite, Vitest, Prettier |
| Deploy | GitHub Pages via `angular-cli-ghpages` |

## How it works

- **Real-time data:** Firestore `onSnapshot` listeners stream posts and replies, and are cleaned up in `ngOnDestroy` to avoid leaks.
- **Nested data model:** `classes/{id}/posts/{id}/replies/{id}`, so each course is its own bucket and queries stay fast.
- **Denormalized counters:** each class keeps a `postCount` updated with Firestore's atomic `increment()`, so the course list can show activity without querying every post.
- **Safe likes:** `arrayUnion` / `arrayRemove` on a `likedBy` list prevents double-likes, and the count is derived from the list.
- **Auth architecture:** an injectable `AuthService` exposes the user as an RxJS observable, and a functional route guard (`CanActivateFn`) protects the dashboard route.
- **Performance:** the dashboard is lazy-loaded with `loadComponent`, and client-side search is a computed getter over live data.
- **Hash routing and SSR setup:** `withHashLocation()` keeps deep links working on GitHub Pages, and the app is configured for server-side rendering and hydration.
- **Async flows:** image upload, Firestore writes, counter updates, and email sends are chained with `async/await` and wrapped in error handling.

## Run it locally

```bash
npm install
ng serve        # http://localhost:4200
```

Add your own Firebase config in `src/app/firebase.config.ts`.

## What I'd do next

- Tighten Firestore security rules (currently open for development) and enforce auth server-side
- Move notification emails into a Cloud Function so no email keys live in the client
- Add file and PDF attachments, which need a paid Firebase storage plan
- Add per-user notification queries and unread badges
- Break the large class and home components into smaller, reusable ones

---

Built by [Connor Klose](https://connorklose12.github.io/myportfolio/)
