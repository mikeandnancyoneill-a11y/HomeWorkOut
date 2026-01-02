# HomeWorkOut

**Author:** MikeONeill  
**Timezone:** AST  
**App Name:** HomeWorkOut  

## Project Overview
HomeWorkOut is a full-body workout logging app integrated with Supabase for authentication and database. Frontend hosted on Netlify, backend scaffolding ready for Railway jobs.

### Features
- Full-body workout logger (sets, reps, weight, RPE, shoulder pain toggle)
- Email/password + magic link authentication (Supabase)
- Progress charts (weight, waist, strength)
- Analytics enabled
- Supabase integration (URL + anon key)
- Ready for scheduled jobs via Railway

### Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Supabase (Postgres + Auth)
- Hosting: Netlify
- Optional backend services: Railway

## Setup

1. Clone repo
```bash
git clone https://github.com/mikeandnancyoneill-a11y/HomeWorkOut.git
cd HomeWorkOut
```
2. Install dependencies
```bash
npm install
```
3. Copy `.env.example` to `.env` (already prefilled)
```bash
cp .env.example .env
```
4. Run locally
```bash
npm run dev
```
5. Open http://localhost:5173

### Deployment
- **Netlify**
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Domain: `homeworkoutcb.netlify.app`
- **Railway**: Node.js runtime scaffold ready for scheduled jobs

### Supabase
- URL: https://nscgerbioqothfbqegfl.supabase.co
- Auth: email/password + magic link
- Run SQL:
```sql
-- schema
db/schema.sql
-- seed data
db/seed.sql
```
