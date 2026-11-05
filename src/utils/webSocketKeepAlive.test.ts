import {
  startWebSocketKeepAlive,
  WEBSOCKET_KEEPALIVE_INTERVAL_MS,
} from './webSocketKeepAlive';

describe('startWebSocketKeepAlive', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should ping within the time Cloudflare allows a silent connection', () => {
    expect(WEBSOCKET_KEEPALIVE_INTERVAL_MS).toBeLessThan(100_000);
  });

  it('should ping at each interval until stopped', () => {
    const socket = { readyState: 1 as const, send: jest.fn() };
    const stop = startWebSocketKeepAlive(socket);

    expect(socket.send).not.toHaveBeenCalled();
    jest.advanceTimersByTime(WEBSOCKET_KEEPALIVE_INTERVAL_MS * 2);
    expect(socket.send).toHaveBeenCalledTimes(2);
    expect(socket.send).toHaveBeenCalledWith('{"type":"ping"}');

    stop();
    jest.advanceTimersByTime(WEBSOCKET_KEEPALIVE_INTERVAL_MS);
    expect(socket.send).toHaveBeenCalledTimes(2);
  });

  it('should not send on a connection that is no longer open', () => {
    const socket = { readyState: 2 as const, send: jest.fn() };
    const stop = startWebSocketKeepAlive(socket);

    jest.advanceTimersByTime(WEBSOCKET_KEEPALIVE_INTERVAL_MS);

    expect(socket.send).not.toHaveBeenCalled();
    stop();
  });
});
