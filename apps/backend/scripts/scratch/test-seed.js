const { execSync } = require('child_process');
try {
  execSync('npx ts-node seed-rich-profiles.ts', { encoding: 'utf8' });
} catch (e) {
  console.log(e.stdout);
  console.log(e.stderr);
}
