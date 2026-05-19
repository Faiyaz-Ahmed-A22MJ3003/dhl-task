import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';

type GeneratedArticle = {
    title: string;
    summary: string;
    content: string;
    sourceText: string;
    tagNames: string[];
};

@Injectable()
export class AiService {
    private readonly ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    private readonly model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

    async generateFromText(sourceText: string, sourceType = 'TEXT'): Promise<GeneratedArticle> {
        if (!sourceText || !sourceText.trim()) {
            throw new BadRequestException('sourceText is required');
        }

        const prompt = this.buildPrompt(sourceText, sourceType);

        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            },
        });

        return this.parseGeminiJson(response.text || '', sourceText);
    }

    async generateFromFile(file: Express.Multer.File): Promise<GeneratedArticle> {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const ext = path.extname(file.originalname).toLowerCase();
        const mimeType = file.mimetype || this.guessMimeType(ext);

        if (ext === '.txt') {
            const sourceText = fs.readFileSync(file.path, 'utf8');
            return this.generateFromText(sourceText, 'TEXT');
        }

        if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: file.path });
            return this.generateFromText(result.value, 'DOCX');
        }

        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            const prompt = this.buildImagePrompt();

            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType,
                            data: fs.readFileSync(file.path).toString('base64'),
                        },
                    },
                ],
                config: {
                    responseMimeType: 'application/json',
                },
            });

            return this.parseGeminiJson(response.text || '', '');
        }

        if (ext === '.pdf') {
            const prompt = this.buildFilePrompt('PDF');

            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: 'application/pdf',
                            data: fs.readFileSync(file.path).toString('base64'),
                        },
                    },
                ],
                config: {
                    responseMimeType: 'application/json',
                },
            });

            return this.parseGeminiJson(response.text || '', '');
        }

        throw new BadRequestException('Unsupported file type for AI generation');
    }

    private buildPrompt(sourceText: string, sourceType: string) {
        return `
You are an AI assistant for DHL logistics operations.

Convert the following messy ${sourceType} source content into a clean knowledge-base SOP article.

Return ONLY valid JSON. Do not use markdown. Do not wrap it in triple backticks.

Required JSON shape:
{
  "title": "clear article title",
  "summary": "short 1-2 sentence summary",
  "content": "structured SOP content with numbered steps",
  "sourceText": "cleaned raw source text",
  "tagNames": ["tag1", "tag2", "tag3"]
}

Rules:
- The title must be specific to the logistics issue.
- The summary must be short and useful.
- The content must be clear SOP-style numbered steps.
- Tags must be relevant DHL/logistics/customer-support tags.
- If the source is messy, infer the clean workflow.
- Do not invent unrelated company policies.

Source content:
${sourceText}
`;
    }

    private buildImagePrompt() {
        return `
You are an AI assistant for DHL logistics operations.

Read the text/content visible in this image and convert it into a clean knowledge-base SOP article.

Return ONLY valid JSON. Do not use markdown. Do not wrap it in triple backticks.

Required JSON shape:
{
  "title": "clear article title",
  "summary": "short 1-2 sentence summary",
  "content": "structured SOP content with numbered steps",
  "sourceText": "text extracted or inferred from the image",
  "tagNames": ["tag1", "tag2", "tag3"]
}

Rules:
- Extract useful text from the image.
- If the image is a screenshot of messy notes, clean it into SOP steps.
- Tags must be relevant DHL/logistics/customer-support tags.
`;
    }

    private buildFilePrompt(sourceType: string) {
        return `
You are an AI assistant for DHL logistics operations.

Read this ${sourceType} file and convert it into a clean knowledge-base SOP article.

Return ONLY valid JSON. Do not use markdown. Do not wrap it in triple backticks.

Required JSON shape:
{
  "title": "clear article title",
  "summary": "short 1-2 sentence summary",
  "content": "structured SOP content with numbered steps",
  "sourceText": "main raw source text extracted from the file",
  "tagNames": ["tag1", "tag2", "tag3"]
}
`;
    }

    private parseGeminiJson(text: string, fallbackSourceText: string): GeneratedArticle {
        const cleaned = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        let parsed: Partial<GeneratedArticle>;

        try {
            parsed = JSON.parse(cleaned);
        } catch {
            throw new BadRequestException('Gemini did not return valid JSON');
        }

        return {
            title: parsed.title || 'Imported DHL SOP Article',
            summary: parsed.summary || 'AI-generated DHL SOP summary.',
            content: parsed.content || fallbackSourceText,
            sourceText: parsed.sourceText || fallbackSourceText,
            tagNames: Array.isArray(parsed.tagNames) ? parsed.tagNames : ['DHL', 'RPA', 'SOP'],
        };
    }

    private guessMimeType(ext: string) {
        switch (ext) {
            case '.txt':
                return 'text/plain';
            case '.docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case '.png':
                return 'image/png';
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.pdf':
                return 'application/pdf';
            default:
                return 'application/octet-stream';
        }
    }
}