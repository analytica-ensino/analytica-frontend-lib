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
5. Abra um Pull Request (PR) da sua branch para a `main`. Cada commit do PR publica uma [versão de teste](#versões-de-pr) para você experimentar num app.
6. Não mexa no campo `version` do `package.json`: depois do merge, o GitHub Actions aumenta o patch e publica no npm sozinho.

---

## Publicação no npm

Só o push na `main` publica no npm, pelo job `publish` do `ci.yml`, usando o [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC):

- Não existe token do npm no repositório. O npm só aceita publicação que venha do `ci.yml` deste repositório rodando no environment `npm`, e esse environment só aceita deploy da `main`.
- Toda versão sai com [provenance](https://docs.npmjs.com/generating-provenance-statements), que liga o pacote ao commit e ao run que o gerou.
- Nos apps, a lib fica com a versão exata, sem `^`. Para atualizar: `yarn up analytica-frontend-lib@X.Y.Z`.

---

## Versões de PR

Cada commit de um PR aberto a partir deste repositório publica uma versão de teste no **GitHub Packages**, nunca no npm. O pacote se chama `@analytica-ensino/analytica-frontend-lib`, e a versão segue o formato `<versão do package.json>-pr.<número do PR>.<commit>` (ex.: `1.7.48-pr.722.ab12cd3`). O bot comenta no PR o comando pronto, e o dist-tag `pr-<número do PR>` aponta sempre para o build mais recente daquele PR. PR aberto de fork não publica.

O pacote é privado: só membros da organização `analytica-ensino` conseguem instalar. Para caber nos 500 MB do plano gratuito, o CI apaga as versões quando o PR é fechado (mergeado ou não) e, enquanto ele está aberto, mantém só as 3 mais recentes.

### 1. Crie o token (uma vez por máquina)

1. Abra [github.com/settings/tokens/new](https://github.com/settings/tokens/new?scopes=read:packages&description=analytica-frontend-lib%20PR) e crie um token **classic** só com o escopo `read:packages`. Token fine-grained não funciona no registry npm do GitHub Packages.
2. Coloque o token no `~/.yarnrc.yml` da sua **home**, não no repositório:

   ```yaml
   npmScopes:
     analytica-ensino:
       npmRegistryServer: "https://npm.pkg.github.com"
       npmAuthToken: "ghp_seu_token_aqui"
   ```

3. Teste em qualquer app (troque `722` pelo número do PR):

   ```bash
   yarn npm info @analytica-ensino/analytica-frontend-lib@pr-722 --fields version
   ```

   Se aparecer a versão, está pronto. Se der `401`, `403` ou `404`, o token está sem `read:packages` ou não foi lido do `~/.yarnrc.yml`.

### 2. Instale a versão do PR no app

O alias `npm:` instala o pacote de teste com o nome `analytica-frontend-lib`, então nenhum import do app muda.

```bash
# a versão exata que o bot comentou no PR
yarn add analytica-frontend-lib@npm:@analytica-ensino/analytica-frontend-lib@1.7.48-pr.722.ab12cd3

# ou o build mais recente do PR (rode de novo depois de cada commit novo)
yarn up analytica-frontend-lib@npm:@analytica-ensino/analytica-frontend-lib@pr-722
```

### 3. Volte para a versão publicada antes de commitar

```bash
yarn up analytica-frontend-lib@1.7.49   # a versão exata que saiu do merge
```

Nunca commite o alias. O `yarn.lock` passaria a apontar para o GitHub Packages, e o build do app, que não tem o token, quebraria na instalação.

---

## Regras

- Testes unitários são obrigatórios, com coverage mínimo de 80%.
- Siga o princípio da responsabilidade única (`single responsibility`): construa componentes compostos por componentes menores.
- No arquivo `package.json` da biblioteca temos:
  - `peerDependencies`: Framework core (React)
  - `dependencies`: Bibliotecas específicas usadas pelos componentes
  - `devDependencies`: Ferramentas de build, testes, linting

## Testes de navegador (Playwright)

Os testes em `e2e/` abrem as stories do Ladle em navegadores de verdade. Hoje cobrem o `VideoPlayer` com HLS (reprodução, seletor de qualidade, fallback para o MP4, retomada e conclusão) e o player de aula (`LessonVideoSection`): HLS quando a aula tem `urlVideoHls`, MP4 quando não tem e MP4 com `MODULES.lessonVideoMp4Only` ligado. Eles não rodam no CI.

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
