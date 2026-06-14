import { defineConfig } from 'cypress';

export default defineConfig({
  // Reporter — Mochawesome produces a JSON per spec that is merged into a single HTML report.
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports/mochawesome',
    overwrite: false,
    html: false,
    json: true,
  },

  // Project-wide defaults. Viewports are overridden per-test for the mobile suite.
  viewportWidth: 1280,
  viewportHeight: 800,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 60000,
  requestTimeout: 15000,
  responseTimeout: 30000,
  video: false,
  screenshotOnRunFailure: true,
  retries: {
    runMode: 1,
    openMode: 0,
  },

  e2e: {
    baseUrl: 'https://automationexercise.com',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    experimentalRunAllSpecs: true,

    setupNodeEvents(on, config) {
      // ---- Plugin/event hooks (replaces the legacy cypress/plugins dir) ----

      // Pull secrets/overrides from the OS environment for CI.
      config.env.userEmail = process.env.CYPRESS_USER_EMAIL || config.env.userEmail;
      config.env.userPassword = process.env.CYPRESS_USER_PASSWORD || config.env.userPassword;

      // A simple task for logging structured messages to the terminal during a run.
      on('task', {
        log(message: string) {
          // eslint-disable-next-line no-console
          console.log(message);
          return null;
        },
      });

      return config;
    },

    // Non-secret defaults. Override with CYPRESS_* env vars or cypress.env.json.
    env: {
      apiUrl: 'https://automationexercise.com/api',
      userEmail: 'qa.portfolio.demo@example.com',
      userPassword: 'Sup3rSecret!Pass',
      hideXHR: true,
    },
  },
});
