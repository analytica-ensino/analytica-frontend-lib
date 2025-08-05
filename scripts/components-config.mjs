import { readdirSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configuration
const configPath = join(__dirname, 'component-config.json');
const componentConfig = JSON.parse(readFileSync(configPath, 'utf8'));

/**
 * Dynamically discovers all files in a component directory
 * @param {string} componentPath - Path to component directory
 * @returns {Array} Array of discovered files
 */
function discoverComponentFiles(componentPath) {
  try {
    return readdirSync(componentPath);
  } catch (error) {
    return [];
  }
}

/**
 * Dynamically discovers subdirectories in a component directory
 * @param {string} componentPath - Path to component directory
 * @returns {Array} Array of subdirectory names
 */
function discoverSubdirectories(componentPath) {
  try {
    return readdirSync(componentPath).filter(item => {
      const fullPath = join(componentPath, item);
      return statSync(fullPath).isDirectory();
    });
  } catch (error) {
    return [];
  }
}

/**
 * Checks if a filename matches any pattern in a pattern array
 * @param {string} filename - Filename to check
 * @param {Array} patterns - Array of patterns to match against
 * @returns {boolean} Whether filename matches any pattern
 */
function matchesPattern(filename, patterns) {
  return patterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filename);
  });
}

/**
 * Checks if a file should be skipped based on skip patterns
 * @param {string} filename - Filename to check
 * @returns {boolean} Whether file should be skipped
 */
function shouldSkipFile(filename) {
  const skipPatterns = componentConfig.defaults.skipPatterns;
  return skipPatterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filename);
  });
}

/**
 * Determines the appropriate category for a component file
 * @param {string} componentName - Name of the component
 * @param {string} filename - Name of the file
 * @param {string} subdirectory - Subdirectory name (if any)
 * @returns {string} Category name
 */
function determineCategory(componentName, filename, subdirectory = null) {
  const mapping = componentConfig.componentMappings[componentName];
  
  if (!mapping) {
    return componentConfig.defaults.defaultCategory;
  }
  
  // Check if file is explicitly listed in individualFiles
  if (mapping.individualFiles && mapping.individualFiles.includes(filename)) {
    return mapping.category;
  }
  
  // Check subdirectory mappings
  if (subdirectory && mapping.subdirectories && mapping.subdirectories[subdirectory]) {
    return mapping.subdirectories[subdirectory].category;
  }
  
  // Check if file matches category patterns
  const category = componentConfig.componentCategories[mapping.category];
  if (category && category.patterns) {
    if (matchesPattern(filename, category.patterns)) {
      return mapping.category;
    }
  }
  
  // Check if file matches utility patterns
  if (matchesPattern(filename, componentConfig.filePatterns.utilityFiles)) {
    return mapping.category;
  }
  
  return componentConfig.defaults.defaultCategory;
}

/**
 * Gets the configuration key for a category
 * @param {string} category - Category name
 * @returns {string} Configuration key
 */
function getConfigKey(category) {
  const categoryMap = {
    'auth': 'authComponents',
    'toast': 'toastUtils',
    'quiz': 'subComponents',
    'checkbox': 'subComponents',
    'subComponents': 'subComponents'
  };
  
  return categoryMap[category] || 'subComponents';
}

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

  // Process each component directory dynamically
  componentDirs.forEach(componentName => {
    const componentPath = join(componentsDir, componentName);
    const mapping = componentConfig.componentMappings[componentName];
    
    // Main component entry (always exists)
    const mainFile = mapping?.mainFile || `${componentName}.tsx`;
    config.mainComponents[`${componentName}/index`] = `src/components/${componentName}/${mainFile}`;
    
    // Dynamically discover additional files in component directory
    const componentFiles = discoverComponentFiles(componentPath);
    
    // Process individual files in component directory
    componentFiles.forEach(file => {
      const fileName = file.replace(/\.(tsx?|jsx?|jsx?)$/, '');
      
      // Skip files that should be ignored
      if (shouldSkipFile(file) || file === mainFile) {
        return;
      }
      
      // Handle TypeScript/JavaScript files as potential sub-components
      if (matchesPattern(file, componentConfig.filePatterns.componentFiles)) {
        const filePath = `src/components/${componentName}/${file}`;
        const category = determineCategory(componentName, file);
        const configKey = getConfigKey(category);
        
        config[configKey][`${componentName}/${fileName}/index`] = filePath;
      }
    });
    
    // Dynamically discover subdirectories
    const subdirectories = discoverSubdirectories(componentPath);
    
    subdirectories.forEach(subdir => {
      const subdirPath = join(componentPath, subdir);
      const subdirFiles = discoverComponentFiles(subdirPath);
      
      subdirFiles.forEach(file => {
        const fileName = file.replace(/\.(tsx?|jsx?|jsx?)$/, '');
        
        // Skip files that should be ignored
        if (shouldSkipFile(file)) {
          return;
        }
        
        // Handle TypeScript/JavaScript files in subdirectories
        if (matchesPattern(file, componentConfig.filePatterns.componentFiles)) {
          const filePath = `src/components/${componentName}/${subdir}/${file}`;
          const category = determineCategory(componentName, file, subdir);
          const configKey = getConfigKey(category);
          
          config[configKey][`${componentName}/${fileName}/index`] = filePath;
        }
      });
    });
    
    // Handle special exports (like Auth exports)
    if (mapping?.exports) {
      mapping.exports.forEach(exportName => {
        const category = mapping.category;
        const configKey = getConfigKey(category);
        const mainFilePath = `src/components/${componentName}/${mainFile}`;
        
        config[configKey][`${componentName}/${exportName}/index`] = mainFilePath;
      });
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