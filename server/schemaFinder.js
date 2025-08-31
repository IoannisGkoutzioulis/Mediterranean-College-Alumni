// Function to find schema file regardless of case sensitivity
function findSchemaFile() {
  const fs = require('fs');
  const path = require('path');
  
  // Check for exact case match first
  const exactPath = path.join(__dirname, 'Schema.sql');
  if (fs.existsSync(exactPath)) {
    console.log('Found Schema.sql file');
    return exactPath;
  }
  
  // Check for lowercase variant
  const lowercasePath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(lowercasePath)) {
    console.log('Found schema.sql file (lowercase)');
    return lowercasePath;
  }
  
  // Try to find any sql file with "schema" in its name
  const files = fs.readdirSync(__dirname);
  for (const file of files) {
    if (file.toLowerCase().includes('schema') && file.toLowerCase().endsWith('.sql')) {
      console.log(`Found schema file with different name: ${file}`);
      return path.join(__dirname, file);
    }
  }
  
  // No schema file found
  console.error('Could not find Schema.sql or any similar file');
  return null;
}