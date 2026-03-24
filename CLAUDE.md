# FullBeat — QA Lifecycle Platform

## What is this?
FullBeat is BrainBoot's internal QA platform at fullbeat.brainboot.co.in.
Stack: Vanilla HTML/JS + Supabase. Hosted on GitHub Pages. Zero cost.

## Tech Rules
- NO frameworks (no React, Vue, Angular). Pure HTML + CSS + JS.
- NO build tools (no npm, webpack, vite). Just push HTML files.
- Supabase JS SDK loaded via CDN.
- Every page must check auth state on load. No auth → redirect to index.html.
- All styles in css/styles.css. No inline styles except dynamic.
- Design system: Indigo #6366f1, Segoe UI font, 8px radius, 1400px max-width.

## File Structure
- index.html — Login + password change
- dashboard.html — App shell + dashboard tab
- repository.html — Test case repository
- plans.html — Test plan management
- execution.html — Test execution
- bugs.html — Bug tracker
- admin.html — User management (admin only)
- js/ — JavaScript modules
- css/ — Stylesheets
- CNAME — fullbeat.brainboot.co.in

## Supabase
- Project: fullbeat-qa
- Auth: email/password with user_profiles table for roles
- Realtime: enabled for test_executions and bugs tables

## Git
- Single branch: main (auto-deploys to GitHub Pages)
- Commit messages: descriptive, present tense
- No secrets in code — Supabase anon key is public by design
