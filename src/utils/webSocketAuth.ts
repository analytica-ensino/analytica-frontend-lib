/**
 * Subprotocol that carries the token of the chat WebSocket handshake.
 * Browsers cannot set headers on a WebSocket, but they send the subprotocols
 * in the `Sec-WebSocket-Protocol` header, which keeps the token out of the URL
 * and of the access logs. The backend answers with this same subprotocol.
 */
export const WS_AUTH_SUBPROTOCOL = 'analytica.bearer';

/**
 * Builds the subprotocol list that authenticates a chat WebSocket.
 * @param token - Session or support guest token
 * @returns Value for the second argument of `new WebSocket`
 * @example new WebSocket(url, getWebSocketAuthProtocols(token));
 */
export const getWebSocketAuthProtocols = (token: string): string[] => [
  WS_AUTH_SUBPROTOCOL,
  token,
];
