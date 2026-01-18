class Animations {
    constructor() {
        this.observer = null;
        this.scrollProgress = null;
        this.init();
    }
    
    init() {
        this.setupScrollAnimations();
        this.setupScrollProgress();
        this.setupParallax();
        this.setupLoadingAnimation();
        this.setupHoverEffects();
    }
    
    setupScrollAnimations() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    if (entry.target.classList.contains('stagger-list')) {
                        this.animateStaggerChildren(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            this.observer.observe(el);
        });
        
        document.querySelectorAll('.stagger-list').forEach(el => {
            this.observer.observe(el);
        });
    }
    
    animateStaggerChildren(parent) {
        const children = parent.querySelectorAll('.stagger-item');
        children.forEach((child, index) => {
            child.style.transitionDelay = `${index * 100}ms`;
            child.classList.add('animate-in');
        });
    }
    
    setupScrollProgress() {
        if (!document.querySelector('.scroll-progress')) {
            this.scrollProgress = document.createElement('div');
            this.scrollProgress.className = 'scroll-progress';
            this.scrollProgress.innerHTML = '<div class="scroll-progress-bar"></div>';
            document.body.appendChild(this.scrollProgress);
            
            const styles = document.createElement('style');
            styles.textContent = `
                .scroll-progress {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: transparent;
                    z-index: 10000;
                    pointer-events: none;
                }
                .scroll-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                    width: 0%;
                    transition: width 0.1s ease;
                }
            `;
            document.head.appendChild(styles);
        } else {
            this.scrollProgress = document.querySelector('.scroll-progress');
        }
        
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateScrollProgress();
        }, 10));
        
        this.updateScrollProgress();
    }
    
    updateScrollProgress() {
        if (!this.scrollProgress) return;
        
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        const progressBar = this.scrollProgress.querySelector('.scroll-progress-bar');
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    }
    
    setupParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length > 0) {
            window.addEventListener('scroll', Utils.throttle(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                
                parallaxElements.forEach(element => {
                    const speed = element.getAttribute('data-parallax') || 0.5;
                    element.style.transform = `translateY(${rate * speed}px)`;
                });
            }, 10));
        }
    }
    
    setupLoadingAnimation() {
        window.addEventListener('load', () => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
            
            setTimeout(() => {
                document.body.classList.add('page-loaded');
            }, 500);
        });
        
        setTimeout(() => {
            if (document.body.classList.contains('loading')) {
                document.body.classList.remove('loading');
                document.body.classList.add('loaded', 'page-loaded');
            }
        }, 3000);
    }
    
    setupHoverEffects() {
        document.querySelectorAll('.card, .btn, .gallery-item').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-5px)';
                element.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0)';
                element.style.boxShadow = '';
            });
        });
    }
    
    animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    }
    
    triggerConfetti() {
        const confettiCount = 100;
        const colors = ['#4a6fa5', '#6d8bc4', '#ff7e5f', '#48bb78', '#ed8936'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                border-radius: 2px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
            });
            
            animation.onfinish = () => {
                confetti.remove();
            };
        }
    }
    
    typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Animations();
});