// `export {}` makes this a module, which is what turns the block below into an augmentation of
// axios rather than a redeclaration of it. A bare `import 'axios'` would do the same, but it is
// a side-effect import: it survives compilation and pulls axios into the runtime bundle for
// nothing.
export {};

/**
 * Request-scoped flags this library sets and consumer apps honour in their axios interceptors.
 *
 * Declared as a module augmentation so the field is typed everywhere axios is used, in the
 * library and in every app that installs it, without anyone importing anything.
 */
declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Do not treat a 401 on this request as an expired session.
     *
     * The default 401 handling — refresh, and on failure send the user to the login screen —
     * is right for a request that carries the user's work. It is wrong for a background
     * lookup made during boot: the app starts, the lookup 401s, the interceptor navigates to
     * login, the app boots again and repeats. An interceptor that sees this flag must let the
     * error through to the caller, which already knows how to degrade.
     *
     * Set by `modulesStore` on `GET /me/modules`, whose answer is optional by construction —
     * it falls back to the public per-institution feature flag.
     */
    skipSessionExpiry?: boolean;
  }
}
