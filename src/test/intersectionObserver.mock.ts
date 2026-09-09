import { vi } from "vitest";

type Registration = {
  callback: IntersectionObserverCallback;
  instance: IntersectionObserver;
  elements: Element[];
};

const registrations: Registration[] = [];

/** jsdom has no IntersectionObserver. This installs one and lets a test
 *  trigger intersection without a real scroll. */
export function installIntersectionObserverMock(): void {
  registrations.length = 0;

  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly scrollMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    private readonly registration: Registration;

    constructor(callback: IntersectionObserverCallback) {
      this.registration = { callback, instance: this, elements: [] };
      registrations.push(this.registration);
    }

    observe(element: Element): void {
      this.registration.elements.push(element);
    }

    unobserve(element: Element): void {
      const index = this.registration.elements.indexOf(element);
      if (index >= 0) this.registration.elements.splice(index, 1);
    }

    disconnect(): void {
      this.registration.elements.length = 0;
      const index = registrations.indexOf(this.registration);
      if (index >= 0) registrations.splice(index, 1);
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
}

// A complete entry: the mock satisfies the type instead of asserting past it.
function makeEntry(target: Element): IntersectionObserverEntry {
  const rect = target.getBoundingClientRect();

  return {
    target,
    isIntersecting: true,
    intersectionRatio: 1,
    boundingClientRect: rect,
    intersectionRect: rect,
    rootBounds: null,
    time: 0,
  };
}

/** Simulates observed elements entering the viewport. */
export function triggerIntersection(): void {
  for (const registration of [...registrations]) {
    const entries = registration.elements.map(makeEntry);
    if (entries.length > 0) {
      registration.callback(entries, registration.instance);
    }
  }
}

export function observedElementCount(): number {
  return registrations.reduce((total, r) => total + r.elements.length, 0);
}
