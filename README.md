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
import { Text } from 'analytica-frontend-lib'

const MyComponent = () => {
  return <Text>Olá mundo!</Text>
}
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

- Os componentes devem ser totalmente compatíveis com Next.js versão 15+.
- Testes unitários são obrigatórios, com coverage mínimo de 80%.
- Siga o princípio da responsabilidade única (`single responsibility`): construa componentes compostos por componentes menores.
- No arquivo `package.json` da biblioteca temos:
  - `peerDependencies`: Framework core (React, Next.js)
  - `dependencies`: Bibliotecas específicas usadas pelos componentes
  - `devDependencies`: Ferramentas de build, testes, linting

## Ladle

Link público:
https://landle.nyc3.cdn.digitaloceanspaces.com/index.html
