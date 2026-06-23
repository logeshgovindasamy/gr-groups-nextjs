// Global Jest setup — runs before every test file
import '@testing-library/jest-dom';

// Polyfill crypto.randomUUID for Node environments in tests
const crypto = require('crypto');
if (!global.crypto) {
  global.crypto = crypto;
} else if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = crypto.randomUUID;
}

// Silence console.error / warn in tests to keep output clean
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});
