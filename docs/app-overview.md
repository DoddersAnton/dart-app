# Dart Team Management App Overview

## App Description
This app is built for darts teams that need a central place to run day-to-day club admin and league activity.

It supports managing players, teams, fixtures, game tracking, subscriptions, fines, and payments in one workflow. The goal is to reduce manual spreadsheets and make it easier for captains and organisers to keep records up to date.

## Tech Stack
- **Framework:** Next.js 15 (App Router) with React 19 and TypeScript.
- **Styling/UI:** Tailwind CSS 4, shadcn/ui (built on Radix UI), and reusable UI primitives.
- **Data layer:** Drizzle ORM with SQL migrations and PostgreSQL-compatible drivers.
- **Authentication:** Clerk.
- **Payments:** Stripe (payment intents and card flows).
- **Validation and forms:** Zod + React Hook Form.
- **Charts and reporting:** Recharts.
- **Notifications and UX helpers:** Sonner, date utilities, and animation libraries.

## Aims of the App
- **Team administration:** Manage teams, players, seasons, and locations.
- **Subs management:** Track player subscriptions and payment history.
- **Fines management:** Create fine types, issue fines, and track outstanding balances.
- **Payments:** Record and process payments for subscriptions and fines.
- **League and match tracking:** Manage fixtures, games, round-level activity, and match outcomes.
- **Performance visibility:** Provide summary views and tables to monitor player and team results.
- **Single source of truth:** Keep all darts league admin data in one consistent system.

## Intended Users
- Team captains
- Club secretaries and treasurers
- Players who need visibility into their payments, fines, and results
