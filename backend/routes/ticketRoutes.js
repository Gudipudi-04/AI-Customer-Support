
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");

const router = express.Router();

// Create Ticket with AI classification
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

            category = aiResponse.data.category;
        } catch (aiError) {
            console.log("AI service unavailable:", aiError.message);
        }

        const ticket = new Ticket({
            customerName,
            email,
            subject,
            message,
            category
        });

        await ticket.save();

        res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            ticket
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all tickets
router.get("/", async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tickets.length,
            tickets
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

        if (!status && !assignedAgent) {
            return res.status(400).json({
                success: false,
                message: "Provide status or assignedAgent to update"
            });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            {
                ...(status && { status }),
                ...(assignedAgent && { assignedAgent })
            },
            { new: true, runValidators: true }
        );

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

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
