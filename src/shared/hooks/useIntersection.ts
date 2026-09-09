import { useEffect, useRef } from "react";

/**
 * Watches a sentinel and calls `onIntersect` as it nears the viewport.
 *
 * The callback is kept in a ref: a new function on every render would
 * otherwise tear down and rebuild the observer in a loop.
 */
export function useIntersection<T extends HTMLElement>(
  onIntersect: () => void,
  enabled: boolean,
) {
  const targetRef = useRef<T>(null);
  const callbackRef = useRef(onIntersect);

  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const target = targetRef.current;

    if (!enabled || target === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          callbackRef.current();
        }
      },
      // Fire before the sentinel is visible, so the next page is already there.
      { rootMargin: "300px" },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled]);

  return targetRef;
}
