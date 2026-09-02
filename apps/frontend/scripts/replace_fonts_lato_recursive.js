const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
    if (filePath.includes('_layout.tsx')) return; // Skip layout, handled manually
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    content = content.replace(/PlayfairDisplay_400Regular/g, 'Lato_400Regular');
    content = content.replace(/PlayfairDisplay_500Medium/g, 'Lato_400Regular');
    content = content.replace(/PlayfairDisplay_600SemiBold/g, 'Lato_700Bold');
    
    // Hard override for BottomNav specifically requested by user
    if (filePath.includes('BottomNav.tsx')) {
      content = content.replace(/fontFamily: "Lato_400Regular"/g, 'fontFamily: "Lato_700Bold"');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated fonts in ${filePath}`);
    }
  }
});
