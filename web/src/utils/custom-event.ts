function on(
  eventType: any,
  listener: { (event: any): void; (this: Document, ev: any): any }
) {
  off(eventType, listener);
  document.addEventListener(eventType, listener);
}

function off(
  eventType: any,
  listener: {
    (event: any): void;
    (this: Document, ev: any): any;
    (event: any): void;
    (this: Document, ev: any): any;
  }
) {
  document.removeEventListener(eventType, listener);
}

function once(eventType: any, listener: (arg0: any) => void) {
  on(eventType, handleEventOnce);

  function handleEventOnce(event: any) {
    listener(event);
    off(eventType, handleEventOnce);
  }
}

function trigger(
  eventType: string,
  showEvent: null,
  eventMessage: null,
  severity: null,
  closeEvent: null
) {
  const event = new CustomEvent(eventType, {
    detail: { eventType, showEvent, eventMessage, severity, closeEvent },
  });
  document.dispatchEvent(event);
}

export { on, once, off, trigger };
