const image  = document.getElementById('image');
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
let ports    = [];

// Resize canvas to overlay the image
function resizeCanvas() {
  const rect = image.getBoundingClientRect();
  const dpr  = window.devicePixelRatio || 1;

  canvas.width  = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width  = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}

// Unified click handler for placing ports
function handleCanvasClick(e) {
  // Ensure canvas is sized
  if (canvas.width === 0 || canvas.height === 0) {
    resizeCanvas();
  }

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const sizeInput = prompt('Enter port size (1–12 mm):');
  const size = parseInt(sizeInput, 10);
  if (!Number.isInteger(size) || size < 1 || size > 12) {
    alert('Please enter an integer between 1 and 12.');
    return;
  }

  ports.push({ x, y, size });
  redraw();
}

// Draw all ports on-screen
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dpr = window.devicePixelRatio || 1;

  ports.forEach(({ x, y, size }) => {
    const radius = (10 + size) * 0.4;

    // dot
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#2c2c2c';
    ctx.fill();

    // label (black)
    ctx.font = `${5 * dpr}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000';
    ctx.fillText(`${size} mm`, x - radius, y + radius + 2);
  });
}

// Undo / Clear
document.getElementById('undoBtn')
  .addEventListener('click', () => { ports.pop(); redraw(); });
document.getElementById('clearBtn')
  .addEventListener('click', () => { ports = []; redraw(); });

// Download annotated image
document.getElementById('downloadBtn')
  .addEventListener('click', () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width  = image.naturalWidth;
    exportCanvas.height = image.naturalHeight;
    const exportCtx = exportCanvas.getContext('2d');

    // draw full-res image
    exportCtx.drawImage(image, 0, 0);

    const rect  = image.getBoundingClientRect();
    const scale = image.naturalWidth / rect.width;

    // draw each port scaled
    ports.forEach(({ x, y, size }) => {
      const radius = (10 + size) * scale * 0.4;
      const sx     = x * scale;
      const sy     = y * scale;

      exportCtx.beginPath();
      exportCtx.arc(sx, sy, radius, 0, 2 * Math.PI);
      exportCtx.fillStyle = '#2c2c2c';
      exportCtx.fill();

      exportCtx.font = `${5 * scale}px sans-serif`;
      exportCtx.textBaseline = 'top';
      exportCtx.fillStyle = '#000';
      exportCtx.fillText(`${size} mm`, sx - radius, sy + radius + 2);
    });

    // trigger download
    const link = document.createElement('a');
    link.download = 'port_placement.jpg';
    link.href = exportCanvas.toDataURL('image/jpeg', 1.0);
    link.click();
  });

// Hook up resizing
image.addEventListener('load', resizeCanvas);
// If image was cached, force an initial resize
if (image.complete) resizeCanvas();

window.addEventListener('resize', () => {
  clearTimeout(window._resizeTimeout);
  window._resizeTimeout = setTimeout(resizeCanvas, 100);
});

// **Only** the wrapper listens for clicks now
const wrapper = document.querySelector('.canvas-wrapper');
wrapper.addEventListener('click', handleCanvasClick);
