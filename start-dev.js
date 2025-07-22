const { spawn } = require('child_process');

const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (err) => {
  console.error('Error starting Next.js:', err);
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
});
