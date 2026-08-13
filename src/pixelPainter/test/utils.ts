import { vi } from "vitest";

export const MockLocalStorate = () => {
	// Mock window.localStorage for testing
	Object.defineProperty(window, "localStorage", {
		value: {
			getItem: vi.fn(() => null),
			setItem: vi.fn(),
			removeItem: vi.fn(),
		},
		configurable: true,
	});
};
