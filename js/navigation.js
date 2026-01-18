class Navigation {
    constructor() {
        this.navToggle = document.getElementById('navToggle');
        this.mainNav = document.getElementById('mainNav');
        this.navLinks = document.querySelectorAll('nav a');
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        this.init();
    }
    
    init() {
        this.setupMobileNavigation();
        this.setupActiveLinks();
        this.setupSmoothScroll();
        this.setupDropdowns();
    }
    
    setupMobileNavigation() {
        if (!this.navToggle || !this.mainNav) return;
        
        this.navToggle.addEventListener('click', () => {
            this.mainNav.classList.toggle('active');
            this.navToggle.setAttribute(
                'aria-expanded', 
                this.mainNav.classList.contains('active')
            );
            
            const icon = this.navToggle.querySelector('i');
            if (icon) {
                icon.className = this.mainNav.classList.contains('active') 
                    ? 'fas fa-times' 
                    : 'fas fa-bars';
            }
        });
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.mainNav.classList.contains('active')) {
                    this.mainNav.classList.remove('active');
                    this.navToggle.setAttribute('aria-expanded', 'false');
                    const icon = this.navToggle.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                }
            });
        });
        
        document.addEventListener('click', (e) => {
            if (this.mainNav.classList.contains('active') && 
                !this.mainNav.contains(e.target) && 
                !this.navToggle.contains(e.target)) {
                this.mainNav.classList.remove('active');
                this.navToggle.setAttribute('aria-expanded', 'false');
                const icon = this.navToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mainNav.classList.contains('active')) {
                this.mainNav.classList.remove('active');
                this.navToggle.setAttribute('aria-expanded', 'false');
                const icon = this.navToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });
    }
    
    setupActiveLinks() {
        this.navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            
            link.classList.remove('active');
            
            if (linkPage === this.currentPage || 
                (this.currentPage === 'index.html' && linkPage === './') ||
                (this.currentPage === '' && linkPage === './') ||
                (this.currentPage.includes(linkPage.replace('.html', '')) && linkPage !== './')) {
                link.classList.add('active');
            }
            
            if (link.hostname !== window.location.hostname) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
    
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    Utils.scrollToElement(targetElement, 100);
                }
            });
        });
    }
    
    setupDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                        if (otherMenu !== menu) {
                            otherMenu.classList.remove('show');
                        }
                    });
                    
                    menu.classList.toggle('show');
                });
            }
        });
        
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        });
    }
    
    updateActiveLink(page) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === page) {
                link.classList.add('active');
            }
        });
    }
    
    closeMobileMenu() {
        if (this.mainNav.classList.contains('active')) {
            this.mainNav.classList.remove('active');
            this.navToggle.setAttribute('aria-expanded', 'false');
            const icon = this.navToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
});