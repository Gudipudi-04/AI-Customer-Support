
"use client";

import { useEffect, useState, type FormEvent } from "react";

export default function FeedbackPage() {
    const [ticketId, setTicketId] = useState("");
    const [email, setEmail] = useState("");
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setTicketId(params.get("ticketId") || "");
    }, []);

    const submitFeedback = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!ticketId) {
            setMessage("Ticket ID is missing.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/feedback/" + ticketId,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        rating,
                        feedback
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Feedback submission failed.");
            }

            setMessage(data.message || "Thank you! Feedback submitted successfully.");
            setFeedback("");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Customer Feedback
                </h1>

                <p className="text-gray-600 mb-6">
                    Your feedback helps us improve our support service.
                </p>

                <form onSubmit={submitFeedback} className="space-y-5">
                    <div>
                        <label className="block font-medium mb-2">
                            Ticket ID
                        </label>
                        <input
                            value={ticketId}
                            readOnly
                            className="w-full border rounded-lg p-3 bg-gray-100 text-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full border rounded-lg p-3"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2">
                            Rate Your Experience
                        </label>

                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-3xl ${
                                        star <= rating
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                            {rating} out of 5 stars
                        </p>
                    </div>

                    <div>
                        <label className="block font-medium mb-2">
                            Comments
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Share your experience..."
                            maxLength={1000}
                            rows={4}
                            className="w-full border rounded-lg p-3"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit Feedback"}
                    </button>
                </form>

                {message && (
                    <p className="mt-5 text-center font-medium text-blue-700">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
