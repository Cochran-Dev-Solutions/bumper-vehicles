// Helper function to load images asynchronously
function loadImageAsync(p, src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const p5Image = p.createImage(img.width, img.height);
      p5Image.drawingContext.drawImage(img, 0, 0);
      resolve(p5Image);
    };
    img.src = 'src/Images/' + src;
  });
}

export { loadImageAsync };