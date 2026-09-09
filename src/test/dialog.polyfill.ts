/**
 * jsdom has the `<dialog>` element but neither `showModal()` nor
 * `close()`, so anything built on the native dialog fails without this.
 *
 * Only the `open` attribute is reproduced, which drives both visibility
 * and the accessible role, plus the `close` event.
 */
export function installDialogPolyfill(): void {
  const proto = window.HTMLDialogElement.prototype;

  if (typeof proto.showModal !== "function") {
    proto.showModal = function showModal(this: HTMLDialogElement): void {
      this.setAttribute("open", "");
    };
  }

  if (typeof proto.show !== "function") {
    proto.show = function show(this: HTMLDialogElement): void {
      this.setAttribute("open", "");
    };
  }

  if (typeof proto.close !== "function") {
    proto.close = function close(this: HTMLDialogElement, returnValue?: string): void {
      this.removeAttribute("open");
      if (returnValue !== undefined) {
        this.returnValue = returnValue;
      }
      this.dispatchEvent(new Event("close"));
    };
  }
}
