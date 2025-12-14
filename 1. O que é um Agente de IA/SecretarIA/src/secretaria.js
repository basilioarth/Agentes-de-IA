import { GoogleGenAI } from '@google/genai';
import { allFunctions as calendarFunctions } from './tools/calendar.js';
import { allFunctions as emailFunctions } from './tools/email.js';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Carrega o .env da raiz do projeto (2 níveis acima de src/)
dotenv.config({ path: join(__dirname, '..', '.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

const contents = [
    {
        role: "user",
        parts: [{
            text: "Mande uma mensagem bonita de aniversário para a minha mãe. O contato dela é 'Sandra'"
        }]
    }
];

const allFunctions = calendarFunctions.concat(emailFunctions);

var response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
        tools: [
            {
                functionDeclarations: allFunctions
            }
        ]
    }
});

console.log(response.candidates[0].content.parts[0]);