function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function rectToRect(rect1, rect2) {
  return (
    rect1.x + rect1.width > rect2.x &&
    rect1.x < rect2.x + rect2.width &&
    rect1.y + rect1.height > rect2.y &&
    rect1.y < rect2.y + rect2.height
  );
}

function rectToCircle(rect, circle) {
  var closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  var closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  return distance(circle.x, circle.y, closestX, closestY) <= circle.radius;
}

export { rectToRect, rectToCircle };