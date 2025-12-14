import { GoogleGenAI } from '@google/genai';
import { allDefinitions as calendarDefinitions } from './tools/calendar.js';
import { allDefinitions as emailDefinitions } from './tools/email.js';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Carrega o .env da raiz do projeto (2 níveis acima de src/)
dotenv.config({ path: join(__dirname, '..', '.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

const allDefinitions = calendarDefinitions.concat(emailDefinitions);
const allDeclarations = allDefinitions.map(definition => definition.declaration);
const allFunctions = Object.fromEntries(allDefinitions.map(definition => [definition.declaration.name, definition.function]));

const contents = [
    {
        role: "user",
        parts: [{
            text: "Que dia é hoje?"
        }]
    }
];

var response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
        tools: [
            {
                functionDeclarations: allDeclarations
            }
        ]
    }
});

const functionCall = response.candidates[0].content.parts[0].functionCall;
const functionToExecute = functionCall.name;
const functionParameters = functionCall.args;

const fn = allFunctions[functionToExecute];

const result = fn(functionParameters);

const functionResponse = {
    role: "user",
    parts: [{
        functionResponse: {
            name: functionToExecute,
            response: { result: result }
        }
    }]
}

contents.push(functionResponse);

response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents
});

console.log(response.candidates[0].content.parts[0]);