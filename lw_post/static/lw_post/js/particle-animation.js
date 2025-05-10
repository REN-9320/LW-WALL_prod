
class ParticleSystem {
  constructor(containerSelector, options = {}) {
    this.options = {
      particleCount: 250, // Number of particles (200-300)
      particleSize: 2, // Size in pixels
      colors: ['#FF0000', '#0000FF', '#FFFFFF'], // Red, Blue, White
      bpm: 75, // Beats per minute for rhythm
      animationDuration: 60000, // Duration in ms (1 minute)
      ...options
    };

    this.beatInterval = 60000 / this.options.bpm; // ms per beat
    this.cycleTime = this.beatInterval * 2; // Complete cycle (expand + contract)
    
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error(`Container ${containerSelector} not found`);
      return;
    }
    
    this.setupCanvas();
    this.particles = [];
    this.createParticles();
    
    this.lastTime = 0;
    this.animationFrame = null;
    this.isRunning = false;
    
    this.activeElements = new Map();
  }
  
  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
    this.canvas.style.zIndex = '0'; // Behind text but above background
    
    this.container.appendChild(this.canvas);
    this.resizeCanvas();
    
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }
  
  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push(new Particle(
        this.width / 2, // Start at center
        this.height / 2,
        this.options.particleSize,
        this.options.colors[Math.floor(Math.random() * this.options.colors.length)],
        this
      ));
    }
  }
  
  addElement(element) {
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const rect = element.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    const elementData = {
      element,
      createdAt: Date.now(), // Track when the element was added
      rect: {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
        centerX: rect.left - containerRect.left + rect.width / 2,
        centerY: rect.top - containerRect.top + rect.height / 2
      }
    };
    
    this.activeElements.set(id, elementData);
    
    // Schedule removal after animation duration (1 minute)
    setTimeout(() => {
      if (this.activeElements.has(id)) {
        this.activeElements.delete(id);
      }
    }, this.options.animationDuration);
    
    return id;
  }
  
  removeElement(id) {
    this.activeElements.delete(id);
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }
  
  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  animate(currentTime = 0) {
    if (!this.isRunning) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const phase = (currentTime % this.cycleTime) / this.cycleTime;
    
    for (const [id, data] of this.activeElements.entries()) {
      if (document.body.contains(data.element)) {
        const rect = data.element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        data.rect = {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
          centerX: rect.left - containerRect.left + rect.width / 2,
          centerY: rect.top - containerRect.top + rect.height / 2
        };
      }
    }
    
    for (const particle of this.particles) {
      particle.update(deltaTime, phase);
      particle.draw(this.ctx);
    }
    
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }
}

class Particle {
  constructor(x, y, size, color, system) {
    this.system = system;
    this.baseSize = size;
    this.color = color;
    
    this.x = x;
    this.y = y;
    
    this.targetX = x;
    this.targetY = y;
    
    this.originalX = x;
    this.originalY = y;
    
    this.vx = (Math.random() - 0.5) * 2; // Initial velocity
    this.vy = (Math.random() - 0.5) * 2;
    this.mass = Math.random() * 0.5 + 0.5; // Affects how particles move
    
    this.phaseOffset = Math.random() * Math.PI * 2;
    
    this.maxDistance = Math.random() * 100 + 50;
  }
  
  update(deltaTime, phase) {
    const phaseRadians = phase * Math.PI * 2 + this.phaseOffset;
    
    const expansionFactor = Math.sin(phaseRadians) * 0.5 + 0.5;
    
    let nearestElement = null;
    let minDistance = Infinity;
    
    for (const [id, data] of this.system.activeElements.entries()) {
      const dx = this.x - data.rect.centerX;
      const dy = this.y - data.rect.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestElement = data;
      }
    }
    
    if (nearestElement) {
      const rect = nearestElement.rect;
      this.targetX = rect.x + Math.random() * rect.width;
      this.targetY = rect.y + Math.random() * rect.height;
    } else {
      this.targetX = this.originalX;
      this.targetY = this.originalY;
    }
    
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (expansionFactor < 0.5) {
      const force = 0.01 * (1 - expansionFactor * 2);
      this.vx += dx * force / this.mass;
      this.vy += dy * force / this.mass;
    } else {
      const force = 0.01 * ((expansionFactor - 0.5) * 2);
      this.vx -= dx * force / this.mass;
      this.vy -= dy * force / this.mass;
    }
    
    this.vx *= 0.98;
    this.vy *= 0.98;
    
    this.x += this.vx * deltaTime * 0.05;
    this.y += this.vy * deltaTime * 0.05;
    
    this.size = this.baseSize * (1 + expansionFactor * 0.5);
  }
  
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

let particleSystem = null;

document.addEventListener('DOMContentLoaded', () => {
  particleSystem = new ParticleSystem('#particle-container');
  particleSystem.start();
  
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.classList && node.classList.contains('item')) {
            const id = particleSystem.addElement(node);
            
            node.dataset.particleId = id;
          }
        }
        
        for (const node of mutation.removedNodes) {
          if (node.classList && node.classList.contains('item') && node.dataset.particleId) {
            particleSystem.removeElement(node.dataset.particleId);
          }
        }
      }
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  document.querySelectorAll('.item').forEach(item => {
    const id = particleSystem.addElement(item);
    item.dataset.particleId = id;
  });
});
