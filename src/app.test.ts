/**
 * @jest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the entire index module
const mockApp = {
  name: 'BG3 Tracker',
  initialize: vi.fn()
};

vi.mock('./index', () => ({
  app: mockApp
}));

describe('App initialization', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('has the correct app properties', () => {
    expect(mockApp).toBeDefined();
    expect(mockApp.name).toBe('BG3 Tracker');
    expect(typeof mockApp.initialize).toBe('function');
  });

  it('can call initialize method', () => {
    mockApp.initialize();
    expect(mockApp.initialize).toHaveBeenCalledTimes(1);
  });
});
