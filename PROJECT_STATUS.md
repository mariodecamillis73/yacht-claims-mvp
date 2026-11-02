# Yacht Claims MVP - Session Summary

## Repository
- GitHub repo: https://github.com/mariodecamillis73/yacht-claims-mvp
- Default branch: main

## Project status
The project was initialized as a Next.js MVP for a yacht claims management app and evolved beyond the initial scaffold. The current GitHub history shows concrete application work, not just a starter template.

## Confirmed GitHub activity
Recent commit history on the repo includes:
- Fix claim creation API to use hullNumber instead of removed yachtId field
- Use hullNumber as the natural identifier for yacht and related claim records
- Remove unused yacht fields and technical sections to match the simplified After Sales data model
- Create claim listing and creation API endpoints for the After Sales workflow
- Create claim validation route so director approval/rejection gates goal workflow as second step
- Add workflow validation fields to Claim so claim lifecycle can include approval and rejection as a required stage
- Fix invalid clsx version in package.json to allow npm install to resolve dependencies
- Add Deno workflow for linting and testing
- Redirect the root route to the login page for the working app entry point
- Initialize Next.js MVP scaffold for yacht claims management system with demo routes and UI pages

This indicates the project is progressing toward a real MVP, with claim workflow logic and data model adjustments already in the repository.

## What was built
The project includes:
- app shell and routing
- login page
- Work Hub page
- yacht overview page
- claim detail page
- customer page (My Yacht)
- supplier portal page
- mock data for yachts, claims, comments, documents, suppliers
- styling and UX foundation
- initial route and API structure for auth, claims, yachts, and public supplier access

## Important note
The GitHub repo state and the local workspace state may differ if there are pending uncommitted changes or if Copilot edited files locally without syncing them to the repo.

## How to keep the project aligned
Use this process:
1. Backup the current work
2. Check repo state with:
   - git status
   - git log --oneline
   - git branch
3. Create a feature branch before continuing
   - git checkout -b feature/mvp-foundation
4. Pull the latest repo version
   - git fetch origin
   - git checkout main
   - git pull origin main
5. Continue only on a clean branch

## Recommended development path
1. Auth + roles
2. Work Hub
3. Claim detail workflow
4. Yacht overview and technical profile
5. My Yacht customer flow
6. Supplier portal
7. Localization
8. QA and deployment

## Local run commands
From the project folder:
- npm install
- cp .env.example .env
- npm run dev

Then open:
- http://localhost:3000

Demo login:
- admin@marine.com / password123

## Key recommendation
Do not work directly on main if Copilot or local files may diverge. Always use a dedicated feature branch and commit small logical chunks.

## Shared working principle
The goal is to keep the web repo and local workspace aligned, avoid accidental overwrites, and continue the real product work without losing earlier progress.

## Current recommendation
- keep using the GitHub repo as the source of truth
- use a feature branch for all new work
- take a backup before any reset or overwrite
- verify git status before and after each session

## Project objective
Build a functional MVP for yacht After Sales and claims management, including:
- internal operations dashboard
- yacht technical profile
- claim lifecycle management
- customer access restrictions
- supplier claim portal
- localization-ready structure

This file is intended to be a shareable summary of the current project session and working context.
