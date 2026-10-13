const mongoose = require("mongoose")

/*
    Technical Question
*/
const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Question is required"]
    },

    intention: {
        type: String,
        required: [true, "Intention is required"]
    },

    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
})


/*
    Behavioral Question
*/
const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Question is required"]
    },

    intention: {
        type: String,
        required: [true, "Intention is required"]
    },

    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
})


/*
    Skill Gap
*/
const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"]
    },

    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "Severity is required"]
    }
}, {
    _id: false
})


/*
    Preparation Plan
*/
const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },

    focus: {
        type: String,
        required: [true, "Focus is required"]
    },

    tasks: [{
        type: String,
        required: [true, "Task is required"]
    }]
})


/*
    Interview Report
*/
const interviewReportSchema = new mongoose.Schema({

    jobDescription: {
        type: String,
        required: [true, "Job description is required"]
    },

    resumeText: {
        type: String,
        required: [true, "Resume text is required"]
    },

    selfDescription: {
        type: String,
        required: [true, "Self description is required"]
    },

    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        required: [true, "Match score is required"]
    },

    technicalQuestions: {
        type: [technicalQuestionSchema],
        default: []
    },

    behavioralQuestions: {
        type: [behavioralQuestionSchema],
        default: []
    },

    skillGaps: {
        type: [skillGapSchema],
        default: []
    },

    preparationPlan: {
        type: [preparationPlanSchema],
        default: []
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    title: {
        type: String,
        required: [true, "Title is required"]
    }

}, {
    timestamps: true
})


const interviewReportModel = mongoose.model(
    "InterviewReport",
    interviewReportSchema
)

module.exports = interviewReportModel