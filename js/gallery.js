class Gallery {
    constructor() {
        this.galleryGrid = document.getElementById('galleryGrid');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxClose = document.getElementById('lightboxClose');
        this.lightboxPrev = document.getElementById('lightboxPrev');
        this.lightboxNext = document.getElementById('lightboxNext');
        this.lightboxTitle = document.getElementById('lightboxTitle');
        this.lightboxDescription = document.getElementById('lightboxDescription');
        this.lightboxImageContainer = document.querySelector('.lightbox-image-container');
        
        this.currentImageIndex = 0;
        this.images = [];
        this.currentFilter = 'all';
        
        this.init();
    }
    
    init() {
        this.setupFiltering();
        this.setupLightbox();
        this.setupKeyboardNavigation();
        this.loadGalleryData();
    }
    
    setupFiltering() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentFilter = btn.getAttribute('data-filter');
                this.filterImages(this.currentFilter);
                
                const filterText = btn.textContent.trim();
                Utils.showNotification(`Menampilkan: ${filterText}`, 'info', 2000);
            });
        });
    }
    
    filterImages(filter) {
        const galleryItems = this.galleryGrid.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
                item.style.animation = 'fadeIn 0.5s ease';
            } else {
                item.style.display = 'none';
            }
        });
        
        this.updateImagesArray();
    }
    
    setupLightbox() {
        document.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                this.openLightbox(galleryItem);
            }
        });
        
        if (this.lightboxClose) {
            this.lightboxClose.addEventListener('click', () => this.closeLightbox());
        }
        
        if (this.lightboxPrev) {
            this.lightboxPrev.addEventListener('click', () => this.previousImage());
        }
        
        if (this.lightboxNext) {
            this.lightboxNext.addEventListener('click', () => this.nextImage());
        }
        
        if (this.lightbox) {
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) {
                    this.closeLightbox();
                }
            });
        }
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox || !this.lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.previousImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
            }
        });
    }
    
    openLightbox(galleryItem) {
        if (!this.lightbox) return;
        
        this.updateImagesArray();
        
        const clickedIndex = Array.from(this.images).indexOf(galleryItem);
        this.currentImageIndex = clickedIndex !== -1 ? clickedIndex : 0;
        
        this.updateLightboxContent();
        
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.lightbox.style.animation = 'fadeIn 0.3s ease';
    }
    
    closeLightbox() {
        if (!this.lightbox) return;
        
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        this.lightbox.style.animation = '';
    }
    
    previousImage() {
        if (this.images.length === 0) return;
        
        this.currentImageIndex = this.currentImageIndex > 0 
            ? this.currentImageIndex - 1 
            : this.images.length - 1;
        
        this.updateLightboxContent();
    }
    
    nextImage() {
        if (this.images.length === 0) return;
        
        this.currentImageIndex = this.currentImageIndex < this.images.length - 1 
            ? this.currentImageIndex + 1 
            : 0;
        
        this.updateLightboxContent();
    }
    
    updateLightboxContent() {
        if (this.images.length === 0) return;
        
        const currentItem = this.images[this.currentImageIndex];
        const caption = currentItem.querySelector('.gallery-caption');
        const title = caption?.querySelector('h4')?.textContent || 'Gambar';
        const description = caption?.querySelector('p')?.textContent || '';
        
        const galleryImg = currentItem.querySelector('img');
        const placeholderDiv = currentItem.querySelector('.gallery-image-placeholder');
        
        this.lightboxImageContainer.innerHTML = '';
        
        if (galleryImg) {
            const img = document.createElement('img');
            img.src = galleryImg.src;
            img.alt = galleryImg.alt || title;
            img.style.width = '100%';
            img.style.maxHeight = '80vh';
            img.style.objectFit = 'contain';
            img.style.borderRadius = 'var(--radius-md)';
            
            this.lightboxImageContainer.appendChild(img);
        } else if (placeholderDiv) {
            const placeholder = document.createElement('div');
            placeholder.className = 'lightbox-image-placeholder';
            placeholder.innerHTML = placeholderDiv.innerHTML;
            this.lightboxImageContainer.appendChild(placeholder);
        }
        
        if (this.lightboxTitle) this.lightboxTitle.textContent = title;
        if (this.lightboxDescription) this.lightboxDescription.textContent = description;
        
        this.lightbox.style.animation = 'fadeIn 0.3s ease';
    }
    
    updateImagesArray() {
        const selector = this.currentFilter === 'all' 
            ? '.gallery-item' 
            : `.gallery-item[data-category="${this.currentFilter}"]`;
        
        this.images = Array.from(this.galleryGrid.querySelectorAll(selector)).filter(
            item => item.style.display !== 'none'
        );
    }
    
    loadGalleryData() {
        this.updateImagesArray();
        
        const galleryItems = this.galleryGrid.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.05)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1)';
            });
        });
    }
    
    addImage(imageData) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-category', imageData.category);
        
        galleryItem.innerHTML = `
            ${imageData.imageUrl ? 
                `<img src="${imageData.imageUrl}" alt="${imageData.title || 'Gallery image'}">` : 
                `<div class="gallery-image-placeholder">
                    <i class="${imageData.icon || 'fas fa-image'}"></i>
                </div>`
            }
            <div class="gallery-category">${this.getCategoryName(imageData.category)}</div>
            <div class="gallery-caption">
                <h4>${imageData.title}</h4>
                <p>${imageData.description}</p>
            </div>
        `;
        
        this.galleryGrid.appendChild(galleryItem);
        this.updateImagesArray();
        
        galleryItem.style.animation = 'fadeIn 0.5s ease';
    }
    
    getCategoryName(category) {
        const categories = {
            'activity': 'Kegiatan',
            'class': 'Kelas',
            'ceremony': 'Upacara',
            'sports': 'Olahraga'
        };
        return categories[category] || category;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Gallery();
});