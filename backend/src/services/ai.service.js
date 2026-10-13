
const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// JSON Schema for the interview report
const interviewReportSchema = {
    type: "OBJECT",
    properties: {
        matchScore: {
            type: "NUMBER",
            description:
                "A score between 0 and 100 indicating how well the candidate's profile matches the job description.",
        },
        technicalQuestions: {
            type: "ARRAY",
            description:
                "Technical interview questions, their intentions, and suggested answers.",
            items: {
                type: "OBJECT",
                properties: {
                    question: {
                        type: "STRING",
                        description: "A technical question that can be asked in the interview.",
                    },
                    intention: {
                        type: "STRING",
                        description: "The interviewer's intention behind asking this question.",
                    },
                    answer: {
                        type: "STRING",
                        description: "Suggested answer and key points to cover.",
                    },
                },
                required: ["question", "intention", "answer"],
            },
        },
        behavioralQuestions: {
            type: "ARRAY",
            description:
                "Behavioral interview questions, their intentions, and suggested answers.",
            items: {
                type: "OBJECT",
                properties: {
                    question: {
                        type: "STRING",
                        description: "A behavioral question that can be asked in the interview.",
                    },
                    intention: {
                        type: "STRING",
                        description: "The interviewer's intention behind asking this question.",
                    },
                    answer: {
                        type: "STRING",
                        description: "Suggested answer and key points to cover.",
                    },
                },
                required: ["question", "intention", "answer"],
            },
        },
        skillGaps: {
            type: "ARRAY",
            description: "Skill gaps in the candidate's profile and their severity.",
            items: {
                type: "OBJECT",
                properties: {
                    skill: {
                        type: "STRING",
                        description: "A skill the candidate is lacking.",
                    },
                    severity: {
                        type: "STRING",
                        enum: ["low", "medium", "high"],
                        description: "The importance and severity of the skill gap.",
                    },
                },
                required: ["skill", "severity"],
            },
        },
        preparationPlan: {
            type: "ARRAY",
            description: "A day-wise preparation plan for the candidate.",
            items: {
                type: "OBJECT",
                properties: {
                    day: {
                        type: "NUMBER",
                        description: "The preparation day number, starting from 1.",
                    },
                    focus: {
                        type: "STRING",
                        description: "The main focus for the day.",
                    },
                    tasks: {
                        type: "ARRAY",
                        items: {
                            type: "STRING",
                        },
                        description: "Tasks to complete during the day.",
                    },
                },
                required: ["day", "focus", "tasks"],
            },
        },
        title: {
            type: "STRING",
            description: "The title of the job for which the report is generated.",
        },
    },
    required: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
        "title",
    ],
};

// Generate an interview report
async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    const prompt = `
Generate an interview report for a candidate using the following details.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Generate relevant technical questions, behavioral questions, skill gaps,
a match score between 0 and 100, and a practical day-wise preparation plan.
Return data matching the provided JSON schema.
`;

    const response = await ai.models.generateContent({
        // Replace this with a model currently available to your API key.
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema,
        },
    });

    return JSON.parse(response.text);
}

// Convert HTML into a PDF buffer
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();

    try {
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm",
            },
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

// JSON Schema for the generated resume HTML
const resumePdfSchema = {
    type: "OBJECT",
    properties: {
        html: {
            type: "STRING",
            description:
                "Professional, ATS-friendly HTML for a tailored resume.",
        },
    },
    required: ["html"],
};

// Generate a tailored resume PDF
async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription,
}) {
    const prompt = `
Generate a professional, ATS-friendly resume for the candidate.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Requirements:
- Tailor the resume to the job description.
- Highlight relevant skills, experience, and achievements.
- Use a simple, professional design.
- Keep the resume ideally within 1–2 pages.
- Return a JSON object with a single field named "html".
- The html field must contain complete HTML that can be converted into a PDF.
- Do not invent qualifications, work experience, or achievements.
`;

    const response = await ai.models.generateContent({
        // Use a model available to your API key.
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumePdfSchema,
        },
    });

    const jsonContent = JSON.parse(response.text);

    if (!jsonContent.html) {
        throw new Error("Gemini did not return the resume HTML.");
    }

    return generatePdfFromHtml(jsonContent.html);
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
};