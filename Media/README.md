# Media Management

This directory contains centralized media assets for the Bumper Vehicles project.

## Structure

```
Media/
├── images/          # All game images
│   ├── Ari_Alligator/
│   ├── Block/
│   ├── Button_Icons/
│   ├── MapScene/
│   ├── Misc/
│   ├── Penguin/
│   └── Powerups/
└── README.md
```

## Usage

### Adding New Images

1. Place new images in the appropriate subdirectory within `Media/images/`
2. Run the update script to distribute them to all apps:

```bash
pnpm run update-images
```

### Update Script

The `scripts/update_images.js` script copies all images from `Media/images/` to:

- `apps/game-frontend/public/Images/` - For web frontend
- `apps/game-mobile-frontend/assets/images/` - For mobile frontend

### Running the Script

You can run the update script in two ways:

1. Using npm/pnpm script:

   ```bash
   pnpm run update-images
   ```

2. Directly with Node.js:
   ```bash
   node scripts/update_images.js
   ```

## Benefits

- **Centralized Management**: All images are stored in one location
- **Consistency**: Both web and mobile apps use the same images
- **Easy Updates**: Single script to update all apps
- **Version Control**: All media changes are tracked in Git

## Workflow

1. Add/modify images in `Media/images/`
2. Run `pnpm run update-images`
3. Commit changes to Git
4. Both apps will have the updated images
