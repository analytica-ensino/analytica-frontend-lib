/**
 * Below the ~100 s after which Cloudflare closes a silent WebSocket.
 */
export const WEBSOCKET_KEEPALIVE_INTERVAL_MS = 60_000;

const WEBSOCKET_OPEN = 1;

/**
 * Keep a WebSocket alive while nothing is being said.
 *
 * @param socket - Open connection
 * @returns Function that stops the pings
 *
 * @example
 * const stop = startWebSocketKeepAlive(socket);
 * socket.onclose = stop;
 */
export const startWebSocketKeepAlive = (
  socket: Pick<WebSocket, 'readyState' | 'send'>
): (() => void) => {
  const timer = setInterval(() => {
    if (socket.readyState === WEBSOCKET_OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }));
    }
  }, WEBSOCKET_KEEPALIVE_INTERVAL_MS);

  return () => clearInterval(timer);
};
