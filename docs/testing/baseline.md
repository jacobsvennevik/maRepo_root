### Baseline Test Report

Date: 2025-09-16

Commands used:
- Backend: ./myenv/bin/pytest -q --disable-warnings -r a --durations=10 --cov=backend --cov-report=term-missing
- Frontend (Jest): npm run test -- --ci --coverage
- Cypress (stable subset): npx cypress run --browser electron --headless --spec 00-smoke, simple-working, simplified-accessibility, navigation
- Cypress (full suite): npx cypress run --browser electron --headless

Exit codes:
- Backend pytest: 1
- Frontend jest: 1
- Cypress stable subset: 1
- Cypress full suite: 1

Artifacts:
- /Users/jacobhornsvennevik/Documents/GitHub/maRepo_root/artifacts/baseline-2025-09-16/backend-pytest.log
- /Users/jacobhornsvennevik/Documents/GitHub/maRepo_root/artifacts/baseline-2025-09-16/frontend-jest.log
- /Users/jacobhornsvennevik/Documents/GitHub/maRepo_root/artifacts/baseline-2025-09-16/frontend-cypress-stable.log
- /Users/jacobhornsvennevik/Documents/GitHub/maRepo_root/artifacts/baseline-2025-09-16/frontend-cypress-full.log
- /Users/jacobhornsvennevik/Documents/GitHub/maRepo_root/artifacts/baseline-2025-09-16/coverage-jest/ (if present)
- /Users/jacobhornsvennevik/Documents/GitHub/maRepo_root/artifacts/baseline-2025-09-16/cypress-screenshots/ and /Users/jacobhornsvennevik/Documents/GitHub/maRepo_root/artifacts/baseline-2025-09-16/cypress-videos/ (if present)

Slow tests:
- See --durations in backend log; Cypress per-spec times in logs; Jest file table in log.

Coverage:
- Backend: printed in backend log (term-missing).
- Frontend: see /Users/jacobhornsvennevik/Documents/GitHub/maRepo_root/artifacts/baseline-2025-09-16/coverage-jest/.

Known flakes / legacy:
- Many Cypress specs appear outdated relative to current app. Treat the full-suite failures as legacy; prioritize stabilizing and tagging a smaller passing smoke set while we update the rest.
