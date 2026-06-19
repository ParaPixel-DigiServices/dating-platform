const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(tabs)/chat.tsx',
  'src/app/(tabs)/profile.tsx',
  'src/app/(tabs)/social.tsx',
  'src/app/settings.tsx',
  'src/app/chat/[id].tsx',
  'src/app/profile/edit/[step].tsx',
  'src/app/profile/full.tsx',
  'src/components/home/SwipeDeck.tsx',
  'src/components/chat/ChatListItem.tsx',
  'src/components/chat/MessageBubble.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Map existing Playfair styles to Lato (except the bold header ones)
    content = content.replace(/PlayfairDisplay_400Regular/g, 'Lato_400Regular');
    content = content.replace(/PlayfairDisplay_500Medium/g, 'Lato_400Regular');
    content = content.replace(/PlayfairDisplay_600SemiBold/g, 'Lato_700Bold');
    // PlayfairDisplay_700Bold stays the same for headers
    
    // Some specific styling tweaks for the aesthetic
    // E.g. "PREMIUM+" or "Overview" headers are PlayfairDisplay_700Bold, but if they were 600 they became Lato. We'll leave it as is.
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated fonts to Lato in ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
