class MainApp {
    constructor() {
        this.backToTop = document.getElementById('backToTop');
        this.currentYear = new Date().getFullYear();
        
        this.init();
    }
    
    init() {
        this.setupBackToTop();
        this.setupCurrentYear();
        this.setupServiceWorker();
        this.setupAnalytics();
        this.setupPerformanceMonitoring();
        this.setupErrorHandling();
        this.setupLazyLoading();
    }
    
    setupBackToTop() {
        if (!this.backToTop) return;
        
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.scrollY > 300) {
                this.backToTop.classList.add('visible');
            } else {
                this.backToTop.classList.remove('visible');
            }
        }, 100));
        
        this.backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    setupCurrentYear() {
        const copyrightElements = document.querySelectorAll('.copyright');
        copyrightElements.forEach(element => {
            const text = element.textContent;
            element.textContent = text.replace('2024', this.currentYear.toString());
        });
        
        document.querySelectorAll('[data-current-year]').forEach(element => {
            element.textContent = this.currentYear.toString();
        });
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
    
    setupAnalytics() {
        this.trackPageView();
        this.trackUserInteractions();
    }
    
    trackPageView() {
        const pageData = {
            page: window.location.pathname,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language
        };
        
        const pageViews = Utils.loadFromLocalStorage('page_views') || [];
        pageViews.push(pageData);
        Utils.saveToLocalStorage('page_views', pageViews.slice(-100));
        
        console.log('Page view tracked:', pageData);
    }
    
    trackUserInteractions() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            const interactiveElements = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'];
            
            if (interactiveElements.includes(target.tagName) || target.closest(interactiveElements.join(','))) {
                const interactionData = {
                    type: 'click',
                    target: target.tagName.toLowerCase(),
                    text: target.textContent?.trim() || target.value || target.getAttribute('placeholder'),
                    href: target.getAttribute('href'),
                    timestamp: new Date().toISOString()
                };
                
                const interactions = Utils.loadFromLocalStorage('user_interactions') || [];
                interactions.push(interactionData);
                Utils.saveToLocalStorage('user_interactions', interactions.slice(-50));
            }
        });
    }
    
    setupPerformanceMonitoring() {
        window.addEventListener('load', () => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            console.log('Page load time:', loadTime, 'ms');
            console.log('DOM ready time:', domReadyTime, 'ms');
            
            const performanceData = {
                loadTime,
                domReadyTime,
                timestamp: new Date().toISOString(),
                url: window.location.href
            };
            
            const perfHistory = Utils.loadFromLocalStorage('performance_data') || [];
            perfHistory.push(performanceData);
            Utils.saveToLocalStorage('performance_data', perfHistory.slice(-20));
        });
    }
    
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            
            const errorData = {
                message: e.error?.message || e.message,
                stack: e.error?.stack,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                timestamp: new Date().toISOString(),
                url: window.location.href
            };
            
            const errors = Utils.loadFromLocalStorage('error_logs') || [];
            errors.push(errorData);
            Utils.saveToLocalStorage('error_logs', errors.slice(-50));
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            
            const errorData = {
                type: 'promise_rejection',
                reason: e.reason?.toString(),
                timestamp: new Date().toISOString(),
                url: window.location.href
            };
            
            const errors = Utils.loadFromLocalStorage('error_logs') || [];
            errors.push(errorData);
            Utils.saveToLocalStorage('error_logs', errors.slice(-50));
        });
    }
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    getAppStats() {
        return {
            pageViews: Utils.loadFromLocalStorage('page_views')?.length || 0,
            userInteractions: Utils.loadFromLocalStorage('user_interactions')?.length || 0,
            errors: Utils.loadFromLocalStorage('error_logs')?.length || 0,
            currentTheme: ThemeToggle.getTheme(),
            lastVisit: Utils.loadFromLocalStorage('last_visit'),
            visits: Utils.loadFromLocalStorage('visit_count') || 0
        };
    }
    
    trackVisit() {
        const now = new Date().toISOString();
        const lastVisit = Utils.loadFromLocalStorage('last_visit');
        let visitCount = Utils.loadFromLocalStorage('visit_count') || 0;
        
        if (!lastVisit || (new Date(now) - new Date(lastVisit)) > 30 * 60 * 1000) {
            visitCount++;
        }
        
        Utils.saveToLocalStorage('last_visit', now);
        Utils.saveToLocalStorage('visit_count', visitCount);
        
        return visitCount;
    }
    
    exportData() {
        const data = {
            pageViews: Utils.loadFromLocalStorage('page_views'),
            userInteractions: Utils.loadFromLocalStorage('user_interactions'),
            performance: Utils.loadFromLocalStorage('performance_data'),
            errors: Utils.loadFromLocalStorage('error_logs'),
            newsletter: Utils.loadFromLocalStorage('newsletter_subscribers'),
            settings: {
                theme: Utils.loadFromLocalStorage('theme'),
                lastVisit: Utils.loadFromLocalStorage('last_visit'),
                visitCount: Utils.loadFromLocalStorage('visit_count')
            }
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `eight-fearless-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    clearData() {
        const keys = [
            'page_views',
            'user_interactions',
            'performance_data',
            'error_logs',
            'newsletter_subscribers',
            'last_visit',
            'visit_count'
        ];
        
        keys.forEach(key => {
            Utils.removeFromLocalStorage(key);
        });
        
        Utils.showNotification('Semua data lokal telah dihapus!', 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new MainApp();
    
    app.trackVisit();
    
    window.EightFearlessApp = app;
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.debugApp = app;
        console.log('Debug commands available:');
        console.log('- debugApp.getAppStats() - Get application statistics');
        console.log('- debugApp.exportData() - Export all stored data');
        console.log('- debugApp.clearData() - Clear all stored data');
    }
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show, .lightbox.active');
        openModals.forEach(modal => {
            modal.classList.remove('show', 'active');
        });
    }
});