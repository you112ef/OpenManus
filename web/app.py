from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import asyncio
import sys
import os
from pathlib import Path

# Add the parent directory to Python path to import OpenManus
sys.path.append(str(Path(__file__).parent.parent))

try:
    from app.agent.manus import Manus
    from app.logger import logger
    OPENMANUS_AVAILABLE = True
except ImportError as e:
    logger = None
    OPENMANUS_AVAILABLE = False
    print(f"Warning: OpenManus not available: {e}")

app = FastAPI(
    title="OpenManus Web API",
    description="Web interface for OpenManus AI Agent",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    session_id: str = None

class ChatResponse(BaseModel):
    response: str
    status: str
    session_id: str = None

# Global agent instance
agent = None

@app.on_event("startup")
async def startup_event():
    """Initialize OpenManus agent on startup"""
    global agent
    if OPENMANUS_AVAILABLE:
        try:
            agent = await Manus.create()
            logger.info("OpenManus agent initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize OpenManus agent: {e}")
            agent = None
    else:
        print("OpenManus not available - running in demo mode")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global agent
    if agent:
        try:
            await agent.cleanup()
            logger.info("OpenManus agent cleaned up successfully")
        except Exception as e:
            logger.error(f"Error during agent cleanup: {e}")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    html_path = Path(__file__).parent / "index.html"
    if html_path.exists():
        return html_path.read_text(encoding='utf-8')
    else:
        return """
        <html>
            <head><title>OpenManus Web</title></head>
            <body>
                <h1>OpenManus Web Interface</h1>
                <p>Please ensure index.html exists in the same directory as app.py</p>
            </body>
        </html>
        """

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Handle chat requests"""
    global agent
    
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        if OPENMANUS_AVAILABLE and agent:
            # Use real OpenManus agent
            logger.info(f"Processing message: {request.message}")
            
            # Create a temporary response collector
            responses = []
            
            # Override the logger to capture responses
            original_info = logger.info
            def capture_response(msg):
                if "Response:" in str(msg) or "Result:" in str(msg):
                    responses.append(str(msg))
                original_info(msg)
            
            logger.info = capture_response
            
            # Run the agent
            await agent.run(request.message)
            
            # Restore original logger
            logger.info = original_info
            
            # Extract meaningful response
            if responses:
                response_text = " ".join(responses[-3:])  # Last 3 responses
            else:
                response_text = f"I've processed your request: '{request.message}'. I can help with various tasks including code generation, problem solving, and information gathering."
            
            return ChatResponse(
                response=response_text,
                status="success",
                session_id=request.session_id
            )
        else:
            # Demo mode - provide intelligent responses
            response_text = generate_demo_response(request.message)
            return ChatResponse(
                response=response_text,
                status="demo_mode",
                session_id=request.session_id
            )
            
    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        if logger:
            logger.error(error_msg)
        else:
            print(error_msg)
        
        return ChatResponse(
            response="I encountered an error while processing your request. Please try again or check the server logs.",
            status="error",
            session_id=request.session_id
        )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "openmanus_available": OPENMANUS_AVAILABLE,
        "agent_initialized": agent is not None
    }

@app.get("/api/info")
async def get_info():
    """Get OpenManus information"""
    return {
        "name": "OpenManus",
        "version": "1.0.0",
        "description": "Open Source AI Agent Framework",
        "github": "https://github.com/FoundationAgents/OpenManus",
        "discord": "https://discord.gg/DYn29wFk9z",
        "features": [
            "AI-powered task execution",
            "Multi-tool support",
            "Code generation",
            "Problem solving",
            "Information gathering"
        ]
    }

def generate_demo_response(message: str) -> str:
    """Generate intelligent demo responses when OpenManus is not available"""
    message_lower = message.lower()
    
    # Arabic language support
    if any(word in message_lower for word in ['مرحبا', 'السلام', 'اهلا', 'hello', 'hi']):
        return "مرحباً! أنا OpenManus، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟"
    
    # Code-related queries
    if any(word in message_lower for word in ['code', 'programming', 'كود', 'برمجة', 'python', 'javascript']):
        return f"أرى أنك مهتم بالبرمجة! يمكنني مساعدتك في كتابة الكود، حل المشاكل البرمجية، وشرح المفاهيم التقنية. ما هو المشروع الذي تعمل عليه؟"
    
    # Problem-solving queries
    if any(word in message_lower for word in ['help', 'problem', 'issue', 'مساعدة', 'مشكلة']):
        return f"أفهم أنك تحتاج مساعدة مع '{message}'. دعني أساعدك في حل هذه المشكلة خطوة بخطوة. هل يمكنك تقديم المزيد من التفاصيل؟"
    
    # General queries
    if 'what' in message_lower or 'كيف' in message_lower or 'متى' in message_lower:
        return f"سؤال ممتاز! '{message}' هو موضوع يمكنني مساعدتك فيه. لدي إمكانية الوصول إلى أدوات متعددة ويمكنني العمل من خلال المشاكل المعقدة خطوة بخطوة."
    
    # Default response
    responses = [
        f"أفهم طلبك حول '{message}'. دعني أساعدك في ذلك. يمكنني المساعدة في مهام مختلفة بما في ذلك توليد الكود وحل المشاكل وجمع المعلومات.",
        f"سؤال رائع! '{message}' هو شيء يمكنني بالتأكيد مساعدتك فيه. لدي إمكانية الوصول إلى أدوات متعددة ويمكنني العمل من خلال المشاكل المعقدة خطوة بخطوة.",
        f"أنا أعالج طلبك حول '{message}'. هذا بالضبط نوع المهمة التي تم تصميمي للتعامل معها. دعني أعمل على هذا من أجلك.",
        f"شكراً لك على السؤال حول '{message}'. أنا مساعدك الذكي وأنا هنا لمساعدتك في تحقيق أهدافك. دعني أبدأ في هذا."
    ]
    
    import random
    return random.choice(responses)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)