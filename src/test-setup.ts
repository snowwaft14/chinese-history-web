import { vi } from 'vitest'

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_AMAP_API_KEY: 'test-api-key',
    VITE_AMAP_SECURITY_JS_CODE: 'test-security-code'
  }
}))

// Mock window._AMapSecurityConfig
Object.defineProperty(window, '_AMapSecurityConfig', {
  value: {
    securityJsCode: 'test-security-code'
  },
  writable: true
})

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn()
}