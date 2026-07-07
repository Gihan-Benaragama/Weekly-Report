import { GoogleGenAI } from '@google/genai';
import Report from '../models/Report.js';

export const askAssistant = async (req, res) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const reports = await Report.find({ weekStart: { $gte: thirtyDaysAgo } })
            .populate('user', 'name')
            .populate('project', 'name')
            .sort({ weekStart: -1 })
            .limit(100);

        const context = reports
            .map((r) => {
                return `- ${r.user?.name} | ${r.project?.name} | Week of ${new Date(r.weekStart).toLocaleDateString()} | Status: ${r.status}
  Completed: ${r.tasksCompleted}
  Planned: ${r.tasksPlanned}
  Blockers: ${r.blockers || 'None'}`;
            })
            .join('\n\n');

        const systemPrompt = `You are a helpful assistant embedded in a team's Weekly Report Dashboard.
You will be given a list of recent weekly reports (member name, project, status, tasks completed, tasks planned, blockers).

Rules:
- Only answer questions related to the team's reports, projects, workload, blockers, or progress.
- Use ONLY the report data provided below — do not use outside knowledge or make assumptions.
- If asked something unrelated to team reports (general knowledge, personal opinions, unrelated topics), politely decline and explain you can only help with questions about the team's weekly reports.
- Be concise and specific. If asked about blockers or workload imbalances, look for patterns across multiple reports.
- If the data doesn't contain the answer, say so honestly rather than guessing.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Recent team reports:\n\n${context || 'No reports available.'}\n\nManager's question: ${question}`,
            config: {
                systemInstruction: systemPrompt,
            },
        });

        const answer = response.text;

        res.status(200).json({ answer });
    } catch (error) {
        console.error('AI Assistant Error:', error);
        let friendlyMessage = 'AI assistant error';
        const errMsg = error.message || '';
        
        if (
            errMsg.includes('API key not valid') || 
            errMsg.includes('API_KEY_INVALID') || 
            error.status === 400
        ) {
            friendlyMessage = 'Invalid Gemini API Key. Please get a valid key from Google AI Studio (https://aistudio.google.com/) and update the GEMINI_API_KEY variable in your backend/.env file.';
        } else {
            friendlyMessage = `AI Assistant Error: ${errMsg}`;
        }
        
        res.status(500).json({ message: friendlyMessage, error: errMsg });
    }
};