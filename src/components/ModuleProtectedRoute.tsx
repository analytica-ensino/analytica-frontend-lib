import React from 'react';
import { Navigate } from 'react-router-dom';
import { useModules } from '../hooks/useModules';
import type { ModulesConfig } from '../store/modulesStore';

type ModuleKey = keyof ModulesConfig;

export interface ModuleProtectedRouteProps {
  /** Boolean module key from ModulesConfig (e.g. "simulator"). */
  module?: ModuleKey;
  /**
   * Explicit enabled flag. When provided, takes precedence over `module` —
   * use it for derived/nested gates such as the Simulados master toggle
   * (`simulations.enabled`).
   */
  enabled?: boolean;
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Route guard component that redirects if the specified module is disabled
 * Use this component to wrap routes that should only be accessible when the module is enabled
 *
 * @example
 * <Route path="simulador-sisu" element={
 *   <ModuleProtectedRoute module="simulator">
 *     <SimuladorSisu />
 *   </ModuleProtectedRoute>
 * } />
 *
 * @example
 * <Route path="simulados" element={
 *   <ModuleProtectedRoute enabled={hasSimulations}>
 *     <Simulados />
 *   </ModuleProtectedRoute>
 * } />
 */
export const ModuleProtectedRoute = ({
  module,
  enabled,
  children,
  redirectTo = '/painel',
}: ModuleProtectedRouteProps) => {
  const { modules, loading } = useModules();

  // While loading, render nothing to prevent flash of content
  if (loading) {
    return null;
  }

  // `enabled` wins when provided; otherwise fall back to the boolean module key.
  const isEnabled = enabled ?? (module ? Boolean(modules[module]) : true);

  // If disabled, redirect
  if (!isEnabled) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
