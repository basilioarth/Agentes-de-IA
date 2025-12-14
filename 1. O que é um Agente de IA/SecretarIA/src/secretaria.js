import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

const contents = [
    {
        role: "user",
        parts: [{
            text: "Qual a temperatura no Brasil?"
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
                        description: "Retorna a data de hoje no formato dd/mm/yyyy"
                    },
                    {
                        name: "getCountryTemperature",
                        description: "Retorna a temperatura do país indicado",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                country: {
                                    type: "STRING",
                                    description: "País do qual se quer saber a temperatura"
                                },
                                isCelsius: {
                                    type: "BOOLEAN",
                                    description: "Se devemos retornar a temperatura em Celsius ou não (padrão é true)"
                                }
                            },
                            required: ["country", "isCelsius"]
                        }
                    }
                ]
            }
        ]
    }
});

// contents.push(response.candidates[0].content);

// contents.push({
//     role: "user",
//     parts: [{
//         functionResponse: {
//             name: "getTodayDate",
//             response: { response: new Date().toLocaleDateString('pt-BR') }
//         }
//     }]
// });

// response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: contents,
// });

console.log(response.candidates[0].content.parts[0].functionCall);