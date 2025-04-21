const AnthropicAiService = require('./anthropicAiService');
const OpenAiService = require('./openAiService');
const MistralAiService = require('./mistralAiService');

class AiServiceFactory {
    static getAiService() {
        const selectedModel = process.env.AI_MODEL?.toLowerCase() || 'anthropic';

        switch (selectedModel) {
            case 'anthropic':
                console.log('Using Anthropic AI model');
                return AnthropicAiService;
            case 'openai':
                console.log('Using OpenAI model');
                return OpenAiService;
            default:
                console.log(`Unknown AI model: ${selectedModel}. Defaulting to Anthropic.`);
                return AnthropicAiService;
        }
    }
}

module.exports = AiServiceFactory; 