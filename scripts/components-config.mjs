import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Scans the components directory and generates component configurations
 * @returns {Object} Component configuration object
 */
export function generateComponentsConfig() {
  const componentsDir = join(__dirname, '..', 'src', 'components');
  
  // Get all component directories
  const componentDirs = readdirSync(componentsDir).filter(item => {
    const fullPath = join(componentsDir, item);
    return statSync(fullPath).isDirectory();
  });

  const config = {
    mainComponents: {},
    subComponents: {},
    authComponents: {},
    toastUtils: {},
    styles: {}
  };

  // Process each component directory
  componentDirs.forEach(componentName => {
    const componentPath = join(componentsDir, componentName);
    
    // Main component entry
    config.mainComponents[`${componentName}/index`] = `src/components/${componentName}/${componentName}.tsx`;
    
    // Handle special cases with sub-components
    if (componentName === 'CheckBox') {
      // Check if CheckboxList exists
      try {
        const checkboxFiles = readdirSync(componentPath);
        if (checkboxFiles.includes('CheckboxList.tsx')) {
          config.subComponents['CheckBox/CheckboxList/index'] = 'src/components/CheckBox/CheckboxList.tsx';
        }
      } catch (error) {
        // Ignore if directory doesn't exist or can't be read
      }
    }
    
    if (componentName === 'Quiz') {
      // Check if useQuizStore exists
      try {
        const quizFiles = readdirSync(componentPath);
        if (quizFiles.includes('useQuizStore.ts')) {
          config.subComponents['Quiz/useQuizStore/index'] = 'src/components/Quiz/useQuizStore.ts';
        }
      } catch (error) {
        // Ignore if directory doesn't exist or can't be read
      }
    }
    
    if (componentName === 'Auth') {
      // Auth main component
      config.authComponents['Auth/AuthProvider/index'] = 'src/components/Auth/Auth.tsx';
      config.authComponents['Auth/ProtectedRoute/index'] = 'src/components/Auth/Auth.tsx';
      config.authComponents['Auth/PublicRoute/index'] = 'src/components/Auth/Auth.tsx';
      config.authComponents['Auth/withAuth/index'] = 'src/components/Auth/Auth.tsx';
      config.authComponents['Auth/useAuth/index'] = 'src/components/Auth/Auth.tsx';
      config.authComponents['Auth/useAuthGuard/index'] = 'src/components/Auth/Auth.tsx';
      config.authComponents['Auth/useRouteAuth/index'] = 'src/components/Auth/Auth.tsx';
      config.authComponents['Auth/getRootDomain/index'] = 'src/components/Auth/Auth.tsx';
      
      // Check for individual Auth utility files
      try {
        const authFiles = readdirSync(componentPath);
        if (authFiles.includes('zustandAuthAdapter.ts')) {
          config.authComponents['Auth/zustandAuthAdapter/index'] = 'src/components/Auth/zustandAuthAdapter.ts';
        }
        if (authFiles.includes('useUrlAuthentication.ts')) {
          config.authComponents['Auth/useUrlAuthentication/index'] = 'src/components/Auth/useUrlAuthentication.ts';
        }
        if (authFiles.includes('useApiConfig.ts')) {
          config.authComponents['Auth/useApiConfig/index'] = 'src/components/Auth/useApiConfig.ts';
        }
      } catch (error) {
        // Ignore if directory doesn't exist or can't be read
      }
    }
    
    if (componentName === 'Toast') {
      // Check for Toast utils
      try {
        const utilsPath = join(componentPath, 'utils');
        if (statSync(utilsPath).isDirectory()) {
          const utilsFiles = readdirSync(utilsPath);
          if (utilsFiles.includes('Toaster.tsx')) {
            config.toastUtils['Toast/Toaster/index'] = 'src/components/Toast/utils/Toaster.tsx';
          }
          if (utilsFiles.includes('ToastStore.ts')) {
            config.toastUtils['Toast/ToastStore/index'] = 'src/components/Toast/utils/ToastStore.ts';
          }
        }
      } catch (error) {
        // Ignore if directory doesn't exist or can't be read
      }
    }
  });

  // Add styles
  config.styles['styles'] = 'src/styles.css';

  return config;
}

/**
 * Gets all component entries for tsup configuration
 * @returns {Object} All component entries
 */
export function getAllComponentEntries() {
  const config = generateComponentsConfig();
  
  return {
    ...config.mainComponents,
    ...config.subComponents,
    ...config.authComponents,
    ...config.toastUtils,
    ...config.styles
  };
}

/**
 * Gets component paths for type generation
 * @returns {Array} Array of component paths
 */
export function getComponentPathsForTypes() {
  const config = generateComponentsConfig();
  
  const paths = [
    ...Object.keys(config.mainComponents),
    ...Object.keys(config.subComponents),
    ...Object.keys(config.authComponents),
    ...Object.keys(config.toastUtils)
  ];
  
  // Remove '/index' suffix for directory paths
  return paths.map(path => path.replace('/index', ''));
}

/**
 * Gets main component names only (for simple imports)
 * @returns {Array} Array of main component names
 */
export function getMainComponentNames() {
  const config = generateComponentsConfig();
  return Object.keys(config.mainComponents).map(key => key.replace('/index', ''));
}