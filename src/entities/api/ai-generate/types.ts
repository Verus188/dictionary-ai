export type AIGenerateRequest = {
    prompt: string;
    temperature?: number;
};

export type AIGenerateResponse = {
    provider: 'gemini' | 'openrouter';
    model: string;
    text: string;
};
