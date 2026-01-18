class Blog {
    constructor() {
        this.blogGrid = document.querySelector('.blog-grid');
        this.newsletterForm = document.querySelector('.newsletter-form');
        this.faqItems = document.querySelectorAll('.faq-item');
        this.currentPage = 1;
        this.postsPerPage = 6;
        
        this.init();
    }
    
    init() {
        this.setupFAQ();
        this.setupNewsletter();
        this.setupReadingProgress();
        this.setupShareButtons();
        this.loadBlogPosts();
    }
    
    setupFAQ() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                this.faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                item.classList.toggle('active');
                
                const icon = question.querySelector('i');
                if (icon) {
                    icon.className = item.classList.contains('active') 
                        ? 'fas fa-chevron-up' 
                        : 'fas fa-chevron-down';
                }
            });
        });
    }
    
    setupNewsletter() {
        if (this.newsletterForm) {
            this.newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const emailInput = this.newsletterForm.querySelector('input[type="email"]');
                const email = emailInput.value.trim();
                
                if (!Utils.validateEmail(email)) {
                    Utils.showNotification('Format email tidak valid!', 'error');
                    return;
                }
                
                this.subscribeToNewsletter(email);
            });
        }
    }
    
    subscribeToNewsletter(email) {
        const submitBtn = this.newsletterForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            const subscribers = Utils.loadFromLocalStorage('newsletter_subscribers') || [];
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                Utils.saveToLocalStorage('newsletter_subscribers', subscribers);
            }
            
            this.newsletterForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            Utils.showNotification('Berhasil berlangganan newsletter!', 'success');
        }, 1500);
    }
    
    setupReadingProgress() {
        if (document.querySelector('.blog-post')) {
            this.createReadingProgress();
        }
    }
    
    createReadingProgress() {
        const readingProgress = document.createElement('div');
        readingProgress.className = 'reading-progress';
        readingProgress.innerHTML = '<div class="reading-progress-bar"></div>';
        
        if (!document.querySelector('#reading-progress-styles')) {
            const styles = document.createElement('style');
            styles.id = 'reading-progress-styles';
            styles.textContent = `
                .reading-progress {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: transparent;
                    z-index: 10000;
                }
                .reading-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                    width: 0%;
                    transition: width 0.1s ease;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(readingProgress);
        
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateReadingProgress();
        }, 10));
    }
    
    updateReadingProgress() {
        const progressBar = document.querySelector('.reading-progress-bar');
        if (!progressBar) return;
        
        const article = document.querySelector('.post-content');
        if (!article) return;
        
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        
        const scrolled = window.pageYOffset;
        const progress = ((scrolled - articleTop + windowHeight) / articleHeight) * 100;
        
        progressBar.style.width = Math.min(Math.max(progress, 0), 100) + '%';
    }
    
    setupShareButtons() {
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sharePost(btn);
            });
        });
    }
    
    sharePost(btn) {
        const url = window.location.href;
        const title = document.querySelector('.post-title')?.textContent || document.title;
        
        if (navigator.share) {
            navigator.share({
                title: title,
                url: url
            });
        } else {
            Utils.copyToClipboard(url).then(() => {
                Utils.showNotification('Link berhasil disalin!', 'success');
            });
        }
    }
    
    loadBlogPosts() {
        this.initializePostInteractions();
    }
    
    initializePostInteractions() {
        document.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' || e.target.closest('a')) return;
                
                const link = card.querySelector('a');
                if (link) {
                    window.location.href = link.href;
                }
            });
        });
        
        this.simulateViewCounts();
    }
    
    simulateViewCounts() {
        document.querySelectorAll('.blog-card').forEach(card => {
            const views = Math.floor(Math.random() * 200) + 50;
            const meta = card.querySelector('.blog-meta');
            
            if (meta) {
                const viewElement = document.createElement('span');
                viewElement.innerHTML = `<i class="fas fa-eye"></i> ${views}x dilihat`;
                meta.appendChild(viewElement);
            }
        });
    }
    
    loadMorePosts() {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...';
            loadMoreBtn.disabled = true;
        }
        
        setTimeout(() => {
            this.currentPage++;
            
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = 'Muat Lebih Banyak';
                loadMoreBtn.disabled = false;
            }
            
            Utils.showNotification('Postingan baru dimuat!', 'success');
        }, 1000);
    }
    
    searchPosts(query) {
        const searchResults = document.querySelector('.search-results');
        const blogGrid = document.querySelector('.blog-grid');
        
        if (searchResults) {
            searchResults.style.display = query ? 'block' : 'none';
            blogGrid.style.display = query ? 'none' : 'grid';
            
            if (query) {
                this.showSearchResults(query);
            }
        }
    }
    
    showSearchResults(query) {
        const searchResults = document.querySelector('.search-results');
        searchResults.innerHTML = `
            <div class="search-info">
                <h3>Hasil pencarian untuk "${query}"</h3>
                <p>Menampilkan hasil pencarian...</p>
            </div>
        `;
    }
    
    filterByCategory(category) {
        const blogCards = document.querySelectorAll('.blog-card');
        
        blogCards.forEach(card => {
            const cardCategory = card.querySelector('.blog-category')?.textContent.toLowerCase();
            
            if (category === 'all' || cardCategory === category.toLowerCase()) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
        
        Utils.showNotification(`Menampilkan kategori: ${category}`, 'info');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Blog();
});