// Chat functionality for OpenManus
class OpenManusChat {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.chatForm = document.getElementById('chatForm');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        this.setupEventListeners();
        this.scrollToBottom();
    }

    setupEventListeners() {
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Auto-resize input on Enter key
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Focus input on page load
        this.messageInput.focus();
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Simulate API call (replace with actual API endpoint)
            const response = await this.callOpenManusAPI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again later.', 'assistant');
            console.error('Error:', error);
        }
    }

    async callOpenManusAPI(message) {
        // This is a placeholder for the actual API call
        // In a real implementation, you would call your OpenManus backend
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // For demo purposes, return a simulated response
        const responses = [
            `I understand you're asking about "${message}". Let me help you with that. I can assist with various tasks including code generation, problem solving, and information gathering.`,
            `Great question! "${message}" is something I can definitely help with. I have access to various tools and can work through complex problems step by step.`,
            `I'm processing your request about "${message}". This is exactly the kind of task I'm designed to handle. Let me work on this for you.`,
            `Thank you for asking about "${message}". I'm your AI assistant and I'm here to help you achieve your goals. Let me get started on this.`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message flex items-start space-x-3';
        
        const timestamp = new Date().toLocaleTimeString();
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="flex-1"></div>
                <div class="flex items-start space-x-3 flex-row-reverse">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-white text-sm"></i>
                        </div>
                    </div>
                    <div class="flex-1">
                        <div class="bg-green-100 rounded-lg p-3">
                            <p class="text-gray-800">${this.escapeHtml(content)}</p>
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
                <div class="flex-1">
                    <div class="bg-blue-100 rounded-lg p-3">
                        <p class="text-gray-800">${this.escapeHtml(content)}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${timestamp}</p>
                </div>
            `;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
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
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
    new OpenManusChat();
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling
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

    // Add loading animation for features
    const featureCards = document.querySelectorAll('.grid > div');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // Add hover effects
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        });
    });
});