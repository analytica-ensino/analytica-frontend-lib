import { readdirSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configuration
const configPath = join(__dirname, 'component-config.json');
let componentConfig;
try {
  componentConfig = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error(`Failed to load component configuration from ${configPath}:`, error.message);
  // Provide sensible defaults or throw with a more descriptive error
  throw new Error(`Component configuration is required but could not be loaded: ${error.message}`);
}

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
 * Escapes regex special characters in a pattern string
 * @param {string} pattern - Pattern string to escape
 * @returns {string} Escaped pattern string
 */
function escapeRegexPattern(pattern) {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a filename matches any pattern in a pattern array
 * @param {string} filename - Filename to check
 * @param {Array} patterns - Array of patterns to match against
 * @returns {boolean} Whether filename matches any pattern
 */
function matchesPattern(filename, patterns) {
  return patterns.some(pattern => {
    // Escape regex special characters, then replace * with .*
    const escapedPattern = escapeRegexPattern(pattern).replace(/\\\*/g, '.*');
    const regex = new RegExp(`^${escapedPattern}$`);
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
  return matchesPattern(filename, skipPatterns);
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
  if (category?.patterns) {
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
 * Processes a single component file and returns configuration data
 * @param {string} file - File name to process
 * @param {string} componentName - Name of the component
 * @param {string} filePath - Full path to the file
 * @param {string} subdir - Optional subdirectory name
 * @param {string} mainFile - Main component file name (for skip check)
 * @returns {Object|null} Object with key, value, and configKey, or null if skipped
 */
function processComponentFile(file, componentName, filePath, subdir = null, mainFile = null) {
  const fileName = file.replace(/\.(tsx?|jsx?)$/, '');
  
  // Skip files that should be ignored
  if (shouldSkipFile(file) || (mainFile && file === mainFile)) {
    return null;
  }
  
  // Handle TypeScript/JavaScript files as potential sub-components
  if (matchesPattern(file, componentConfig.filePatterns.componentFiles)) {
    const category = determineCategory(componentName, file, subdir);
    const configKey = getConfigKey(category);
    
    return {
      key: `${componentName}/${fileName}/index`,
      value: filePath,
      configKey
    };
  }
  
  return null;
}

/**
 * Processes individual files in a component directory
 * @param {string} componentName - Name of the component
 * @param {string} componentPath - Path to component directory
 * @param {string} mainFile - Main component file name
 * @param {Object} config - Configuration object to update
 */
function processComponentFiles(componentName, componentPath, mainFile, config) {
  const componentFiles = discoverComponentFiles(componentPath);
  
  componentFiles.forEach(file => {
    const filePath = `src/components/${componentName}/${file}`;
    const result = processComponentFile(file, componentName, filePath, null, mainFile);
    
    if (result) {
      config[result.configKey][result.key] = result.value;
    }
  });
}

/**
 * Processes files in subdirectories of a component
 * @param {string} componentName - Name of the component
 * @param {string} componentPath - Path to component directory
 * @param {Object} config - Configuration object to update
 */
function processSubdirectories(componentName, componentPath, config) {
  const subdirectories = discoverSubdirectories(componentPath);
  
  subdirectories.forEach(subdir => {
    const subdirPath = join(componentPath, subdir);
    const subdirFiles = discoverComponentFiles(subdirPath);
    
    subdirFiles.forEach(file => {
      const filePath = `src/components/${componentName}/${subdir}/${file}`;
      const result = processComponentFile(file, componentName, filePath, subdir);
      
      if (result) {
        config[result.configKey][result.key] = result.value;
      }
    });
  });
}

/**
 * Processes special exports for a component
 * @param {string} componentName - Name of the component
 * @param {Object} mapping - Component mapping configuration
 * @param {string} mainFile - Main component file name
 * @param {Object} config - Configuration object to update
 */
function processSpecialExports(componentName, mapping, mainFile, config) {
  if (!mapping?.exports) {
    return;
  }
  
  mapping.exports.forEach(exportName => {
    const category = mapping.category;
    const configKey = getConfigKey(category);
    const mainFilePath = `src/components/${componentName}/${mainFile}`;
    
    config[configKey][`${componentName}/${exportName}/index`] = mainFilePath;
  });
}

/**
 * Processes a single component directory
 * @param {string} componentName - Name of the component
 * @param {string} componentPath - Path to component directory
 * @param {Object} config - Configuration object to update
 */
function processComponentDirectory(componentName, componentPath, config) {
  const mapping = componentConfig.componentMappings[componentName];
  
  // Main component entry (always exists)
  const mainFile = mapping?.mainFile || `${componentName}.tsx`;
  config.mainComponents[`${componentName}/index`] = `src/components/${componentName}/${mainFile}`;
  
  // Process individual files in component directory
  processComponentFiles(componentName, componentPath, mainFile, config);
  
  // Process subdirectories
  processSubdirectories(componentName, componentPath, config);
  
  // Handle special exports
  processSpecialExports(componentName, mapping, mainFile, config);
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
    processComponentDirectory(componentName, componentPath, config);
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