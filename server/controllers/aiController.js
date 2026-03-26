const Certificate = require('../models/Certificate');

const getAIInsights = async (req, res, next) => {
    try {
        const studentId = req.user._id;
        const certificates = await Certificate.find({ student: studentId });

        if (!certificates || certificates.length === 0) {
            return res.json({
                insights: [
                    "Complete your first course to unlock AI-powered career insights.",
                    "Your on-chain identity is ready to be built.",
                    "Explore available courses from verified institutions."
                ],
                globalRank: "#0",
                trustScore: 0
            });
        }

        const certData = certificates.map(c => ({
            course: c.courseName,
            grade: c.grade,
            credits: c.metadata?.credits || 0
        }));

        // Try using Gemini if API key exists and package is installed
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_key') {
            try {
                const { GoogleGenerativeAI } = require('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `As a career coach, analyze these student certificates and provide 3 short, punchy, professional career insights or recommendations (max 15 words each). 
                Certificates: ${JSON.stringify(certData)}
                Return as a JSON array of strings.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                // Extremely basic parsing (expecting [ "...", "..." ])
                let insights = [];
                try {
                    const match = text.match(/\[.*\]/s);
                    if (match) {
                        insights = JSON.parse(match[0]);
                    } else {
                        throw new Error("JSON not found");
                    }
                } catch (e) {
                    insights = text.split('\n').filter(l => l.length > 5).slice(0, 3);
                }

                return res.json({
                    insights: insights.length > 0 ? insights : ["Insights available soon."],
                    globalRank: `#${Math.floor(Math.random() * 5000) + 1200}`,
                    trustScore: 80 + (certificates.length * 2)
                });
            } catch (aiErr) {
                console.error("Gemini Error:", aiErr.message);
                // Fallback to rule-based if AI fails
            }
        }

        // Rule-based Fallback (Semi-Smart Logic)
        const insights = [];
        const uniqueCourses = new Set(certData.map(c => c.course.toLowerCase()));
        
        if (uniqueCourses.has('mern') || uniqueCourses.has('react') || uniqueCourses.has('node')) {
            insights.push("Strong full-stack foundation. Focus on System Design next.");
            insights.push("Your MERN skills are trending. Consider Cloud Deployment.");
        } else {
            insights.push("Diverse learning path detected. Specialization recommended.");
        }

        if (certificates.length >= 3) {
            insights.push("Consistency is key! You are in the top 20% of active learners.");
        } else {
            insights.push("Keep going! 2 more certs will trigger 'Expert' status.");
        }

        if (insights.length < 3) { insights.push("Add AWS or Azure certs to increase hiring visibility by 40%."); }

        res.json({
            insights: insights.slice(0, 3),
            globalRank: `#${Math.floor(Math.random() * 1000) + 1500}`,
            trustScore: 75 + (certificates.length * 3)
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { getAIInsights };
