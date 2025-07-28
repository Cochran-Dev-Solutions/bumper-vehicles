// Helper function to load images asynchronously
function loadImageAsync(p, src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const p5Image = p.createImage(img.width, img.height);
      p5Image.drawingContext.drawImage(img, 0, 0);
      resolve(p5Image);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };

    // Use the public directory path for both development and production
    img.src = "/Images/" + src;
  });
}

// Centralized image cache
export const p5Images = {};

// Sky system variables (shared across scenes)
export let skyBackground = null;
export let sunPosition = { x: 0, y: 0 };
export let timeOfDay = 0;

// Calculate sun position based on time of day
function calculateSunPosition(p, hour) {
  // Map 24-hour time to sun position
  // 6 AM = left side, 12 PM = top, 6 PM = right side, 12 AM = bottom
  const angle = p.map(hour, 0, 24, 0, p.TWO_PI);

  // Sun follows an arc across the sky
  const radius = p.width * 0.4;
  const centerX = p.width / 2;
  const centerY = p.height * 0.8; // Sun arc center

  sunPosition.x = centerX + p.cos(angle) * radius;
  sunPosition.y = centerY - p.sin(angle) * radius * 0.8; // Flatten the arc

  // Keep sun within screen bounds
  sunPosition.x = p.constrain(sunPosition.x, 50, p.width - 50);
  sunPosition.y = p.constrain(sunPosition.y, 50, p.height * 0.3);
}

// Create perlin noise sky background with sun ray lighting
async function createPerlinSkyBackground(p) {
  console.log('Creating new sky background...');
  const canvas = p.createGraphics(p.width, p.height);

  // Get current time to determine day/night cycle
  const now = new Date();
  const hour = now.getHours();
  timeOfDay = hour;

  // Calculate sun position based on time
  calculateSunPosition(p, hour);

  // Define sun ray properties
  const rayDirX = p.width / 2 - sunPosition.x;
  const rayDirY = p.height / 2 - sunPosition.y;
  const rayLength = Math.sqrt(rayDirX * rayDirX + rayDirY * rayDirY);
  const sunRayStrength = 2.0; // Much stronger sun effect
  const sunRayFalloff = 0.002; // Slower falloff for more dramatic effect

  // Create brownish perlin noise sky with hills and valleys
  // Use a step size to improve performance
  const stepSize = 5; // Process every 5th pixel for much better performance

  for (let x = 0; x < p.width; x += stepSize) {
    for (let y = 0; y < p.height; y += stepSize) {
      // Create multiple layers of perlin noise for more organic variation
      const noise1 = p.noise(x * 0.005, y * 0.005) * 0.5;
      const noise2 = p.noise(x * 0.02, y * 0.02) * 0.3;
      const noise3 = p.noise(x * 0.05, y * 0.05) * 0.2;

      // Combine noise layers for hills and valleys effect
      const combinedNoise = noise1 + noise2 + noise3;

      // Calculate sun ray effect for this pixel
      // Calculate perpendicular distance from pixel to the sun's ray line
      // The ray line goes from sun position to center of screen
      const centerX = p.width / 2;
      const centerY = p.height / 2;

      // Vector from sun to center (the ray line)
      const rayLineX = centerX - sunPosition.x;
      const rayLineY = centerY - sunPosition.y;
      const rayLineLength = Math.sqrt(
        rayLineX * rayLineX + rayLineY * rayLineY
      );

      // Vector from sun to pixel
      const toPixelX = x - sunPosition.x;
      const toPixelY = y - sunPosition.y;

      // Project pixel position onto ray line to find closest point
      const projection =
        (toPixelX * rayLineX + toPixelY * rayLineY) /
        (rayLineLength * rayLineLength);
      const closestPointX = sunPosition.x + projection * rayLineX;
      const closestPointY = sunPosition.y + projection * rayLineY;

      // Calculate perpendicular distance from pixel to ray line
      const perpendicularDistance = Math.sqrt(
        (x - closestPointX) * (x - closestPointX) +
          (y - closestPointY) * (y - closestPointY)
      );

      // Calculate distance along the ray line (how far from sun along the ray)
      const distanceAlongRay = projection * rayLineLength;

      // Calculate sun lighting effect
      let sunEffect = 0;

      // First, add circular glow around the sun
      const distanceFromSun = Math.sqrt(
        (x - sunPosition.x) * (x - sunPosition.x) +
          (y - sunPosition.y) * (y - sunPosition.y)
      );
      const sunGlowRadius = 200; // Radius of the sun's circular glow
      const sunGlowFalloff = 0.01; // How quickly the glow falls off

      if (distanceFromSun < sunGlowRadius) {
        // Circular glow effect
        const glowFalloff = Math.max(0, 1 - distanceFromSun * sunGlowFalloff);
        sunEffect += glowFalloff * sunRayStrength * 2; // Stronger glow effect
      }

      // Then add ray effects
      if (projection > 0 && distanceAlongRay > 0) {
        // Only affect pixels in front of sun along ray
        // Perpendicular distance falloff - closer to ray line = brighter
        const perpendicularFalloff = Math.max(
          0,
          1 - perpendicularDistance * sunRayFalloff * 6
        );

        // Distance along ray falloff - further from sun along ray = dimmer
        const rayDistanceFalloff = Math.max(
          0,
          1 - distanceAlongRay * sunRayFalloff
        );

        // Combine ray effects
        const rayEffect =
          perpendicularFalloff * rayDistanceFalloff * sunRayStrength;
        sunEffect += rayEffect;
      }

      // Map noise to brown/orange color variations
      let r, g, b;

      // Base colors
      r = p.map(combinedNoise, 0, 1, 80, 215);
      g = p.map(combinedNoise, 0, 1, 60, 175);
      b = p.map(combinedNoise, 0, 1, 40, 125);

      // Apply sun lighting effect
      const brightnessBoost = 1 + sunEffect;
      r = Math.min(255, r * brightnessBoost);
      g = Math.min(255, g * brightnessBoost);
      b = Math.min(255, b * brightnessBoost);

      // Fill a larger area with the same color for better performance
      canvas.fill(r, g, b);
      canvas.noStroke();
      canvas.rect(x, y, stepSize, stepSize);
    }
  }

  // Store the original canvas - we'll apply blur during rendering
  skyBackground = canvas;
}

