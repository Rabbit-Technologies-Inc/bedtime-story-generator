import axios from 'axios'

// API Service for different AI providers
class AIService {
  constructor() {
    this.baseURLs = {
      openai: 'https://api.openai.com/v1',
      claude: 'https://api.anthropic.com/v1',
      grok: 'https://api.x.ai/v1',
      gemini: 'https://generativelanguage.googleapis.com/v1beta'
    }
  }

  // Enhanced error handling
  handleError(error) {
    let errorMessage = error.message
    
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Network error - this might be due to CORS restrictions when testing locally. In production, you would need to proxy API calls through your backend.'
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid API key. Please check your API key and try again.'
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please wait a moment and try again.'
    } else if (error.response?.status === 403) {
      errorMessage = 'Access forbidden. Please check your API key permissions.'
    } else if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    return errorMessage
  }

  // OpenAI API Integration
  async callOpenAI(apiKey, model, messages, systemPrompt) {
    try {
      const response = await axios.post(
        `${this.baseURLs.openai}/chat/completions`,
        {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 5000,
          temperature: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return {
        success: true,
        content: response.data.choices[0].message.content,
        usage: response.data.usage
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // Claude (Anthropic) API Integration
  async callClaude(apiKey, model, messages, systemPrompt) {
    try {
      // Convert messages format for Claude
      const claudeMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))

      const response = await axios.post(
        `${this.baseURLs.claude}/messages`,
        {
          model: model,
          max_tokens: 5000,
          system: systemPrompt,
          messages: claudeMessages
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        }
      )
      return {
        success: true,
        content: response.data.content[0].text,
        usage: response.data.usage
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // Grok (X.AI) API Integration
  async callGrok(apiKey, model, messages, systemPrompt) {
    try {
      const response = await axios.post(
        `${this.baseURLs.grok}/chat/completions`,
        {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 5000,
          temperature: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return {
        success: true,
        content: response.data.choices[0].message.content,
        usage: response.data.usage
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // Gemini (Google) API Integration
  async callGemini(apiKey, model, messages, systemPrompt) {
    try {
      // Convert messages for Gemini format
      const geminiMessages = messages.map(msg => ({
        parts: [{ text: msg.content }],
        role: msg.role === 'assistant' ? 'model' : 'user'
      }))

      // Add system prompt as first user message for Gemini
      const allMessages = [
        { parts: [{ text: systemPrompt }], role: 'user' },
        { parts: [{ text: 'Understood. I will follow these instructions.' }], role: 'model' },
        ...geminiMessages
      ]

      const response = await axios.post(
        `${this.baseURLs.gemini}/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: allMessages,
          generationConfig: {
            maxOutputTokens: 5000,
            temperature: 0.9
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      return {
        success: true,
        content: response.data.candidates[0].content.parts[0].text,
        usage: response.data.usageMetadata
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // Main method to call any AI provider
  async generateResponse(provider, apiKey, model, messages, systemPrompt) {
    switch (provider) {
      case 'openai':
        return await this.callOpenAI(apiKey, model, messages, systemPrompt)
      case 'claude':
        return await this.callClaude(apiKey, model, messages, systemPrompt)
      case 'grok':
        return await this.callGrok(apiKey, model, messages, systemPrompt)
      case 'gemini':
        return await this.callGemini(apiKey, model, messages, systemPrompt)
      default:
        return {
          success: false,
          error: `Unsupported provider: ${provider}`
        }
    }
  }

  // Test API connection
  async testConnection(provider, apiKey, model) {
    const testMessages = [
      { role: 'user', content: 'Hello! Please respond with "Connection successful" to test the API.' }
    ]
    const systemPrompt = 'You are a helpful assistant. Respond exactly as requested.'
    
    return await this.generateResponse(provider, apiKey, model, testMessages, systemPrompt)
  }

  // Replace placeholders in prompt with actual values
  replacePlaceholders(prompt, storyConfig) {
    return prompt
      .replace(/{childName}/g, storyConfig.childName || 'the child')
      .replace(/{morals}/g, storyConfig.selectedMorals.join(', ') || 'good values')
      .replace(/{interests}/g, storyConfig.selectedInterests.join(', ') || 'various topics')
      .replace(/{ageGroup}/g, storyConfig.ageGroup || '3-5')
  }

  // Execute the full prompt chain
  async executePromptChain(provider, apiKey, model, promptChain, storyConfig) {
    const results = []
    let conversationHistory = []

    try {
      // Build enhanced system prompt with examples
      let enhancedSystemPrompt = promptChain.systemPrompt

      // Add include examples
      if (promptChain.includeExamples && promptChain.includeExamples.length > 0) {
        enhancedSystemPrompt += '\n\nSTORY STYLES TO INCLUDE (use these as inspiration):\n'
        promptChain.includeExamples.forEach((example, index) => {
          enhancedSystemPrompt += `${index + 1}. ${example.description}: ${example.story}\n`
        })
      }

      // Add exclude examples
      if (promptChain.excludeExamples && promptChain.excludeExamples.length > 0) {
        enhancedSystemPrompt += '\n\nSTORY ELEMENTS TO AVOID (do not include these types of content):\n'
        promptChain.excludeExamples.forEach((example, index) => {
          enhancedSystemPrompt += `${index + 1}. Avoid: ${example.description} - Example: ${example.story}\n`
        })
      }

      enhancedSystemPrompt += '\n\nRemember to create stories that are creative, engaging, and appropriate for the specified age group while incorporating the positive elements and avoiding the negative ones.'

      for (const step of promptChain.steps.sort((a, b) => a.order - b.order)) {
        // Replace placeholders in the prompt
        const processedPrompt = this.replacePlaceholders(step.prompt, storyConfig)
        
        // Add current step to conversation
        conversationHistory.push({
          role: 'user',
          content: processedPrompt
        })

        // Generate response
        const response = await this.generateResponse(
          provider,
          apiKey,
          model,
          conversationHistory,
          enhancedSystemPrompt
        )

        if (!response.success) {
          throw new Error(`Step ${step.order} failed: ${response.error}`)
        }

        // Add AI response to conversation history
        conversationHistory.push({
          role: 'assistant',
          content: response.content
        })

        // Store step result
        results.push({
          step: step.order,
          title: step.title,
          prompt: processedPrompt,
          response: response.content,
          usage: response.usage
        })
      }

      return {
        success: true,
        results: results,
        finalStory: results[results.length - 1]?.response || ''
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        partialResults: results
      }
    }
  }
}

export default new AIService()
