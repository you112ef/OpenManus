// OpenManus Chat Interface - Real API Integration
class OpenManusChat {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.chatForm = document.getElementById('chatForm');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.sessionId = this.generateSessionId();
        this.apiBaseUrl = this.getApiBaseUrl();
        
        this.setupEventListeners();
        this.scrollToBottom();
        this.checkApiHealth();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getApiBaseUrl() {
        // Auto-detect API URL based on current location
        const currentUrl = window.location.origin;
        if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
            return 'http://localhost:8000';
        } else if (currentUrl.includes('pages.dev')) {
            // For Cloudflare Pages, we need to use the backend URL
            return 'https://your-backend-url.com'; // Replace with your actual backend URL
        } else {
            return currentUrl;
        }
    }

    async checkApiHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/health`);
            const health = await response.json();
            
            if (health.status === 'healthy') {
                console.log('API is healthy:', health);
                this.updateStatusIndicator('online');
            } else {
                console.warn('API health check failed:', health);
                this.updateStatusIndicator('offline');
            }
        } catch (error) {
            console.error('API health check failed:', error);
            this.updateStatusIndicator('offline');
        }
    }

    updateStatusIndicator(status) {
        const statusElement = document.getElementById('apiStatus');
        if (statusElement) {
            statusElement.className = `status-indicator ${status}`;
            statusElement.textContent = status === 'online' ? '🟢 متصل' : '🔴 غير متصل';
        }
    }

    setupEventListeners() {
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Focus input on page load
        this.messageInput.focus();

        // Add input validation
        this.messageInput.addEventListener('input', () => {
            this.validateInput();
        });
    }

    validateInput() {
        const message = this.messageInput.value.trim();
        const submitBtn = this.chatForm.querySelector('button[type="submit"]');
        
        if (message.length > 0 && message.length <= 1000) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50');
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || message.length > 1000) return;

        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.validateInput();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Call real OpenManus API
            const response = await this.callOpenManusAPI(message);
            this.hideTypingIndicator();
            
            if (response.status === 'success' || response.status === 'demo_mode') {
                this.addMessage(response.response, 'assistant');
            } else {
                this.addMessage('عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.', 'assistant');
            }
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Error calling API:', error);
            
            let errorMessage = 'عذراً، حدث خطأ في الاتصال. يرجى التحقق من الاتصال والمحاولة مرة أخرى.';
            
            if (error.message.includes('fetch')) {
                errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من أن الخادم يعمل.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.';
            }
            
            this.addMessage(errorMessage, 'assistant');
        }
    }

    async callOpenManusAPI(message) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('timeout');
            }
            throw error;
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message flex items-start space-x-3';
        
        const timestamp = new Date().toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="flex-1"></div>
                <div class="flex items-start space-x-3 flex-row-reverse">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-white text-sm"></i>
                        </div>
                    </div>
                    <div class="flex-1 max-w-xs md:max-w-md lg:max-w-lg">
                        <div class="bg-green-100 rounded-lg p-3 shadow-sm">
                            <p class="text-gray-800 text-right" dir="auto">${this.escapeHtml(content)}</p>
                        </div>
                        <p class="text-xs text-gray-500 mt-1 text-right">${timestamp}</p>
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <i class="fas fa-robot text-white text-sm"></i>
                    </div>
                </div>
                <div class="flex-1 max-w-xs md:max-w-md lg:max-w-lg">
                    <div class="bg-blue-100 rounded-lg p-3 shadow-sm">
                        <p class="text-gray-800" dir="auto">${this.escapeHtml(content)}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${timestamp}</p>
                </div>
            `;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Add message animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);
    }

    showTypingIndicator() {
        this.typingIndicator.classList.add('show');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.remove('show');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add utility methods
    async getOpenManusInfo() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/info`);
            const info = await response.json();
            return info;
        } catch (error) {
            console.error('Failed to get OpenManus info:', error);
            return null;
        }
    }

    clearChat() {
        // Keep only the welcome message
        const welcomeMessage = this.chatMessages.querySelector('.message:first-child');
        this.chatMessages.innerHTML = '';
        if (welcomeMessage) {
            this.chatMessages.appendChild(welcomeMessage);
        }
    }
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
    const chat = new OpenManusChat();
    
    // Add clear chat functionality
    const clearBtn = document.getElementById('clearChat');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من أنك تريد مسح المحادثة؟')) {
                chat.clearChat();
            }
        });
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.getElementById('messageInput').focus();
        }
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            chat.clearChat();
        }
    });
});

// Enhanced interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Enhanced loading animations for feature cards
    const featureCards = document.querySelectorAll('.grid > div');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        observer.observe(card);
    });

    // Enhanced hover effects with smooth transitions
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
            card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        });
    });

    // Add loading state for form submission
    const form = document.getElementById('chatForm');
    if (form) {
        form.addEventListener('submit', () => {
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> إرسال...';
            submitBtn.disabled = true;
            
            // Reset button after a delay (will be reset by the actual response)
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 5000);
        });
    }
});