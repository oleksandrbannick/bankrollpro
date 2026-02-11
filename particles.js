/**
 * Bankroll Pro - Animated Particles System
 * Features: Dollar signs, coins, trend arrows floating across the screen
 */

class BankrollParticles {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.colors = {
            primary: '#00ff87',
            success: '#00ff87',
            warning: '#ffd700',
            gold: '#00ff87',
            purple: '#b944ff'
        };
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particles-canvas';
        document.body.prepend(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Create particles
        this.createParticles();
        
        // Start animation
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        const types = ['dollar', 'coin', 'arrow', 'chart', 'star'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 20 + 10,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: Math.random() * 0.3 + 0.2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            opacity: Math.random() * 0.3 + 0.1,
            type: type,
            color: this.getRandomColor(),
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01
        };
    }

    getRandomColor() {
        const colorArray = Object.values(this.colors);
        return colorArray[Math.floor(Math.random() * colorArray.length)];
    }

    drawDollar(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        this.ctx.globalAlpha = particle.opacity;
        
        this.ctx.font = `bold ${particle.size}px Arial`;
        this.ctx.fillStyle = particle.color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('$', 0, 0);
        
        this.ctx.restore();
    }

    drawCoin(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        this.ctx.globalAlpha = particle.opacity;
        
        // Outer circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
        
        // Inner circle (darker)
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size / 3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fill();
        
        // Dollar symbol
        this.ctx.font = `bold ${particle.size * 0.6}px Arial`;
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('$', 0, 0);
        
        this.ctx.restore();
    }

    drawArrow(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        this.ctx.globalAlpha = particle.opacity;
        
        const size = particle.size;
        
        // Arrow shaft
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.3, size * 0.3);
        this.ctx.lineTo(size * 0.3, -size * 0.3);
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        
        // Arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(size * 0.3, -size * 0.3);
        this.ctx.lineTo(size * 0.1, -size * 0.2);
        this.ctx.moveTo(size * 0.3, -size * 0.3);
        this.ctx.lineTo(size * 0.2, -size * 0.1);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawChart(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        this.ctx.globalAlpha = particle.opacity;
        
        const size = particle.size;
        
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.4, size * 0.2);
        this.ctx.lineTo(-size * 0.1, 0);
        this.ctx.lineTo(size * 0.1, -size * 0.3);
        this.ctx.lineTo(size * 0.4, -size * 0.1);
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawStar(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        this.ctx.globalAlpha = particle.opacity;
        
        const size = particle.size / 2;
        const spikes = 4;
        
        this.ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? size : size / 2;
            const angle = (Math.PI / spikes) * i;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
        
        this.ctx.restore();
    }

    updateParticle(particle) {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Update rotation
        particle.rotation += particle.rotationSpeed;
        
        // Update pulse
        particle.pulsePhase += particle.pulseSpeed;
        particle.opacity = 0.1 + Math.abs(Math.sin(particle.pulsePhase)) * 0.3;
        
        // Wrap around screen
        if (particle.y > this.canvas.height + particle.size) {
            particle.y = -particle.size;
            particle.x = Math.random() * this.canvas.width;
        }
        if (particle.x > this.canvas.width + particle.size) {
            particle.x = -particle.size;
        }
        if (particle.x < -particle.size) {
            particle.x = this.canvas.width + particle.size;
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            
            switch (particle.type) {
                case 'dollar':
                    this.drawDollar(particle);
                    break;
                case 'coin':
                    this.drawCoin(particle);
                    break;
                case 'arrow':
                    this.drawArrow(particle);
                    break;
                case 'chart':
                    this.drawChart(particle);
                    break;
                case 'star':
                    this.drawStar(particle);
                    break;
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize particles when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const particles = new BankrollParticles();
        particles.init();
    });
} else {
    const particles = new BankrollParticles();
    particles.init();
}
