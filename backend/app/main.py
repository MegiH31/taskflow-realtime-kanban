from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Task Board API is running"}
    