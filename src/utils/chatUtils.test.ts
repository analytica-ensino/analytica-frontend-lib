import {
  isChatUserInfoValid,
  getChatWsUrl,
  getChatUserInfo,
  ChatUserInfo,
} from './chatUtils';

describe('chatUtils', () => {
  describe('isChatUserInfoValid', () => {
    it('should return true when userId and token are present', () => {
      const userInfo: ChatUserInfo = {
        userId: 'user-123',
        userName: 'John Doe',
        userPhoto: 'https://example.com/photo.jpg',
        token: 'jwt-token-123',
      };

      expect(isChatUserInfoValid(userInfo)).toBe(true);
    });

    it('should return false when userId is empty', () => {
      const userInfo: ChatUserInfo = {
        userId: '',
        userName: 'John Doe',
        userPhoto: 'https://example.com/photo.jpg',
        token: 'jwt-token-123',
      };

      expect(isChatUserInfoValid(userInfo)).toBe(false);
    });

    it('should return false when token is empty', () => {
      const userInfo: ChatUserInfo = {
        userId: 'user-123',
        userName: 'John Doe',
        userPhoto: 'https://example.com/photo.jpg',
        token: '',
      };

      expect(isChatUserInfoValid(userInfo)).toBe(false);
    });

    it('should return false when both userId and token are empty', () => {
      const userInfo: ChatUserInfo = {
        userId: '',
        userName: 'John Doe',
        userPhoto: null,
        token: '',
      };

      expect(isChatUserInfoValid(userInfo)).toBe(false);
    });

    it('should return true even when userPhoto is null', () => {
      const userInfo: ChatUserInfo = {
        userId: 'user-123',
        userName: 'John Doe',
        userPhoto: null,
        token: 'jwt-token-123',
      };

      expect(isChatUserInfoValid(userInfo)).toBe(true);
    });

    it('should return true even when userName is empty', () => {
      const userInfo: ChatUserInfo = {
        userId: 'user-123',
        userName: '',
        userPhoto: null,
        token: 'jwt-token-123',
      };

      expect(isChatUserInfoValid(userInfo)).toBe(true);
    });
  });

  describe('getChatWsUrl', () => {
    it('should convert https to wss', () => {
      expect(getChatWsUrl('https://api.example.com')).toBe(
        'wss://api.example.com'
      );
    });

    it('should convert http to ws', () => {
      expect(getChatWsUrl('http://localhost:3000')).toBe('ws://localhost:3000');
    });

    it('should handle URLs with paths', () => {
      expect(getChatWsUrl('https://api.example.com/v1')).toBe(
        'wss://api.example.com/v1'
      );
    });

    it('should handle URLs with ports', () => {
      expect(getChatWsUrl('https://api.example.com:8080')).toBe(
        'wss://api.example.com:8080'
      );
    });

    it('should handle production URLs', () => {
      expect(getChatWsUrl('https://chat.analytica.com')).toBe(
        'wss://chat.analytica.com'
      );
    });

    it('should handle staging/hmg URLs', () => {
      expect(getChatWsUrl('https://chat-hmg.analytica.com')).toBe(
        'wss://chat-hmg.analytica.com'
      );
    });

    it('should handle URLs with query parameters', () => {
      expect(getChatWsUrl('https://api.example.com?param=value')).toBe(
        'wss://api.example.com?param=value'
      );
    });

    it('should handle URLs with trailing slash', () => {
      expect(getChatWsUrl('https://api.example.com/')).toBe(
        'wss://api.example.com/'
      );
    });
  });

  describe('getChatUserInfo', () => {
    describe('with complete user data', () => {
      it('should extract user info from user object', () => {
        const user = {
          userInstitutionId: 'inst-123',
          name: 'John Doe',
          urlProfilePicture: 'https://example.com/photo.jpg',
        };
        const tokens = { token: 'jwt-token-123' };
        const sessionInfo = null;

        const result = getChatUserInfo(user, tokens, sessionInfo);

        expect(result).toEqual({
          userId: 'inst-123',
          userName: 'John Doe',
          userPhoto: 'https://example.com/photo.jpg',
          token: 'jwt-token-123',
        });
      });

      it('should extract user info from sessionInfo when user is null', () => {
        const user = null;
        const tokens = { token: 'jwt-token-123' };
        const sessionInfo = {
          userId: 'session-user-456',
          userName: 'Jane Doe',
          urlProfilePicture: 'https://example.com/session-photo.jpg',
        };

        const result = getChatUserInfo(user, tokens, sessionInfo);

        expect(result).toEqual({
          userId: 'session-user-456',
          userName: 'Jane Doe',
          userPhoto: 'https://example.com/session-photo.jpg',
          token: 'jwt-token-123',
        });
      });

      it('should prefer user data over sessionInfo', () => {
        const user = {
          userInstitutionId: 'inst-123',
          name: 'John from User',
          urlProfilePicture: 'https://example.com/user-photo.jpg',
        };
        const tokens = { token: 'jwt-token-123' };
        const sessionInfo = {
          userId: 'session-456',
          userName: 'John from Session',
          urlProfilePicture: 'https://example.com/session-photo.jpg',
        };

        const result = getChatUserInfo(user, tokens, sessionInfo);

        expect(result).toEqual({
          userId: 'inst-123',
          userName: 'John from User',
          userPhoto: 'https://example.com/user-photo.jpg',
          token: 'jwt-token-123',
        });
      });
    });

    describe('with numeric IDs', () => {
      it('should convert numeric userInstitutionId to string', () => {
        const user = {
          userInstitutionId: 12345,
          name: 'John Doe',
        };
        const tokens = { token: 'jwt-token-123' };

        const result = getChatUserInfo(user, tokens, null);

        expect(result.userId).toBe('12345');
      });

      it('should convert numeric userId from sessionInfo to string', () => {
        const sessionInfo = {
          userId: 67890,
          userName: 'Jane Doe',
        };
        const tokens = { token: 'jwt-token-123' };

        const result = getChatUserInfo(null, tokens, sessionInfo);

        expect(result.userId).toBe('67890');
      });
    });

    describe('with missing data', () => {
      it('should return empty userId when both user and sessionInfo are null', () => {
        const result = getChatUserInfo(null, { token: 'jwt' }, null);

        expect(result.userId).toBe('');
      });

      it('should use default userName when not provided', () => {
        const result = getChatUserInfo(null, { token: 'jwt' }, null);

        expect(result.userName).toBe('Usuario');
      });

      it('should use custom default userName when provided', () => {
        const result = getChatUserInfo(null, { token: 'jwt' }, null, 'Aluno');

        expect(result.userName).toBe('Aluno');
      });

      it('should use custom default userName for Professor', () => {
        const result = getChatUserInfo(
          null,
          { token: 'jwt' },
          null,
          'Professor'
        );

        expect(result.userName).toBe('Professor');
      });

      it('should return null userPhoto when not provided', () => {
        const user = {
          userInstitutionId: 'inst-123',
          name: 'John Doe',
        };
        const tokens = { token: 'jwt-token-123' };

        const result = getChatUserInfo(user, tokens, null);

        expect(result.userPhoto).toBeNull();
      });

      it('should return empty token when tokens is null', () => {
        const user = {
          userInstitutionId: 'inst-123',
          name: 'John Doe',
        };

        const result = getChatUserInfo(user, null, null);

        expect(result.token).toBe('');
      });

      it('should return empty token when tokens.token is undefined', () => {
        const user = {
          userInstitutionId: 'inst-123',
          name: 'John Doe',
        };
        const tokens = {};

        const result = getChatUserInfo(user, tokens, null);

        expect(result.token).toBe('');
      });
    });

    describe('with undefined values', () => {
      it('should handle all undefined parameters', () => {
        const result = getChatUserInfo(undefined, undefined, undefined);

        expect(result).toEqual({
          userId: '',
          userName: 'Usuario',
          userPhoto: null,
          token: '',
        });
      });

      it('should handle user with undefined properties', () => {
        const user = {
          userInstitutionId: undefined,
          name: undefined,
          urlProfilePicture: undefined,
        };
        const tokens = { token: 'jwt-token' };

        const result = getChatUserInfo(user, tokens, null);

        expect(result).toEqual({
          userId: '',
          userName: 'Usuario',
          userPhoto: null,
          token: 'jwt-token',
        });
      });
    });

    describe('with empty string photo', () => {
      it('should return null when urlProfilePicture is empty string', () => {
        const user = {
          userInstitutionId: 'inst-123',
          name: 'John Doe',
          urlProfilePicture: '',
        };
        const tokens = { token: 'jwt-token-123' };

        const result = getChatUserInfo(user, tokens, null);

        expect(result.userPhoto).toBeNull();
      });
    });

    describe('real-world scenarios', () => {
      it('should work with typical STUDENT auth store data', () => {
        const user = {
          userInstitutionId: 'uuid-student-123',
          name: 'Maria Silva',
          urlProfilePicture: 'https://storage.example.com/photos/maria.jpg',
        };
        const tokens = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        };
        const sessionInfo = {
          userId: 'uuid-student-123',
          userName: 'Maria Silva',
        };

        const result = getChatUserInfo(user, tokens, sessionInfo, 'Aluno');

        expect(result.userId).toBe('uuid-student-123');
        expect(result.userName).toBe('Maria Silva');
        expect(result.userPhoto).toBe(
          'https://storage.example.com/photos/maria.jpg'
        );
        expect(result.token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      });

      it('should work with typical TEACHER auth store data', () => {
        const user = {
          userInstitutionId: 'uuid-teacher-456',
          name: 'Professor Carlos',
          urlProfilePicture: undefined,
        };
        const tokens = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        };

        const result = getChatUserInfo(user, tokens, null, 'Professor');

        expect(result.userId).toBe('uuid-teacher-456');
        expect(result.userName).toBe('Professor Carlos');
        expect(result.userPhoto).toBeNull();
        expect(result.token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      });

      it('should handle user still loading (auth store hydrating)', () => {
        const result = getChatUserInfo(null, null, null, 'Aluno');

        expect(isChatUserInfoValid(result)).toBe(false);
        expect(result.userId).toBe('');
        expect(result.userName).toBe('Aluno');
        expect(result.token).toBe('');
      });
    });
  });
});
