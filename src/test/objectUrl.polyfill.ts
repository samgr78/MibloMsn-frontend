/**
 * jsdom has no `URL.createObjectURL`, so any local file preview fails
 * without this. The URLs handed out are tracked, so a test can check that
 * revocation actually happens.
 */
const live = new Set<string>();

export function installObjectUrlPolyfill(): void {
  let counter = 0;

  URL.createObjectURL = () => {
    counter += 1;
    const url = `blob:miblomsn/${counter}`;
    live.add(url);
    return url;
  };

  URL.revokeObjectURL = (url: string) => {
    live.delete(url);
  };
}

/** Object URLs created and not yet revoked. */
export function liveObjectUrlCount(): number {
  return live.size;
}
