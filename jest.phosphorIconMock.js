// Stub genérico para ícones do @phosphor-icons/react nos testes (jest).
//
// O pacote expõe cada ícone como subpath ESM `@phosphor-icons/react/dist/csr/<Nome>`
// (exports `<Nome>` deprecated e `<Nome>Icon`). No jest (CJS), importados via o
// barrel da própria lib, esses subpaths resolvem para `undefined`. Este mock é
// mapeado (moduleNameMapper) para todos os subpaths csr e o barrel, e devolve um
// componente válido para QUALQUER export pedido, espelhando o contrato do ícone
// real: size->width/height, color->fill, weight->data-weight, e propagando
// className/data-testid. Memoizado por nome para o React reconciliar entre renders.
const React = require('react');

const cache = {};

const makeIcon = (prop) => {
  const testId = prop
    .replace(/Icon$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
  const Stub = ({ size = 24, color, weight, ...rest }) =>
    React.createElement('svg', {
      'data-testid': `phosphor-${testId}`,
      width: size,
      height: size,
      ...(color ? { fill: color } : {}),
      ...(weight ? { 'data-weight': weight } : {}),
      ...rest,
    });
  Stub.displayName = prop;
  return Stub;
};

module.exports = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (prop === '__esModule') return true;
      if (typeof prop !== 'string') return undefined;
      cache[prop] = cache[prop] || makeIcon(prop);
      return cache[prop];
    },
  }
);