// List of all image loading operations
export const images_to_load = [
  // External images
  {
    name: "Loading island image",
    estimated_time: 0.5,
    operation: async function() {
      p5Images["island"] = await loadImageAsync(
        this.p,
        "MapScene/Islands/example_island.png"
      );
    }
  },
  {
    name: "Loading cloud image",
    estimated_time: 0.5,
    operation: async function() {
      p5Images["cloud"] = await loadImageAsync(this.p, "MapScene/Islands/cloud.png");
    }
  },
  {
    name: "Loading coins image",
    estimated_time: 0.5,
    operation: async function() {
      p5Images["coins"] = await loadImageAsync(this.p, "coins.png");
    }
  },
  {
    name: "Loading landing_bay image",
    estimated_time: 0.5,
    operation: async function() {
      p5Images["landing_bay"] = await loadImageAsync(this.p, "landing_bay.png");
    }
  },
  {
    name: "Loading capsule image",
    estimated_time: 0.5,
    operation: async function() {
      p5Images["xp_capsule"] = await loadImageAsync(this.p, "xp_capsule.png");
    }
  },
  {
    name: "Loading desk image",
    estimated_time: 0.5,
    operation: async function() {
      p5Images["desk"] = await loadImageAsync(this.p, "desk.png");
    }
  },
  {
    name: "Loading mystery_box image",
    estimated_time: 0.5,
    operation: async function() {
      p5Images["mystery_box"] = await loadImageAsync(this.p, "mystery_box.png");
    }
  },
  {
    name: "Loading button icons",
    estimated_time: 0.5,
    operation: async function() {
      p5Images["characters_button"] = await loadImageAsync(this.p, "Button_Icons/characters_button.png");
      p5Images["achievements_button"] = await loadImageAsync(this.p, "Button_Icons/achievements_button.png");
      p5Images["powerups_button"] = await loadImageAsync(this.p, "Button_Icons/powerups_button.png");
      p5Images["upgrades_button"] = await loadImageAsync(this.p, "Button_Icons/upgrades_button.png");
    }
  },
  // Animation frames
  {
    name: "Loading Ari_Alligator animation frames",
    estimated_time: 1.5,
    operation: async function() {
      const promises = [];
      for (let i = 1; i <= 15; i++) {
        promises.push(loadImageAsync(this.p, `Ari_Alligator/frame_${i}.png`));
      }
      const frames = await Promise.all(promises);
      p5Images["ari_alligator_frames"] = frames;
    }
  },
  // Created images
  {
    name: "Creating perlin noise sky",
    estimated_time: 1,
    operation: async function() {
      await createPerlinSkyBackground(this.p);
    }
  }
];

export { loadImageAsync };
