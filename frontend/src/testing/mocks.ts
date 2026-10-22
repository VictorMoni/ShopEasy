import { vi, type Mocked } from 'vitest';
export function createMock<T>(name: string, methods: string[], properties: Record<string, unknown> = {}): Mocked<T> {
  return Object.assign(Object.fromEntries(methods.map(method => [method, vi.fn().mockName(name + '.' + method)])), properties) as Mocked<T>;
}
