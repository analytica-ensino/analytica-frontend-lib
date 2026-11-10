# README

Repositório público dos componentes utilizados nas plataformas da Analytica Ensino.

[![npm version](https://img.shields.io/npm/v/analytica-frontend-lib)](https://www.npmjs.com/package/analytica-frontend-lib)

---

## Como usar?

Instale a biblioteca em seu projeto com o comando:

```bash
yarn add analytica-frontend-lib
```

### Importe os componentes

Para usar os componentes, basta importá-los no seu projeto:

```tsx
import { Text } from 'analytica-frontend-lib';

const MyComponent = () => {
  return <Text>Olá mundo!</Text>;
};
```

### Importando Estilos CSS

Para usar os estilos e variáveis CSS da lib, importe o arquivo de estilos:

```tsx
// No seu arquivo layout.tsx (Next.js) ou main.tsx (Vite)
import 'analytica-frontend-lib/styles.css';
```

---

## Etapas para criar um novo componente

1. Crie uma nova branch a partir da `main`.
2. Crie o componente na pasta `/src/components`.
3. Adicione testes unitários, com cobertura mínima de 80%.
4. Adicione o componente no Ladle, contemplando todas as variações.
5. Atualize a versão no campo `version` do arquivo `package.json`.
6. Abra um Pull Request (PR) da sua branch para a `main`.
7. O GitHub Actions cuidará da publicação automática após o merge.

---

## Regras

- Testes unitários são obrigatórios, com coverage mínimo de 80%.
- Siga o princípio da responsabilidade única (`single responsibility`): construa componentes compostos por componentes menores.
- No arquivo `package.json` da biblioteca temos:
  - `peerDependencies`: Framework core (React)
  - `dependencies`: Bibliotecas específicas usadas pelos componentes
  - `devDependencies`: Ferramentas de build, testes, linting

## Testes de navegador (Playwright)

Os testes em `e2e/` abrem as stories do Ladle em navegadores de verdade. Hoje cobrem o `VideoPlayer` com HLS: reprodução, seletor de qualidade, fallback para o MP4, retomada e conclusão. Eles não rodam no CI.

```bash
yarn playwright install webkit   # uma vez; o projeto "chromium" usa o Google Chrome instalado
yarn test:e2e                    # sobe o Ladle sozinho (ou reaproveita um já aberto na porta 61010)
yarn test:e2e --project=webkit   # só um navegador
```

- O projeto `chromium` usa o Chrome instalado (`channel: 'chrome'`), que tem H.264/AAC; o `webkit` simula o Safari com HLS nativo.
- O vídeo de teste fica em `public/fixtures/video` (já commitado). Nenhum teste depende de rede.

### Regerar o vídeo de teste

`scripts/video-fixtures/generate.sh` gera de novo o MP4 e o HLS (10 s, 360p/480p/720p, segmentos de 2 s), no mesmo formato da conversão das aulas. O ffmpeg roda no Docker:

```bash
scripts/video-fixtures/generate.sh                                  # padrão: imagem pública alpine:3.22 (ffmpeg 6.1, instalado na hora; precisa de rede)
FFMPEG_IMAGE=minha/imagem:tag scripts/video-fixtures/generate.sh    # outra imagem com ffmpeg 6+ e bash
FFMPEG_LOCAL=1 scripts/video-fixtures/generate.sh                   # o ffmpeg instalado na máquina, sem Docker
```

O fixture commitado foi gerado com o ffmpeg 8.1.3. Outra versão 6+ gera um equivalente (mesma estrutura, duração e qualidades), mas não os mesmos bytes: só regere quando o vídeo de teste precisar mudar.

## Ladle

Link público:
https://analytica-ensino.github.io/analytica-frontend-lib/
