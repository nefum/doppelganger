import { RefObject, useEffect, useState } from "react";

const interactionEvents = [
  // Mouse Events
  "click", // Fired when the user clicks on an element
  "dblclick", // Fired when the user double-clicks on an element
  "mousedown", // Fired when the user presses a mouse button over an element
  "mouseup", // Fired when the user releases a mouse button over an element
  "mousemove", // Fired when the user moves the mouse pointer over an element
  "mouseenter", // Fired when the mouse pointer moves onto an element
  "mouseleave", // Fired when the mouse pointer moves out of an element
  "mouseover", // Fired when the mouse pointer moves onto an element or its children
  "mouseout", // Fired when the mouse pointer moves out of an element or its children
  "contextmenu", // Fired when the user right-clicks on an element

  // Keyboard Events
  "keydown", // Fired when the user presses a key
  "keyup", // Fired when the user releases a key
  "keypress", // Fired when the user presses a key (deprecated, use keydown instead)

  // Touch Events (for touch-enabled devices)
  "touchstart", // Fired when the user touches the screen
  "touchend", // Fired when the user removes a touch point from the screen
  "touchmove", // Fired when the user moves a touch point along the screen
  "touchcancel", // Fired when the touch event is disrupted

  // Pointer Events
  "pointerdown", // Fired when a pointer becomes active
  "pointerup", // Fired when a pointer is no longer active
  "pointermove", // Fired when a pointer changes coordinates
  "pointerenter", // Fired when a pointer enters the boundaries of an element
  "pointerleave", // Fired when a pointer leaves the boundaries of an element
  "pointerover", // Fired when a pointer is moved into an element or one of its children
  "pointerout", // Fired when a pointer is moved out of an element or one of its children
  "pointercancel", // Fired when a pointer event is canceled
];

/**
 * Hook to detect if the user has interacted with the element at least once, best used for waiting for interaction before starting video or audio that cannot run without user interaction.
 * @param ref The Element to watch
 */
export default function useOnInteraction(
  ref: RefObject<HTMLDivElement>,
): boolean {
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    // If interacted, we will skip adding events.
    if (interacted) return;
    // if no ref is provided, we can't add events
    if (!ref.current) return;
    // Function to update the state.
    const listener = (): void => {
      console.log("first interaction detected");
      setInteracted(true);
    };

    const div = ref.current;

    for (const event of interactionEvents) {
      div.addEventListener(event, listener);
    }

    return () => {
      for (const event of interactionEvents) {
        div.removeEventListener(event, listener);
      }
    };
  }, [interacted, ref]);

  return interacted;
}
