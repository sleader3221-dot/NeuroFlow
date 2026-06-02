const { execSync, spawnSync } = require('child_process');
const path = require('path');

// Try to find git in various locations
const gitPaths = [
  'git',
  'C:\\Program Files\\Git\\bin\\git.exe',
  'C:\\Program Files\\Git\\cmd\\git.exe',
  'C:\\Program Files (x86)\\Git\\bin\\git.exe',
];

let gitExe = null;
for (const g of gitPaths) {
  try {
    const r = spawnSync(g, ['--version'], { encoding: 'utf8' });
    if (r.status === 0) { gitExe = g; break; }
  } catch {}
}

if (!gitExe) {
  // Try from PATH env
  const paths = (process.env.PATH || '').split(';');
  console.log('PATH entries:', paths.join('\n'));
  console.log('Could not find git');
  process.exit(1);
}

console.log('Found git:', gitExe);
const cwd = 'C:\\Users\\USER\\.gemini\\antigravity\\scratch\\neuroflow-ai';
const run = (args) => {
  const r = spawnSync(gitExe, args, { cwd, encoding: 'utf8' });
  console.log(r.stdout + r.stderr);
  return r;
};

run(['add', '-A']);
run(['commit', '-m', 'feat: 10 features - AI flashcard gen, CSV import, keyboard shortcuts, Markdown notes, Focus Sounds, Weekly Report, Exam Countdown, Ebbinghaus curve, Web Notifications, PWA']);
run(['push', 'origin', 'main']);
console.log('Done!');
