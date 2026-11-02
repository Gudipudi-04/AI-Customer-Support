
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# Training dataset
data = {
    "ticket": [
        "My laptop is not working",
        "Application keeps crashing",
        "Unable to login to the website",
        "Internet connection is very slow",
        "Software installation failed",
        "System is showing an error",
        "I want a refund for my payment",
        "My credit card was charged twice",
        "Payment failed but money was deducted",
        "I need my invoice",
        "Subscription renewal payment issue",
        "Billing amount is incorrect",
        "I forgot my password",
        "Please reset my account password",
        "My account is locked",
        "I cannot access my profile",
        "I want to update my email address",
        "Account verification is not working",
        "Thank you for your support",
        "I need more information",
        "How can I contact customer support",
        "I have a general question",
        "Please help me with your services",
        "I want to know your business hours"
    ],
    "category": [
        "Technical", "Technical", "Technical", "Technical",
        "Technical", "Technical",
        "Billing", "Billing", "Billing", "Billing",
        "Billing", "Billing",
        "Account", "Account", "Account", "Account",
        "Account", "Account",
        "General", "General", "General", "General",
        "General", "General"
    ]
}

df = pd.DataFrame(data)

# Create AI classification pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
    ("classifier", MultinomialNB())
])

# Train model
model.fit(df["ticket"], df["category"])

# Save trained model
joblib.dump(model, "model.pkl")

print("AI Ticket Classification Model Trained Successfully!")
print("Model saved as model.pkl")

# Test predictions
test_tickets = [
    "My payment was deducted twice",
    "I cannot login to my account",
    "My application is crashing",
    "I have a question about your service"
]

predictions = model.predict(test_tickets)

print("\nAI Prediction Results:")
for ticket, prediction in zip(test_tickets, predictions):
    print(f"Ticket: {ticket}")
    print(f"Category: {prediction}")
    print("-" * 40)
