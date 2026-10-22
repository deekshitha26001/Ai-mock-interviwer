const { spawnSync } = require('child_process');

// On Windows, npx needs shell: true or npm
const result = spawnSync('cmd.exe', ['/c', 'npx', 'convex', 'run', '--prod', 'Interview:GetRecordingUrl', '{\\"storageId\\":\\"kg29y62w5kf8kggz3qt50r55q18ff33n\\"}'], { encoding: 'utf-8' });
console.log("Stdout:", result.stdout);
console.log("Stderr:", result.stderr);
