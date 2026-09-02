const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(tabs)/chat.tsx',
  'src/app/(tabs)/profile.tsx',
  'src/app/(tabs)/social.tsx',
  'src/app/settings.tsx',
  'src/app/_layout.tsx',
  'src/app/chat/[id].tsx',
  'src/app/profile/edit/[step].tsx',
  'src/app/profile/full.tsx',
  'src/components/ui/BottomNav.tsx',
  'src/components/home/SwipeDeck.tsx',
  'src/components/chat/ChatListItem.tsx',
  'src/components/chat/MessageBubble.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace font references
    content = content.replace(/Outfit_300Light/g, 'PlayfairDisplay_400Regular');
    content = content.replace(/Outfit_400Regular/g, 'PlayfairDisplay_400Regular');
    content = content.replace(/Outfit_500Medium/g, 'PlayfairDisplay_500Medium');
    content = content.replace(/Outfit_600SemiBold/g, 'PlayfairDisplay_600SemiBold');
    content = content.replace(/Outfit_700Bold/g, 'PlayfairDisplay_700Bold');
    content = content.replace(/Outfit_800Black/g, 'PlayfairDisplay_700Bold');
    
    // Specifically handle layout.tsx imports
    if (file === 'src/app/_layout.tsx') {
      content = content.replace(/import \{([\s\S]*?)Outfit_([\s\S]*?)\} from '@expo-google-fonts\/outfit';/, '');
      content = content.replace(/import \{([\s\S]*?)PlayfairDisplay_([\s\S]*?)\} from '@expo-google-fonts\/playfair-display';/, `import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';`);
    }

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated fonts in ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
