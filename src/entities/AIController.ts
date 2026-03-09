import { Ctx } from '@reatom/core';
import { generateAIText } from './api/ai-generate/ai-generate';

interface AIInterface {
    generateAIText: (prompt: string, ctx: Ctx) => Promise<string>;
}

class BackendAIController implements AIInterface {
    async generateAIText(prompt: string, ctx: Ctx) {
        void ctx;
        try {
            const response = await generateAIText({ prompt });
            return response.text;
        } catch (error) {
            console.error('Error fetching API info:', error);
            return '';
        }
    }
}

export let AIController: AIInterface = new BackendAIController();

export const setAIController = (_model: string | null) => {
    AIController = new BackendAIController();
    return AIController;
};
