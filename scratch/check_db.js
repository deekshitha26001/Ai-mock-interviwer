const fs = require('fs');
const { execSync } = require('child_process');

try {
  const result = execSync('npx convex data InterviewSessionTable --prod', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  const lines = result.split('\n');
  const match = lines.find(l => l.includes('j57aa15k9qmvqn6najyvty41yn8ffp34'));
  if (match) {
    console.log("MATCH FOUND:");
    console.log(match);
  } else {
    console.log("ID not found, printing available IDs:");
    lines.forEach(l => {
      const parts = l.split('|').map(s => s.trim());
      if (parts[0] && parts[0].startsWith('"j')) {
        console.log(parts[0], parts[8] || '', parts[9] || '');
      }
    });
  }
} catch (e) {
  console.error(e.message);
}
