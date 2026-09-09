/**
 * Node exposes a global `localStorage` that throws until
 * `--localstorage-file` is passed, and MSW touches it on import.
 *
 * Loaded first (see `setupFiles`) to swap it for an in-memory one.
 */
function createMemoryStorage(): Storage {
  const entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    key: (index: number) => [...entries.keys()][index] ?? null,
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, String(value));
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
    clear: () => {
      entries.clear();
    },
  };
}

function isUsable(storage: Storage | undefined): boolean {
  try {
    return storage !== undefined && typeof storage.getItem === "function";
  } catch {
    return false;
  }
}

try {
  void globalThis.localStorage?.length;
} catch {
  Object.defineProperty(globalThis, "localStorage", {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
}

if (!isUsable(globalThis.localStorage)) {
  Object.defineProperty(globalThis, "localStorage", {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
}
