import {JSDOM} from "jsdom";
import type MutationObserver from "mutation-observer";
import CanvasGlobals from "canvas";

export async function polyfillNode(dom: JSDOM) {
  // @ts-expect-error -- clash with what it expects, it's ok since we're just mocking
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;

  // @ts-expect-error -- clash with what it expects, it's ok since we're just mocking
  globalThis.MutationObserver = (await import ("mutation-observer")).default as unknown as typeof MutationObserver;

  // iterate over the canvas globals and set them on the window
  for (const key of Object.keys(CanvasGlobals)) {
    // @ts-expect-error -- we're setting it on the window
    globalThis[key] = CanvasGlobals[key];
  }
}

export function depolyfillNode() {
  // @ts-expect-error -- clash with what it expects, it's ok since we're just mocking
  delete globalThis.window;
  // @ts-expect-error -- we set it earlier
  delete globalThis.document;
  // @ts-expect-error -- we set it earlier
  delete globalThis.MutationObserver;

  // iterate over the canvas globals and delete them from the window
  for (const key of Object.keys(CanvasGlobals)) {
    // @ts-expect-error -- we're deleting it from the window
    delete globalThis[key];
  }
}
