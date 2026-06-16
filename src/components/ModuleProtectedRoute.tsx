import React from 'react';
import { Navigate } from 'react-router-dom';
import { useModules } from '../hooks/useModules';
import type { ModulesConfig } from '../types/modulesConfig';

type ModuleKey = keyof ModulesConfig;

/** Keys of ModulesConfig whose value is a boolean (i.e. gateable modules). */
type BooleanModuleKey = {
  [K in ModuleKey]: ModulesConfig[K] extends boolean ? K : never;
}[ModuleKey];

interface BaseModuleProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Gate on a boolean module key (`module`) OR on an explicit `enabled` flag
 * (for derived/nested gates such as the Simulados master, `simulations.enabled`).
 * At least one of the two is required, so a route can never be left ungated.
 */
export type ModuleProtectedRouteProps = BaseModuleProtectedRouteProps &
  (
    | { module: BooleanModuleKey; enabled?: boolean }
    | { module?: BooleanModuleKey; enabled: boolean }
  );

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

  // `enabled` wins when provided; otherwise gate on the boolean module key.
  // Fail closed when neither is supplied (the types prevent this, defensive).
  const isEnabled = enabled ?? (module ? Boolean(modules[module]) : false);

  // If disabled, redirect
  if (!isEnabled) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
