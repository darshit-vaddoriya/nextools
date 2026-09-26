/**
 * Give the page a chance to paint and handle input between slices of work.
 *
 * Not setTimeout: background tabs clamp timers, and after a few minutes Chrome
 * throttles chained timers to once a minute — a conversion left running in
 * another tab would crawl. A MessageChannel round-trip is not throttled.
 */
export function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
}
