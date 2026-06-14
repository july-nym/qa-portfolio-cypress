// This file is loaded automatically before every spec file.
// It is the ideal place for global configuration and behaviour.

import './commands';

// The demo site occasionally throws unhandled promise rejections from third-party
// ad/analytics scripts. These are unrelated to our tests, so we swallow them to
// avoid false failures. App-level errors should still surface — narrow the filter
// rather than returning false for everything in a real project.
Cypress.on('uncaught:exception', (err) => {
  const ignorable = [
    'ResizeObserver loop',
    'Script error',
    'is not defined', // ad-network globals
  ];
  if (ignorable.some((msg) => err.message.includes(msg))) {
    return false;
  }
  return true;
});

// Keep the command log readable when many XHRs fire (toggle via env.hideXHR).
if (Cypress.env('hideXHR')) {
  const app = window.top;
  if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
    const style = app.document.createElement('style');
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');
    app.document.head.appendChild(style);
  }
}
