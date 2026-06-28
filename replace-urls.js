const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    content = content.replace(/'http:\/\/127\.0\.0\.1:3000/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}` + \'');
    content = content.replace(/'http:\/\/localhost:3000/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}` + \'');
    // Also handle template strings: `http://127.0.0.1:3000
    content = content.replace(/`http:\/\/127\.0\.0\.1:3000/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}');
    content = content.replace(/`http:\/\/localhost:3000/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}');
    
    // Quick fix for the newly replaced `...` + '/...'
    content = content.replace(/`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| "http:\/\/localhost:3001"}` \+ ''/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`');
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
