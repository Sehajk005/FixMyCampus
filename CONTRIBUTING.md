# Contributing to Fix My Campus

## Branch Strategy

```
main          → production-ready only (protected, only Git Lead merges here)
dev           → integration branch (all PRs merge here first)
feature/*     → individual work branches
demo/phase1   → frozen demo branch (created Day 15)
```

## Branch Naming Convention

| Member | Prefix | Example |
|--------|--------|---------|
| Backend | `feature/be-` | `feature/be-auth` |
| Frontend | `feature/fe-` | `feature/fe-login` |
| Database | `feature/db-` | `feature/db-schema` |
| ORM + Sockets | `feature/orm-` | `feature/orm-socket` |
| Git + QA | `feature/qa-` | `feature/qa-smoke-tests` |

## Commit Message Format

```
type(scope): short description

feat(auth): add OTP email verification
fix(tickets): resolve status badge not updating
test(smoke): add ticket round-trip integration test
chore(ci): add GitHub Actions workflow
```

## PR Process

1. Push your feature branch
2. Open a PR → `dev` branch (never directly to `main`)
3. Fill out the PR template completely
4. Git Lead (Member 5) reviews and merges within 4 hours
5. Delete your feature branch after merge

## Golden Rules

1. **Commit daily** — push to your branch every 24 hours minimum
2. **Never commit `.env`** — use `.env.example` with placeholder values
3. **Message first** — if blocked > 2 hours, ping the team immediately
4. **Schema changes** → go through Member 3 first
5. **Migration changes** → go through Member 4 first
6. **Demo branch is frozen** on 15th March evening — no further changes

## Local Setup

### Backend
```bash
cd backend
cp .env.example .env    # fill in your credentials
npm install
npm run dev             # starts on :5000
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # starts on :5173
```

### Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p fixmycampus_db < database/seed.sql
```

### Running Tests
```bash
cd backend
npm test
```
