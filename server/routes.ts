import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateEducationalVideo, cleanupOldVideos } from "./videoGenerator";
import * as path from "path";
import * as fs from "fs";
import express from "express";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const SUPPORT_SYSTEM_PROMPT = `You are an AI Support Assistant for SimpleLecture LMS platform.

Your role:
- Help users with technical, account, payment, and platform-related issues.
- You must NOT answer academic, course subject, exam, or assignment questions.

Rules:
1. If a query is academic or course-related, politely redirect to the Forum
2. Provide clear, step-by-step solutions for support issues
3. Ask the user if the issue is resolved at the end of your response
4. If you are unsure, say so and indicate you'll escalate the ticket

You can help with:
- Login issues (password reset, access problems)
- Payment status (failed, pending, invoice)
- Course access issues
- App usage help
- Certificates, progress tracking
- General LMS navigation
- Technical issues

Important:
- Be concise and helpful
- Use bullet points for clarity
- Always end with: "Did this help resolve your issue?"
`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const videosDir = path.join(process.cwd(), 'public', 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }
  app.use('/videos', express.static(videosDir));

  app.post('/api/generate-video', async (req, res) => {
    try {
      const { question, slides, audioBase64 } = req.body;

      if (!slides || !Array.isArray(slides) || slides.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Slides array is required',
        });
      }

      console.log(`Generating video for question: ${question}`);
      console.log(`Number of slides: ${slides.length}`);

      const result = await generateEducationalVideo({
        question,
        slides,
        audioBase64,
        outputFormat: 'mp4',
      });

      if (result.success) {
        res.json({
          success: true,
          videoUrl: result.videoUrl,
          duration: result.duration,
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Video generation route error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get('/api/video-status/:videoId', (req, res) => {
    const { videoId } = req.params;
    const videoPath = path.join(videosDir, `${videoId}.mp4`);
    
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      res.json({
        exists: true,
        size: stats.size,
        createdAt: stats.birthtime,
      });
    } else {
      res.json({ exists: false });
    }
  });

  app.post('/api/ai-support-chat', async (req, res) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const chatHistory = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }],
      }));

      const contentsWithSystem = [
        { role: 'user' as const, parts: [{ text: SUPPORT_SYSTEM_PROMPT }] },
        { role: 'model' as const, parts: [{ text: 'I understand. I am the AI Support Assistant for SimpleLecture LMS. I will help with technical, account, payment, and platform issues only, and will politely redirect academic questions to the Forum. How can I assist you today?' }] },
        ...chatHistory,
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsWithSystem,
      });

      const responseText = response.text || '';
      
      res.json({ 
        success: true, 
        content: responseText 
      });
    } catch (error) {
      console.error('AI Support Chat error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get AI response' 
      });
    }
  });

  app.post('/api/send-notification', async (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'];
      const serverKey = process.env.NOTIFICATION_API_KEY;
      if (serverKey && apiKey !== serverKey) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { pushToken, title, body, data } = req.body;

      if (!pushToken || !title || !body) {
        return res.status(400).json({
          success: false,
          error: 'pushToken, title, and body are required',
        });
      }

      const message = {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (result.data?.status === 'error') {
        return res.status(400).json({
          success: false,
          error: result.data.message || 'Failed to send notification',
        });
      }

      res.json({ success: true, ticket: result.data });
    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send notification',
      });
    }
  });

  setInterval(() => {
    cleanupOldVideos(24);
  }, 60 * 60 * 1000);

  return httpServer;
}
