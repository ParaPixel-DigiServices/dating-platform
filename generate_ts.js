const fs = require('fs');
const data = JSON.parse(fs.readFileSync('options_data.json', 'utf8'));

let content = `export const EDUCATION_OPTIONS = ${JSON.stringify(data.education, null, 2)};\n`;
content += `export const WORK_ROLE_OPTIONS = ${JSON.stringify(data.workRole, null, 2)};\n`;

fs.writeFileSync('apps/frontend/src/data/marriageOptions.ts', content);
