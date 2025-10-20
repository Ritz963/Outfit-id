import fs from 'fs';
import { spawn } from 'child_process';


//just runs the background removal python script on files in input path
export function removeBackground(pythonExe, scriptPath, inputPath) {
  return new Promise((resolve, reject) => {
    const py = spawn(pythonExe, [scriptPath, inputPath]);
    let output = '';
    py.stdout.on('data', chunk => { output += chunk.toString(); });
    py.stderr.on('data', chunk => console.error('BG removal error:', chunk.toString()));
    py.on('close', code => code === 0 ? resolve(output.trim()) : reject(new Error('Background removal failed')));
  });
}