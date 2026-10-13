
const pdfParse = require("pdf-parse");

const {
    generateInterviewReport,
    generateResumePdf
} = require("../services/ai.service");

const interviewReportModel = require("../models/interviewReport.model");

/**
 * Generate interview report.
 */
async function generateInterViewReportController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload your resume PDF."
            });
        }

        const resumeContent = await (
            new pdfParse.PDFParse(
                Uint8Array.from(req.file.buffer)
            )
        ).getText();

        const { selfDescription, jobDescription } = req.body;

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resumeText: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Generate interview report error:", error);

        return res.status(500).json({
            message: "Failed to generate interview report."
        });
    }
}

/**
 * Get interview report by ID.
 */
async function getInterViewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Get interview report error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview report."
        });
    }
}

/**
 * Get all interview reports for the logged-in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select(
                "-resumeText -selfDescription -jobDescription -__v"
            );

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error("Get all interview reports error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview reports."
        });
    }
}

/**
 * Generate downloadable resume PDF.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const {
            resumeText,
            jobDescription,
            selfDescription
        } = interviewReport;

        // This function must be implemented and exported by ai.service.js.
        const pdfBuffer = await generateResumePdf({
            resumeText,
            jobDescription,
            selfDescription
        });

        return res
            .status(200)
            .set({
                "Content-Type": "application/pdf",
                "Content-Disposition":
                    `attachment; filename=resume_${interviewReportId}.pdf`
            })
            .send(pdfBuffer);

    } catch (error) {
    console.error("Generate resume PDF error:", error);

    return res.status(500).json({
        message: "Failed to generate resume PDF.",
        error: error.message
    });
}
}

module.exports = {
    generateInterViewReportController,
    getInterViewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};
