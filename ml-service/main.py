
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import os

app = FastAPI(title="AI Customer Support Classification API")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
model = joblib.load(MODEL_PATH)

class TicketRequest(BaseModel):
    message: str

@app.get("/")
def home():
    return {
        "message": "AI Ticket Classification API is running"
    }

@app.post("/predict")
def predict_ticket(ticket: TicketRequest):
    prediction = model.predict([ticket.message])[0]

    return {
        "ticket": ticket.message,
        "category": prediction,
        "status": "success"
    }
