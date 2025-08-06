import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = path.join(__dirname, '..', 'Media', 'images');
const GAME_FRONTEND_DEST = path.join(__dirname, '..', 'apps', 'game-frontend', 'public', 'Images');
const MOBILE_FRONTEND_DEST = path.join(__dirname, '..', 'apps', 'game-mobile-frontend', 'assets', 'images');

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
        console.error(`Source directory does not exist: ${src}`);
        return false;
    }

    ensureDirectoryExists(dest);

    const items = fs.readdirSync(src);
    
    for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
            // Recursively copy directories
            copyDirectory(srcPath, destPath);
        } else {
            // Copy files
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${item}`);
        }
    }
}

function updateImages() {
    console.log('Starting image update process...');
    
    // Copy to game-frontend
    console.log('\nCopying images to game-frontend...');
    copyDirectory(SOURCE_DIR, GAME_FRONTEND_DEST);
    
    // Copy to game-mobile-frontend
    console.log('\nCopying images to game-mobile-frontend...');
    copyDirectory(SOURCE_DIR, MOBILE_FRONTEND_DEST);
    
    console.log('\nImage update completed successfully!');
}

// Run the script
updateImages(); 