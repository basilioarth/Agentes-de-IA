import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

const contents = [
    {
        role: "user",
        parts: [{
            text: "que dia é hoje?"
        }]
    }
];

var response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
        tools: [
            {
                functionDeclarations: [
                    {
                        name: "getTodayDate",
                        description: "Retorna a data de hoje no formato yyyy-mm-dd"
                    }
                ]
            }
        ]
    }
});

contents.push(response.candidates[0].content);

contents.push({
    role: "user",
    parts: [{
        functionResponse: {
            name: "getTodayDate",
            response: { response: "2075-05-01" }
        }
    }]
});

response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
});

console.log(response.candidates[0].content);