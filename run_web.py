import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.web_server:app", host="0.0.0.0", port=8000, reload=False, log_level="info")