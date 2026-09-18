import { profileImageLabel } from './profileImageA11y';

describe('profileImageLabel', () => {
  describe('sem foto', () => {
    it.each([
      ['src ausente', undefined],
      ['src nulo', null],
      ['src vazio', ''],
      ['src só com espaços', '   '],
    ])('anuncia o estado vazio quando o %s', (_caso, src) => {
      expect(profileImageLabel({ src, name: 'Ana Souza' })).toBe(
        'Imagem de perfil, sem imagem'
      );
    });
  });

  describe('com foto', () => {
    it('nomeia a pessoa', () => {
      expect(
        profileImageLabel({ src: 'https://cdn/ana.jpg', name: 'Ana Souza' })
      ).toBe('Imagem de perfil de Ana Souza');
    });

    it('remove espaços em volta do nome', () => {
      expect(
        profileImageLabel({ src: 'https://cdn/ana.jpg', name: '  Ana Souza  ' })
      ).toBe('Imagem de perfil de Ana Souza');
    });

    it.each([
      ['ausente', undefined],
      ['nulo', null],
      ['vazio', ''],
      ['só com espaços', '   '],
    ])('cai no rótulo genérico quando o nome é %s', (_caso, name) => {
      expect(profileImageLabel({ src: 'https://cdn/ana.jpg', name })).toBe(
        'Imagem de perfil'
      );
    });
  });
});
