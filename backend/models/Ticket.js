
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: "General"
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },
    status: {
        type: String,
        enum: ["Open", "In Progress", "Resolved"],
        default: "Open"
    },
    assignedAgent: {
        type: String,
        default: "Unassigned"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    // SLA Tracking
    slaDueAt: {
        type: Date
    },
    slaStatus: {
        type: String,
        enum: ["On Track", "Breached", "Met"],
        default: "On Track"
    },
    resolvedAt: {
        type: Date
    },

    // Customer Satisfaction
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    feedback: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ""
    },
    feedbackSubmittedAt: {
        type: Date,
        default: null
    }
});

// Automatically calculate SLA deadline
ticketSchema.pre("validate", function () {
    if (this.isNew || this.isModified("priority") || !this.slaDueAt) {
        const slaHours = {
            High: 4,
            Medium: 24,
            Low: 48
        };

        const hours = slaHours[this.priority] || 24;
        const created = this.createdAt || new Date();

        this.slaDueAt = new Date(
            created.getTime() + hours * 60 * 60 * 1000
        );
    }
});

module.exports = mongoose.model("Ticket", ticketSchema);
