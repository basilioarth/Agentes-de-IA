import { GoogleGenAI } from '@google/genai';
import { allDefinitions as calendarDefinitions } from './tools/calendar.js';
import { allDefinitions as emailDefinitions } from './tools/email.js';

import readline from "readline";

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Carrega o .env da raiz do projeto (2 níveis acima de src/)
dotenv.config({ path: join(__dirname, '..', '.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

const allDefinitions = calendarDefinitions.concat(emailDefinitions);
const allDeclarations = allDefinitions.map(definition => definition.declaration);
const allFunctions = Object.fromEntries(allDefinitions.map(definition => [definition.declaration.name, definition.function]));

const contents = [];

while (true) {
    const query = await new Promise(resolve => {
        rl.question("Você: ", resolve)
    });

    contents.push({
        role: "user",
        parts: [{ text: query }]
    });

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
        for (const func of response.functionCalls) {
            const functionToExecute = func.name;
            const functionParameters = func.args;

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
        }

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

    console.log("SecretarIA: ", response.candidates[0].content.parts[0].text);
}