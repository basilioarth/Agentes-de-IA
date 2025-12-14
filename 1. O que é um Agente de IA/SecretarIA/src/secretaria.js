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
            text: "Quais eventos eu tenho na minha agenda hoje?"
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

while (response.functionCalls) {
    const functionCall = response.candidates[0].content.parts[0].functionCall;
    const functionToExecute = functionCall.name;
    const functionParameters = functionCall.args;

    console.log(`**Chamando função ${functionToExecute} com os argumentos ${functionParameters}**`);

    const fn = allFunctions[functionToExecute];

    const result = fn(functionParameters);

    console.log(`**Resultado da função ${functionToExecute}: \n${result}**`);
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
        contents: contents,
        config: {
            tools: [
                {
                    functionDeclarations: allDeclarations
                }
            ]
        }
    });
}

console.log(response.candidates[0].content.parts[0]);