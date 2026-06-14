# QA Portfolio — Cypress E2E Automation

End-to-end test automation suite for the public demo e‑commerce site
[automationexercise.com](https://automationexercise.com), built with **Cypress 14 + TypeScript**.

It demonstrates the patterns I use on real projects: the Page Object Model, reusable
custom commands, API spying/mocking with `cy.intercept`, data-driven multi-viewport
testing, negative and edge-case coverage, HTML reporting, and a CI pipeline on GitHub Actions.

---

## Tech stack

| Concern        | Choice                                   |
| -------------- | ---------------------------------------- |
| Runner         | Cypress 14                               |
| Language       | TypeScript 5                             |
| Pattern        | Page Object Model (POM)                  |
| Reporting      | Mochawesome (JSON → merged HTML)         |
| CI             | GitHub Actions (desktop + mobile matrix) |
| Lint           | ESLint + `eslint-plugin-cypress`         |

---

## Project structure

```
qa-portfolio-cypress/
├── .github/workflows/cypress.yml   # CI: matrix (desktop/mobile), report + artifact upload
├── cypress/
│   ├── e2e/
│   │   ├── auth/                    # login, register, logout
│   │   │   ├── login.cy.ts
│   │   │   ├── register.cy.ts
│   │   │   └── logout.cy.ts
│   │   ├── products/               # browsing + search
│   │   │   ├── browse.cy.ts
│   │   │   └── search.cy.ts
│   │   ├── cart/cart.cy.ts         # add / increment / remove / empty
│   │   ├── checkout/checkout.cy.ts # full order + guest/empty negatives
│   │   ├── api/intercept.cy.ts     # cy.intercept spy/stub/error + REST API
│   │   └── responsive/viewports.cy.ts  # data-driven multi-viewport smoke
│   ├── fixtures/                   # users, products, mock API payload, viewports
│   ├── pages/                      # Page Object Model classes (+ barrel index.ts)
│   │   ├── BasePage.ts
│   │   ├── HomePage.ts  LoginPage.ts  SignupPage.ts
│   │   ├── ProductsPage.ts  CartPage.ts  CheckoutPage.ts
│   │   └── index.ts
│   └── support/
│       ├── commands.ts             # custom commands (login, cart, intercept helpers)
│       ├── e2e.ts                  # global hooks / uncaught-exception filter
│       └── index.d.ts              # TypeScript types for custom commands
├── cypress.config.ts               # config + env vars + node-event hooks (plugins)
├── cypress.env.json.example        # template for local secrets (gitignored copy)
├── tsconfig.json
├── .eslintrc.json
└── package.json
```

> **Plugins note:** the legacy `cypress/plugins/` folder was removed in Cypress 10+.
> Its role (node-side event handlers, tasks, dynamic config) now lives in the
> `setupNodeEvents()` hook inside [`cypress.config.ts`](cypress.config.ts).

---

## Architecture

### Page Object Model
Every page is a class extending [`BasePage`](cypress/pages/BasePage.ts), which provides
shared behaviour (`visit`, `dismissConsentIfPresent`, `assertUrlContains`). Selectors
live in a private `selectors` map inside each page — never in the specs — so a markup
change is fixed in exactly one place. Action methods return `this` to allow fluent
chaining (`home.visit().dismissConsentIfPresent().goToLogin()`). Pages are exported from a
single barrel ([`pages/index.ts`](cypress/pages/index.ts)) for clean imports.

### Custom commands
[`commands.ts`](cypress/support/commands.ts) holds cross-cutting flows so specs stay
declarative:
- `loginByUI` / `loginBySession` — UI login, and a cached `cy.session` login that
  persists across specs with a `validate()` guard.
- `addProductsToCart(n)` — seeds the cart.
- `stubProductsApi(fixture)` — wires a `cy.intercept` stub for the products API.
- `getByQa(qa)` — selects by `data-qa` attribute.

All commands are typed in [`index.d.ts`](cypress/support/index.d.ts) for editor
autocomplete and `tsc` checking.

### Test data
JSON [fixtures](cypress/fixtures/) hold users, search terms, a mock API payload, and
viewport dimensions. Registration uses a timestamped email (`qa.portfolio+<ts>@…`) so it
succeeds against the live site every run and cleans up after itself.

### API testing
[`api/intercept.cy.ts`](cypress/e2e/api/intercept.cy.ts) covers all three `cy.intercept`
modes — **spy** (assert a real request fired), **stub** (full mock from a fixture),
and **fault injection** (forced 500 + added latency) — plus direct `cy.request` assertions
against the site's public REST API (`/productsList`, `/brandsList`, `/searchProduct`),
including a negative case for a missing parameter.

---

## Getting started

```bash
# 1. Install
npm install

# 2. (Optional) local secrets — only needed for login/checkout against a real account
cp cypress.env.json.example cypress.env.json   # then edit values
```

The default account in `cypress.config.ts` is a placeholder. For the login/checkout
suites to pass you must register an account on automationexercise.com and provide its
credentials via `cypress.env.json` or `CYPRESS_USER_EMAIL` / `CYPRESS_USER_PASSWORD`
environment variables. Browsing, search, cart, API, and responsive suites need no account.

---

## Running the tests

### Interactive (headed, with the Cypress UI)
```bash
npm run cy:open
```

### Headless (CI-style, terminal only)
```bash
npm test            # cleans old reports, runs all specs, then builds the HTML report
npm run cy:run      # just run, no report cleanup
```

### Headed in a real browser window
```bash
npm run cy:run:headed
npm run cy:run:chrome      # force Chrome
```

### Mobile viewport
```bash
npm run cy:run:mobile      # 375x667 (overrides viewport via --config)
```

### A single spec / smoke subset
```bash
npx cypress run --spec "cypress/e2e/auth/login.cy.ts"
```

### Reports
After a headless run:
```bash
npm run report      # merge Mochawesome JSON → cypress/reports/html/index.html
```
Open `cypress/reports/html/index.html` in a browser.

---

## Multiple viewports

Two layers of responsive coverage:
1. **Config-level** — the npm `cy:run:mobile` script and the CI matrix run the whole suite
   at desktop (1280×800) and mobile (375×667).
2. **Spec-level** — [`responsive/viewports.cy.ts`](cypress/e2e/responsive/viewports.cy.ts)
   is data-driven from [`fixtures/viewports.json`](cypress/fixtures/viewports.json) and
   asserts core pages render across desktop, tablet and mobile within a single run.

---

## Continuous integration

[`.github/workflows/cypress.yml`](.github/workflows/cypress.yml) runs on every push/PR to
`main`/`master` and on manual dispatch. It:
- runs a **matrix** of desktop + mobile viewports (`fail-fast: false`),
- type-checks (`tsc --noEmit`) before running,
- executes the suite via the official `cypress-io/github-action`,
- merges and uploads the **Mochawesome HTML report** as an artifact,
- uploads **screenshots** on failure.

Secrets `CYPRESS_USER_EMAIL` and `CYPRESS_USER_PASSWORD` are read from repository settings,
never committed.

---

## Test coverage summary

| Area              | Spec                          | Highlights (incl. negative / edge cases)                                   |
| ----------------- | ----------------------------- | -------------------------------------------------------------------------- |
| Login             | `auth/login.cy.ts`            | valid login; wrong creds; valid email + bad password; empty-field block    |
| Register          | `auth/register.cy.ts`         | full signup + cleanup; duplicate-email block; empty name/email block        |
| Logout            | `auth/logout.cy.ts`           | logout returns to guest state; protected links gone after logout           |
| Product browsing  | `products/browse.cy.ts`       | list all; open detail; nav from home; desktop + mobile render              |
| Search            | `products/search.cy.ts`       | valid term; no-results; special characters; case-insensitive               |
| Cart              | `cart/cart.cy.ts`             | add one/many; same-product quantity increment; remove; empty cart          |
| Checkout          | `checkout/checkout.cy.ts`     | logged-in order placed; guest register/login prompt; empty-cart block      |
| API intercept     | `api/intercept.cy.ts`         | spy; fixture stub; forced 500; latency; live REST + missing-param negative |
| Responsive        | `responsive/viewports.cy.ts`  | data-driven desktop / tablet / mobile smoke                                |

Tests tagged `@smoke` in their titles mark the critical happy paths.

---

## Notes & caveats

- This suite targets a **public demo site** that occasionally changes markup, rate-limits,
  or shows ad/consent modals. `BasePage.dismissConsentIfPresent()` and a narrow
  `uncaught:exception` filter in [`support/e2e.ts`](cypress/support/e2e.ts) absorb the most
  common third-party noise. `runMode` retries are set to 2 to tolerate flake.
- Login/checkout need a real registered account (see *Getting started*). The other suites
  are self-contained.
