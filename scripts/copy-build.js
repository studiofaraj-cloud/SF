const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'out');
const destDir = path.join(__dirname, '..', 'public');

// Remove existing public directory contents (except assets)
function copyBuild() {
  if (!fs.existsSync(sourceDir)) {
    console.error('Build output directory "out" does not exist. Run "npm run build" first.');
    process.exit(1);
  }

  // Create public directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy all files from out to public
  function copyRecursive(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(childItemName => {
        copyRecursive(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // Copy everything except node_modules and .git
  fs.readdirSync(sourceDir).forEach(item => {
    if (item !== 'node_modules' && item !== '.git') {
      copyRecursive(
        path.join(sourceDir, item),
        path.join(destDir, item)
      );
    }
  });

  console.log('✓ Build output copied to public directory');
}

copyBuild();
