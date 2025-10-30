// src/mocks/browser.js
import { setupWorker } from 'msw/browser'; // <-- v2 requires 'msw/browser'
import { handlers } from './handlers';
export const worker = setupWorker(...handlers);