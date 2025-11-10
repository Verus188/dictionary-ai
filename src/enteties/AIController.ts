import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { reatomCtx, storySettingsAtoms } from '../model/atoms';

interface AIInterface {
    generateAIText: (prompt: string) => Promise<string>;
}

const ctx = reatomCtx;

class OpenRouterAIController implements AIInterface {
    async generateAIText(prompt: string) {
        const AIModel = ctx.get(storySettingsAtoms.AIModelAtom);
        const apiKey = ctx.get(storySettingsAtoms.openRouterTokenAtom);

        if (!apiKey || !AIModel) {
            return '';
        }

        return axios({
            url: 'https://openrouter.ai/api/v1/chat/completions',
            method: 'post',
            headers: {
                Authorization: 'Bearer ' + apiKey,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                model: AIModel,
                messages: [{ role: 'system', content: prompt }],
            }),
        })
            .then((response) => {
                const text = response.data.choices[0].message.content;

                return text;
            })
            .catch((error) => {
                console.error('Error fetching API info:', error);
                return '';
            });
    }
}

class GemeniAIController implements AIInterface {
    private ai = new GoogleGenAI({
        apiKey: 'AIzaSyCzl8i9dRBBXPYh5S1DqWSMFAV51ZqVxsM',
    });

    async generateAIText(prompt: string) {
        //параметры запроса, если нет json файла
        const defaulParameters = {
            model: 'gemini-2.5-flash',
            contents: prompt,
        };

        return this.ai.models
            .generateContent(defaulParameters)
            .then((response) => {
                return response.text || '';
            })
            .catch((error) => {
                console.error(error);
                return '';
            });
    }
}

export let AIController: AIInterface = new GemeniAIController();

export const setAIController = (model: string | null) => {
    AIController = model === 'gemeni' ? new GemeniAIController() : new OpenRouterAIController();

    return AIController;
};
