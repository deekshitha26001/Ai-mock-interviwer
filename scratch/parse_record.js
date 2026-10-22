const { execSync } = require('child_process');

const result = execSync('npx convex data InterviewSessionTable --prod', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
const lines = result.split('\n');
const headerLine = lines.find(l => l.includes('_id') || l.includes('recordingUrl'));
console.log("Header:", headerLine);
const match = lines.find(l => l.includes('j57aa15k9qmvqn6najyvty41yn8ffp34'));
if (headerLine && match) {
  const headers = headerLine.split('|').map(s => s.trim());
  const values = match.split('|').map(s => s.trim());
  headers.forEach((h, i) => {
    console.log(`${h}: ${values[i]}`);
  });
}
