import {
  getWebSocketAuthProtocols,
  WS_AUTH_SUBPROTOCOL,
} from './webSocketAuth';

describe('getWebSocketAuthProtocols', () => {
  it('sends the token after the auth subprotocol', () => {
    expect(getWebSocketAuthProtocols('eyJ.abc.def')).toEqual([
      WS_AUTH_SUBPROTOCOL,
      'eyJ.abc.def',
    ]);
    expect(WS_AUTH_SUBPROTOCOL).toBe('analytica.bearer');
  });
});
