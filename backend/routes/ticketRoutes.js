
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");

const router = express.Router();

// Automatically assign agent based on AI category
const getAgentByCategory = (category) => {
    const agentMapping = {
        Technical: "Agent 1",
        Billing: "Agent 2",
        Account: "Agent 3",
        General: "Agent 1"
    };

    return agentMapping[category] || "Agent 1";
};

// Calculate current SLA status
const getSlaStatus = (ticket) => {
    if (ticket.status === "Resolved") {
        return ticket.resolvedAt && ticket.slaDueAt &&
            new Date(ticket.resolvedAt) <= new Date(ticket.slaDueAt)
            ? "Met"
            : "Breached";
    }

    return ticket.slaDueAt && new Date() > new Date(ticket.slaDueAt)
        ? "Breached"
        : "On Track";
};

// Create Ticket with AI classification, automatic routing and SLA
router.post("/create", async (req, res) => {
    try {
        const { customerName, email, subject, message } = req.body;

        if (!customerName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        let category = "General";

        try {
            const aiResponse = await axios.post(
                "http://127.0.0.1:8000/predict",
                { message },
                { timeout: 5000 }
            );

            category = aiResponse.data.category || "General";
        } catch (aiError) {
            console.log("AI service unavailable:", aiError.message);
        }

        const assignedAgent = getAgentByCategory(category);

        const ticket = new Ticket({
            customerName,
            email,
            subject,
            message,
            category,
            assignedAgent
        });

        await ticket.save();

        res.status(201).json({
            success: true,
            message: "Ticket created and automatically assigned successfully",
            ticket
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all tickets with live SLA status
router.get("/", async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });

        const updatedTickets = tickets.map(ticket => {
            const ticketData = ticket.toObject();
            ticketData.slaStatus = getSlaStatus(ticket);
            return ticketData;
        });

        res.json({
            success: true,
            count: updatedTickets.length,
            tickets: updatedTickets
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Submit customer feedback
router.post("/:id/feedback", async (req, res) => {
    try {
        const { email, rating, feedback } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID"
            });
        }

        if (!email || !Number.isInteger(rating) ||
            rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Valid email and rating from 1 to 5 are required"
            });
        }

        if (feedback !== undefined &&
            (typeof feedback !== "string" || feedback.length > 1000)) {
            return res.status(400).json({
                success: false,
                message: "Feedback must be text with a maximum of 1000 characters"
            });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (ticket.email.toLowerCase() !== email.trim().toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: "Email does not match this ticket"
            });
        }

        if (ticket.status !== "Resolved") {
            return res.status(400).json({
                success: false,
                message: "Feedback can only be submitted for resolved tickets"
            });
        }

        if (ticket.rating !== null && ticket.rating !== undefined) {
            return res.status(409).json({
                success: false,
                message: "Feedback has already been submitted"
            });
        }

        ticket.rating = rating;
        ticket.feedback = (feedback || "").trim();
        ticket.feedbackSubmittedAt = new Date();

        await ticket.save();

        res.json({
            success: true,
            message: "Customer feedback submitted successfully",
            rating: ticket.rating,
            feedback: ticket.feedback
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update ticket status and assigned agent
router.patch("/:id", async (req, res) => {
    try {
        const { status, assignedAgent } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID"
            });
        }

        if (!status && !assignedAgent) {
            return res.status(400).json({
                success: false,
                message: "Provide status or assignedAgent to update"
            });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (status) {
            if (!["Open", "In Progress", "Resolved"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ticket status"
                });
            }

            ticket.status = status;

            if (status === "Resolved") {
                if (ticket.status !== "Resolved" || !ticket.resolvedAt) {
                    ticket.resolvedAt = new Date();
                }
            } else {
                ticket.resolvedAt = null;
            }
        }

        if (assignedAgent) {
            if (!["Agent 1", "Agent 2", "Agent 3", "Unassigned"].includes(assignedAgent)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid assigned agent"
                });
            }

            ticket.assignedAgent = assignedAgent;
        }

        ticket.slaStatus = getSlaStatus(ticket);

        await ticket.save();

        res.json({
            success: true,
            message: "Ticket updated successfully",
            ticket
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete ticket
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID"
            });
        }

        const ticket = await Ticket.findByIdAndDelete(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        res.json({
            success: true,
            message: "Ticket deleted successfully",
            ticket
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
