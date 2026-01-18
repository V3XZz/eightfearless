class ContactForm {
    constructor() {
        this.contactForm = document.getElementById('contactForm');
        this.discordWebhookUrl = 'https://discord.com/api/webhooks/1427890930085658716/0in3K3XjAtPmRtw6rpBm4D1gDdR9cTA97dTUcCUhzPUJuQaI4VZoSJZbIb2MCalxi48D';
        
        this.init();
    }
    
    init() {
        if (this.contactForm) {
            this.setupFormValidation();
            this.setupFormSubmission();
        }
        
        this.setupFAQ();
    }
    
    setupFormValidation() {
        const inputs = this.contactForm.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearValidation(input);
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        switch(field.type) {
            case 'text':
                if (field.name === 'name' && value.length < 2) {
                    isValid = false;
                    message = 'Nama harus minimal 2 karakter';
                }
                break;
                
            case 'email':
                if (!Utils.validateEmail(value)) {
                    isValid = false;
                    message = 'Format email tidak valid';
                }
                break;
                
            case 'textarea':
                if (value.length < 10) {
                    isValid = false;
                    message = 'Pesan harus minimal 10 karakter';
                }
                break;
        }
        
        if (field.required && !value) {
            isValid = false;
            message = 'Field ini wajib diisi';
        }
        
        if (!isValid) {
            this.showFieldError(field, message);
        } else {
            this.showFieldSuccess(field);
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        this.clearValidation(field);
        
        field.classList.add('error');
        field.classList.remove('success');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #d9be49ff;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        field.parentNode.appendChild(errorElement);
    }
    
    showFieldSuccess(field) {
        this.clearValidation(field);
        field.classList.add('success');
        field.classList.remove('error');
    }
    
    clearValidation(field) {
        field.classList.remove('error', 'success');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    setupFormSubmission() {
        this.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const inputs = this.contactForm.querySelectorAll('input, textarea');
            let allValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    allValid = false;
                }
            });
            
            if (!allValid) {
                Utils.showNotification('Harap perbaiki error pada form!', 'error');
                return;
            }
            
            const formData = new FormData(this.contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                timestamp: new Date().toISOString(),
                ip: await this.getIPAddress()
            };
            
            this.setFormLoading(true);
            
            try {
                await this.sendToDiscord(data);
                
                Utils.showNotification('Pesan berhasil dikirim! Kami akan membalas segera.', 'success', 5000);
                
                this.contactForm.reset();
                
                inputs.forEach(input => this.clearValidation(input));
                
            } catch (error) {
                console.error('Error sending message:', error);
                Utils.showNotification('Gagal mengirim pesan. Silakan coba lagi.', 'error');
            } finally {
                this.setFormLoading(false);
            }
        });
    }
    
    async sendToDiscord(data) {
        if (!this.discordWebhookUrl || this.discordWebhookUrl === 'YOUR_DISCORD_WEBHOOK_URL_HERE') {
            console.log('Discord webhook not configured. Message data:', data);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return;
        }
        
        const embed = {
            title: `📧 Pesan Baru dari ${data.name}`,
            color: 0xd9be49,
            fields: [
            {
                name: "Nama",
                value: data.name,
                inline: true
            },
            {
                name: "Email",
                value: data.email,
                inline: true
            },
            {
                name: "Subjek",
                value: data.subject,
                inline: false
            },
            {
                name: "Pesan",
                value: data.message.length > 1000 ? data.message.substring(0, 1000) + '...' : data.message,
                inline: false
            },
            {
                name: "Waktu",
                value: `<t:${Math.floor(new Date(data.timestamp).getTime() / 1000)}:F>`,
                inline: true
            },
            {
                name: "IP",
                value: data.ip || '??????/',
                inline: true
            }
            ],
            footer: {
            text: "Eight Fearless Contact Form",
            icon_url: "https://cdn.discordapp.com/embed/avatars/0.png"
            },
            timestamp: data.timestamp
        };
        
        const payload = {
            embeds: [embed],
            username: "Eight Fearless Bot",
            avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png"
        };
        
        const response = await fetch(this.discordWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Discord webhook error: ${response.status}`);
        }
        
        return response;
    }
    
    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error getting IP address:', error);
            return null;
        }
    }
    
    setFormLoading(loading) {
        const submitBtn = this.contactForm.querySelector('button[type="submit"]');
        
        if (loading) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            submitBtn.disabled = true;
        } else {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Pesan';
            submitBtn.disabled = false;
        }
    }
    
    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                faqItems.forEach(otherItem => {
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
}

document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});

const formStyles = document.createElement('style');
formStyles.textContent = `
    .form-group input.error,
    .form-group textarea.error {
        border-color: #f56565 !important;
        box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1) !important;
    }
    
    .form-group input.success,
    .form-group textarea.success {
        border-color: #48bb78 !important;
        box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1) !important;
    }
    
    .field-error {
        color: #f56565;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .field-error::before {
        content: "⚠";
        font-size: 0.75rem;
    }
`;
document.head.appendChild(formStyles);