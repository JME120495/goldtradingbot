const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern 1: api.get(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/path`) -> api.get('/path')
    content = content.replace(/api\.(get|post|put|delete|patch)\(`\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*["']\/api["']\}([^`]+)`/g, 'api.$1(\'$2\'');
    
    // Pattern 2: api.get(`${process.env.NEXT_PUBLIC_API_URL || "/api"}` + '/path') -> api.get('/path')
    content = content.replace(/api\.(get|post|put|delete|patch)\(`\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*["']\/api["']\}`\s*\+\s*['"]([^'"]+)['"]/g, 'api.$1(\'$2\'');

    // Clean any double slashes like api.get('//admin...') -> api.get('/admin...')
    content = content.replace(/api\.(get|post|put|delete|patch)\('\/\/+/g, "api.$1('/");

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
      modifiedCount++;
    }
  }
});

console.log(`Finished fixing ${modifiedCount} files.`);
