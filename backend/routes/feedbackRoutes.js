
const express = require("express");
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");

const router = express.Router();

router.post("/:id", async (req, res) => {
    try {
        const { email, rating, feedback } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid ticket ID"
            });
        }

        if (!email || !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                message: "Valid email and rating (1-5) are required"
            });
        }

        if (feedback && feedback.length > 1000) {
            return res.status(400).json({
                message: "Feedback cannot exceed 1000 characters"
            });
        }

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        if (ticket.email.toLowerCase() !== email.trim().toLowerCase()) {
            return res.status(403).json({
                message: "Email does not match this ticket"
            });
        }

        if (ticket.status !== "Resolved") {
            return res.status(400).json({
                message: "Please wait until your ticket is resolved"
            });
        }

        if (ticket.rating != null) {
            return res.status(400).json({
                message: "Feedback already submitted"
            });
        }

        ticket.rating = Number(rating);
        ticket.feedback = feedback || "";
        ticket.feedbackSubmittedAt = new Date();

        await ticket.save();

        res.json({
            success: true,
            message: "Thank you! Your feedback was submitted successfully."
        });

    } catch (error) {
        console.error("Feedback Error:", error);
        res.status(500).json({
            message: "Failed to submit feedback"
        });
    }
});

module.exports = router;
