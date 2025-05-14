import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

try {
  console.log('Starting data initialization...');

  // Get current working directory
  const cwd = process.cwd();
  console.log('Current working directory:', cwd);

  // Create data directory
  const dataDir = path.join(cwd, 'data');
  console.log('Data directory path:', dataDir);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory');
  } else {
    console.log('Data directory already exists');
  }

  // Create initial visitors.json file if it doesn't exist
  const visitorsFile = path.join(dataDir, 'visitors.json');
  console.log('Visitors file path:', visitorsFile);

  if (!fs.existsSync(visitorsFile)) {
    fs.writeFileSync(visitorsFile, JSON.stringify({ count: 0 }), 'utf8');
    console.log('Created visitors.json file with initial count of 0');
  } else {
    console.log('Visitors.json file already exists');
  }

  console.log('Data initialization complete');
} catch (error) {
  console.error('Error during data initialization:', error);
  process.exit(1);
}
