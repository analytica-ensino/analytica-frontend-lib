import React from 'react';
import { Navigate } from 'react-router-dom';
import { useModules } from '../hooks/useModules';
import type { ModulesConfig } from '../store/modulesStore';

type ModuleKey = keyof ModulesConfig;

export interface ModuleProtectedRouteProps {
  module: ModuleKey;
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
 */
export const ModuleProtectedRoute = ({
  module,
  children,
  redirectTo = '/painel',
}: ModuleProtectedRouteProps) => {
  const { modules, loading } = useModules();

  // While loading, render nothing to prevent flash of content
  if (loading) {
    return null;
  }

  // If module is disabled, redirect
  if (!modules[module]) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
