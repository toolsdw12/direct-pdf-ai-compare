const AI_MODELS = {
  providers: [
    {
      id: 'gemini',
      name: 'Google Gemini',
      models: [
        {
          id: 'gemini-2.0-flash',
          name: 'Gemini 2.0 Flash',
          description: 'Fast and efficient (Default)',
          isDefault: true
        },
        {
          id: 'gemini-2.0-flash-lite',
          name: 'Gemini 2.0 Flash Lite',
          description: 'Lightweight version'
        },
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          description: 'Enhanced performance'
        },
        {
          id: 'gemini-2.5-flash-lite',
          name: 'Gemini 2.5 Flash Lite',
          description: 'Enhanced lightweight version'
        },
        {
          id: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          description: 'Most advanced model'
        }
      ]
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      models: [
        {
          id: 'claude',
          name: 'Claude 3.5 Sonnet',
          description: 'Advanced reasoning and analysis',
          isDefault: true
        }
      ]
    },
    {
      id: 'gpt-4',
      name: 'OpenAI GPT-4',
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4 Vision',
          description: 'Multimodal document understanding',
          isDefault: true
        }
      ]
    }
  ]
};

// Helper functions
const getDefaultModel = () => {
  for (const provider of AI_MODELS.providers) {
    const defaultModel = provider.models.find(model => model.isDefault);
    if (defaultModel) {
      return defaultModel.id;
    }
  }
  return 'gemini-2.0-flash'; // Fallback default
};

const getAllModels = () => {
  const allModels = [];
  AI_MODELS.providers.forEach(provider => {
    provider.models.forEach(model => {
      allModels.push({
        ...model,
        provider: provider.name,
        providerId: provider.id
      });
    });
  });
  return allModels;
};

const getModelsByProvider = (providerId) => {
  const provider = AI_MODELS.providers.find(p => p.id === providerId);
  return provider ? provider.models : [];
};

const getModelInfo = (modelId) => {
  for (const provider of AI_MODELS.providers) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) {
      return {
        ...model,
        provider: provider.name,
        providerId: provider.id
      };
    }
  }
  return null;
};

module.exports = {
  AI_MODELS,
  getDefaultModel,
  getAllModels,
  getModelsByProvider,
  getModelInfo
};