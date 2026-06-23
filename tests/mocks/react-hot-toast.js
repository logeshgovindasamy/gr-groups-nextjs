// Mock for react-hot-toast
const toast = {
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
  promise: jest.fn(),
};
module.exports = toast;
module.exports.default = toast;
