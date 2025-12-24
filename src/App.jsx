import { useState } from 'react'
import { Settings, BookOpen, Wand2, Play, Key, Check, AlertCircle, Eye, EyeOff, Plus, Trash2, ArrowDown, ArrowUp, Loader2, Download, RefreshCw } from 'lucide-react'
import aiService from './services/aiService'

function App() {
  const [activeTab, setActiveTab] = useState('config')
  
  // API Configuration State
  const [apiConfig, setApiConfig] = useState({
    selectedProvider: 'openai',
    selectedModel: 'gpt-4',
    temperature: 0.7,
    apiKeys: {
      openai: '',
      claude: '',
      grok: '',
      gemini: ''
    },
    showApiKeys: {
      openai: false,
      claude: false,
      grok: false,
      gemini: false
    }
  })

  // Available AI providers and their models
  const aiProviders = {
    openai: {
      name: 'OpenAI',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o (Latest)' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K' },
        { id: 'gpt-4-1106-preview', name: 'GPT-4 Turbo Preview' },
        { id: 'gpt-4-0125-preview', name: 'GPT-4 Turbo (Jan 2024)' }
      ],
      keyLabel: 'OpenAI API Key'
    },
    claude: {
      name: 'Claude (Anthropic)',
      models: [
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Latest)' },
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Oct 2024)' },
        { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet (Jun 2024)' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
        { id: 'claude-2.1', name: 'Claude 2.1' },
        { id: 'claude-2.0', name: 'Claude 2.0' }
      ],
      keyLabel: 'Anthropic API Key'
    },
    grok: {
      name: 'Grok (X.AI)',
      models: [
        { id: 'grok-beta', name: 'Grok Beta (Latest)' },
        { id: 'grok-1', name: 'Grok-1' },
        { id: 'grok-1.5', name: 'Grok-1.5' },
        { id: 'grok-1.5-vision', name: 'Grok-1.5 Vision' },
        { id: 'grok-2-beta', name: 'Grok-2 Beta' },
        { id: 'grok-2-mini', name: 'Grok-2 Mini' },
        { id: 'grok-vision-beta', name: 'Grok Vision Beta' }
      ],
      keyLabel: 'X.AI API Key'
    },
    gemini: {
      name: 'Gemini (Google)',
      models: [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Latest)' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
        { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
        { id: 'gemini-pro', name: 'Gemini Pro' },
        { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' },
        { id: 'gemini-1.5-pro-exp', name: 'Gemini 1.5 Pro Experimental' },
        { id: 'gemini-ultra', name: 'Gemini Ultra' },
        { id: 'gemini-nano', name: 'Gemini Nano' }
      ],
      keyLabel: 'Google AI API Key'
    }
  }

  const handleProviderChange = (provider) => {
    setApiConfig(prev => ({
      ...prev,
      selectedProvider: provider,
      selectedModel: aiProviders[provider].models[0].id
    }))
  }

  const handleModelChange = (model) => {
    setApiConfig(prev => ({
      ...prev,
      selectedModel: model
    }))
  }

  const handleApiKeyChange = (provider, key) => {
    setApiConfig(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: key
      }
    }))
  }

  const toggleApiKeyVisibility = (provider) => {
    setApiConfig(prev => ({
      ...prev,
      showApiKeys: {
        ...prev.showApiKeys,
        [provider]: !prev.showApiKeys[provider]
      }
    }))
  }

  // Story Setup State
  const [storyConfig, setStoryConfig] = useState({
    childName: '',
    selectedMorals: [],
    selectedInterests: [],
    ageGroup: '3-5'
  })

  // Available morals and interests
  const morals = [
    'Honesty', 'Kindness', 'Bravery', 'Sharing', 'Friendship', 
    'Respect', 'Responsibility', 'Patience', 'Gratitude', 'Empathy',
    'Perseverance', 'Forgiveness', 'Helpfulness', 'Fairness', 'Love'
  ]

  const interests = [
    'Animals', 'Cars', 'Fantasy', 'Space', 'Pirates', 'Princesses',
    'Dinosaurs', 'Robots', 'Magic', 'Adventure', 'Ocean', 'Forest',
    'Dragons', 'Superheroes', 'Fairy Tales', 'Sports', 'Music', 'Art'
  ]

  const ageGroups = [
    { value: '0-1', label: '0-1 years' },
    { value: '1-2', label: '1-2 years' },
    { value: '2-3', label: '2-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-7', label: '5-7 years' },
    { value: '7-10', label: '7-10 years' }
  ]

  const handleMoralToggle = (moral) => {
    setStoryConfig(prev => ({
      ...prev,
      selectedMorals: prev.selectedMorals.includes(moral)
        ? prev.selectedMorals.filter(m => m !== moral)
        : [...prev.selectedMorals, moral]
    }))
  }

  const handleInterestToggle = (interest) => {
    setStoryConfig(prev => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(interest)
        ? prev.selectedInterests.filter(i => i !== interest)
        : [...prev.selectedInterests, interest]
    }))
  }

  // Prompt Chain State
  const [promptChain, setPromptChain] = useState({
    systemPrompt: 'You are a creative storyteller who writes engaging bedtime stories for children. Your stories should be age-appropriate, educational, and promote positive values.',
    includeExamples: [
      {
        id: 1,
        description: 'A brave little mouse who overcomes fears to help friends',
        story: 'Once upon a time, in a cozy little hole beneath the old oak tree, lived a tiny mouse named Pip who was afraid of the dark. One night, when his friend got lost in the forest, Pip had to be brave and venture into the scary darkness to help...'
      }
    ],
    excludeExamples: [
      {
        id: 1,
        description: 'Stories with scary monsters or frightening situations',
        story: 'Avoid stories with monsters chasing characters, dark scary forests with dangerous creatures, or situations that might cause nightmares...'
      }
    ],
    steps: [
      {
        id: 1,
        title: 'Story Outline',
        prompt: 'Create a brief outline for a bedtime story featuring {childName}. Include the main character, setting, problem, and resolution. The story should teach about {morals} and incorporate {interests}. Keep it appropriate for ages {ageGroup}.',
        order: 1
      },
      {
        id: 2,
        title: 'Full Story',
        prompt: 'Based on the outline from the previous step, write a complete bedtime story. Make it engaging, warm, and perfect for reading aloud. The story should be about 300-500 words long.',
        order: 2
      }
    ]
  })

  const addPromptStep = () => {
    const newStep = {
      id: Date.now(),
      title: `Step ${promptChain.steps.length + 1}`,
      prompt: '',
      order: promptChain.steps.length + 1
    }
    setPromptChain(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const removePromptStep = (id) => {
    setPromptChain(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== id).map((step, index) => ({
        ...step,
        order: index + 1
      }))
    }))
  }

  const updatePromptStep = (id, field, value) => {
    setPromptChain(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === id ? { ...step, [field]: value } : step
      )
    }))
  }

  const movePromptStep = (id, direction) => {
    const steps = [...promptChain.steps]
    const currentIndex = steps.findIndex(step => step.id === id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex >= 0 && newIndex < steps.length) {
      [steps[currentIndex], steps[newIndex]] = [steps[newIndex], steps[currentIndex]]
      steps.forEach((step, index) => {
        step.order = index + 1
      })
      setPromptChain(prev => ({ ...prev, steps }))
    }
  }

  const addIncludeExample = () => {
    const newExample = {
      id: Date.now(),
      description: '',
      story: ''
    }
    setPromptChain(prev => ({
      ...prev,
      includeExamples: [...prev.includeExamples, newExample]
    }))
  }

  const removeIncludeExample = (id) => {
    setPromptChain(prev => ({
      ...prev,
      includeExamples: prev.includeExamples.filter(example => example.id !== id)
    }))
  }

  const updateIncludeExample = (id, field, value) => {
    setPromptChain(prev => ({
      ...prev,
      includeExamples: prev.includeExamples.map(example => 
        example.id === id ? { ...example, [field]: value } : example
      )
    }))
  }

  const addExcludeExample = () => {
    const newExample = {
      id: Date.now(),
      description: '',
      story: ''
    }
    setPromptChain(prev => ({
      ...prev,
      excludeExamples: [...prev.excludeExamples, newExample]
    }))
  }

  const removeExcludeExample = (id) => {
    setPromptChain(prev => ({
      ...prev,
      excludeExamples: prev.excludeExamples.filter(example => example.id !== id)
    }))
  }

  const updateExcludeExample = (id, field, value) => {
    setPromptChain(prev => ({
      ...prev,
      excludeExamples: prev.excludeExamples.map(example => 
        example.id === id ? { ...example, [field]: value } : example
      )
    }))
  }

  // Story Generation State
  const [generationState, setGenerationState] = useState({
    isGenerating: false,
    isTesting: false,
    currentStep: 0,
    totalSteps: 0,
    results: [],
    finalStory: '',
    error: null,
    testResults: {}
  })

  // Test API Connection
  const testApiConnection = async (provider) => {
    const apiKey = apiConfig.apiKeys[provider]
    if (!apiKey) {
      alert(`Please enter API key for ${aiProviders[provider].name}`)
      return
    }

    setGenerationState(prev => ({ 
      ...prev, 
      isTesting: true,
      testResults: { ...prev.testResults, [provider]: { testing: true } }
    }))

    try {
      const model = aiProviders[provider].models[0].id
      const result = await aiService.testConnection(provider, apiKey, model, apiConfig.temperature)
      
      setGenerationState(prev => ({
        ...prev,
        isTesting: false,
        testResults: {
          ...prev.testResults,
          [provider]: {
            testing: false,
            success: result.success,
            message: result.success ? 'Connection successful!' : result.error
          }
        }
      }))
    } catch (error) {
      setGenerationState(prev => ({
        ...prev,
        isTesting: false,
        testResults: {
          ...prev.testResults,
          [provider]: {
            testing: false,
            success: false,
            message: error.message
          }
        }
      }))
    }
  }

  // Generate Story
  const generateStory = async () => {
    // Validation
    const currentApiKey = apiConfig.apiKeys[apiConfig.selectedProvider]
    if (!currentApiKey) {
      alert(`Please enter API key for ${aiProviders[apiConfig.selectedProvider].name}`)
      return
    }

    if (!storyConfig.childName.trim()) {
      alert('Please enter the child\'s name')
      return
    }

    if (storyConfig.selectedMorals.length === 0) {
      alert('Please select at least one moral value')
      return
    }

    if (storyConfig.selectedInterests.length === 0) {
      alert('Please select at least one interest')
      return
    }

    if (promptChain.steps.length === 0) {
      alert('Please add at least one prompt step')
      return
    }

    // Start generation
    setGenerationState(prev => ({
      ...prev,
      isGenerating: true,
      currentStep: 0,
      totalSteps: promptChain.steps.length,
      results: [],
      finalStory: '',
      error: null
    }))

    try {
      const result = await aiService.executePromptChain(
        apiConfig.selectedProvider,
        currentApiKey,
        apiConfig.selectedModel,
        promptChain,
        storyConfig,
        apiConfig.temperature
      )

      if (result.success) {
        setGenerationState(prev => ({
          ...prev,
          isGenerating: false,
          results: result.results,
          finalStory: result.finalStory,
          currentStep: result.results.length
        }))
        // Auto-switch to results tab
        setActiveTab('results')
      } else {
        setGenerationState(prev => ({
          ...prev,
          isGenerating: false,
          error: result.error,
          results: result.partialResults || []
        }))
      }
    } catch (error) {
      setGenerationState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message
      }))
    }
  }

  // Reset generation state
  const resetGeneration = () => {
    setGenerationState({
      isGenerating: false,
      isTesting: false,
      currentStep: 0,
      totalSteps: 0,
      results: [],
      finalStory: '',
      error: null,
      testResults: {}
    })
  }

  // Download story as text file
  const downloadStory = () => {
    if (!generationState.finalStory) return

    const storyContent = `Bedtime Story for ${storyConfig.childName}
Generated on ${new Date().toLocaleDateString()}

Story Details:
- Child: ${storyConfig.childName}
- Age Group: ${ageGroups.find(a => a.value === storyConfig.ageGroup)?.label}
- Morals: ${storyConfig.selectedMorals.join(', ')}
- Interests: ${storyConfig.selectedInterests.join(', ')}
- AI Model: ${aiProviders[apiConfig.selectedProvider].name} - ${aiProviders[apiConfig.selectedProvider].models.find(m => m.id === apiConfig.selectedModel)?.name}

Story:
${generationState.finalStory}
`

    const blob = new Blob([storyContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bedtime-story-${storyConfig.childName}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4 shadow-lg">
            <BookOpen className="text-white" size={32} />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Bedtime Story Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create magical, personalized stories for your little ones with the power of AI ✨
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-2 flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 min-w-[140px] justify-center ${
                activeTab === 'config'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <Settings size={20} />
              <span className="hidden sm:inline">Configuration</span>
            </button>
            <button
              onClick={() => setActiveTab('story')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 min-w-[140px] justify-center ${
                activeTab === 'story'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <Wand2 size={20} />
              <span className="hidden sm:inline">Story Setup</span>
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 min-w-[140px] justify-center ${
                activeTab === 'prompts'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <Play size={20} />
              <span className="hidden sm:inline">Prompt Chain</span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 min-w-[140px] justify-center relative ${
                activeTab === 'results'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <BookOpen size={20} />
              <span className="hidden sm:inline">Results</span>
              {generationState.finalStory && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-2 py-1 rounded-full shadow-md animate-pulse">
                  ✓
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'config' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                  <Settings className="text-white" size={24} />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  API Configuration
                </h2>
                <p className="text-gray-600">Choose your AI provider and configure your settings</p>
              </div>
              
              {/* Provider Selection */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Select AI Provider
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(aiProviders).map(([key, provider]) => (
                    <button
                      key={key}
                      onClick={() => handleProviderChange(key)}
                      className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 ${
                        apiConfig.selectedProvider === key
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                          : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className={`font-semibold text-lg mb-2 ${
                        apiConfig.selectedProvider === key ? 'text-purple-700' : 'text-gray-800 group-hover:text-purple-600'
                      }`}>
                        {provider.name}
                      </div>
                      <div className={`text-sm ${
                        apiConfig.selectedProvider === key ? 'text-purple-600' : 'text-gray-500'
                      }`}>
                        {provider.models.length} models available
                      </div>
                      {apiConfig.selectedProvider === key && (
                        <div className="mt-3 flex items-center gap-2 text-purple-600">
                          <Check size={16} />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selection */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Select {aiProviders[apiConfig.selectedProvider].name} Model
                </h3>
                <div className="relative">
                  <select
                    value={apiConfig.selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full md:w-auto px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm text-lg font-medium appearance-none cursor-pointer"
                  >
                    {aiProviders[apiConfig.selectedProvider].models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ArrowDown size={20} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Temperature Control */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Model Temperature
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {apiConfig.temperature}
                  </span>
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-blue-700">Conservative</span>
                      <span className="text-sm font-medium text-purple-700">Creative</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={apiConfig.temperature}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${apiConfig.temperature * 100}%, #e5e7eb ${apiConfig.temperature * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0.0</span>
                      <span>0.2</span>
                      <span>0.4</span>
                      <span>0.6</span>
                      <span>0.8</span>
                      <span>1.0</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      🎨 <strong>Temperature:</strong> {apiConfig.temperature} 
                      {apiConfig.temperature <= 0.3 && ' - More focused and consistent'}
                      {apiConfig.temperature > 0.3 && apiConfig.temperature <= 0.7 && ' - Balanced creativity and coherence'}
                      {apiConfig.temperature > 0.7 && ' - More creative and varied'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Lower values make the AI more predictable, higher values make it more creative and varied
                    </p>
                  </div>
                </div>
              </div>

              {/* API Keys Section */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  API Keys
                </h3>
                <div className="space-y-6">
                  {Object.entries(aiProviders).map(([key, provider]) => (
                    <div key={key} className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-purple-200 transition-all duration-300 bg-gradient-to-r from-gray-50 to-white">
                      <label className="block text-lg font-semibold text-gray-800 mb-3">
                        {provider.keyLabel}
                      </label>
                      <div className="relative">
                        <input
                          type={apiConfig.showApiKeys[key] ? 'text' : 'password'}
                          value={apiConfig.apiKeys[key]}
                          onChange={(e) => handleApiKeyChange(key, e.target.value)}
                          placeholder={`Enter your ${provider.name} API key`}
                          className="w-full px-6 py-4 pr-16 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility(key)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors p-1"
                        >
                          {apiConfig.showApiKeys[key] ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {apiConfig.apiKeys[key] ? (
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              API key provided
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-600 font-medium">
                              <AlertCircle size={18} />
                              API key required
                            </div>
                          )}
                          {generationState.testResults[key] && (
                            <div className={`font-medium ${generationState.testResults[key].success ? 'text-green-600' : 'text-red-600'}`}>
                              {generationState.testResults[key].success ? '✓ Connection verified' : '✗ Connection failed'}
                            </div>
                          )}
                        </div>
                        {apiConfig.apiKeys[key] && (
                          <button
                            onClick={() => testApiConnection(key)}
                            disabled={generationState.testResults[key]?.testing}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-md"
                          >
                            {generationState.testResults[key]?.testing ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <RefreshCw size={16} />
                            )}
                            Test Connection
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Selection Summary */}
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-2 border-purple-200 rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-3">
                    <Check className="text-white" size={20} />
                  </div>
                  <h4 className="text-2xl font-bold text-purple-800 mb-2">Current Configuration</h4>
                  <p className="text-purple-600">Your AI setup is ready to create amazing stories</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  <div className="bg-white/60 rounded-2xl p-4">
                    <div className="text-sm font-medium text-purple-600 mb-1">Provider</div>
                    <div className="text-lg font-bold text-purple-800">{aiProviders[apiConfig.selectedProvider].name}</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-4">
                    <div className="text-sm font-medium text-purple-600 mb-1">Model</div>
                    <div className="text-lg font-bold text-purple-800">{aiProviders[apiConfig.selectedProvider].models.find(m => m.id === apiConfig.selectedModel)?.name}</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-4">
                    <div className="text-sm font-medium text-purple-600 mb-1">Temperature</div>
                    <div className="text-lg font-bold text-purple-800">{apiConfig.temperature}</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-4">
                    <div className="text-sm font-medium text-purple-600 mb-1">API Key</div>
                    <div className={`text-lg font-bold ${apiConfig.apiKeys[apiConfig.selectedProvider] ? 'text-green-600' : 'text-red-500'}`}>
                      {apiConfig.apiKeys[apiConfig.selectedProvider] ? '✓ Configured' : '✗ Missing'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'story' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl mb-4">
                  <Wand2 className="text-white" size={24} />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Story Setup
                </h2>
                <p className="text-gray-600">Personalize your magical bedtime story</p>
              </div>

              {/* Child's Name */}
              <div className="mb-10">
                <label className="block text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Child's Name
                </label>
                <input
                  type="text"
                  value={storyConfig.childName}
                  onChange={(e) => setStoryConfig(prev => ({ ...prev, childName: e.target.value }))}
                  placeholder="Enter your little one's name..."
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300 text-xl bg-white shadow-sm"
                />
                <p className="text-gray-500 mt-3 text-lg">✨ This name will be the hero of your magical story</p>
              </div>

              {/* Age Group */}
              <div className="mb-10">
                <label className="block text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Age Group
                </label>
                <div className="relative">
                  <select
                    value={storyConfig.ageGroup}
                    onChange={(e) => setStoryConfig(prev => ({ ...prev, ageGroup: e.target.value }))}
                    className="w-full md:w-auto px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300 text-xl bg-white shadow-sm appearance-none cursor-pointer min-w-[200px]"
                  >
                    {ageGroups.map((age) => (
                      <option key={age.value} value={age.value}>
                        {age.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ArrowDown size={20} className="text-gray-400" />
                  </div>
                </div>
                <p className="text-gray-500 mt-3 text-lg">📚 This helps us choose the perfect vocabulary and complexity</p>
              </div>

              {/* Morals Selection */}
              <div className="mb-10">
                <label className="block text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Select Morals to Include 
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {storyConfig.selectedMorals.length} selected
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {morals.map((moral) => (
                    <button
                      key={moral}
                      onClick={() => handleMoralToggle(moral)}
                      className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        storyConfig.selectedMorals.includes(moral)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      {moral}
                    </button>
                  ))}
                </div>
                <p className="text-gray-500 mt-4 text-lg">💝 Choose the beautiful values you want your story to teach</p>
              </div>

              {/* Interests Selection */}
              <div className="mb-10">
                <label className="block text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Select Interests 
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {storyConfig.selectedInterests.length} selected
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        storyConfig.selectedInterests.includes(interest)
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                <p className="text-gray-500 mt-4 text-lg">🎨 Pick the exciting themes your little one loves most</p>
              </div>

              {/* Story Configuration Summary */}
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-3">
                    <BookOpen className="text-white" size={20} />
                  </div>
                  <h4 className="text-2xl font-bold text-blue-800 mb-2">Story Preview</h4>
                  <p className="text-blue-600">Here's what your personalized story will include</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/60 rounded-2xl p-6">
                    <div className="text-sm font-medium text-blue-600 mb-2">Main Character</div>
                    <div className="text-xl font-bold text-blue-800">{storyConfig.childName || '✨ Awaiting name...'}</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-6">
                    <div className="text-sm font-medium text-blue-600 mb-2">Age Group</div>
                    <div className="text-xl font-bold text-blue-800">{ageGroups.find(a => a.value === storyConfig.ageGroup)?.label}</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-6">
                    <div className="text-sm font-medium text-blue-600 mb-2">Values to Teach</div>
                    <div className="text-lg font-semibold text-blue-800">
                      {storyConfig.selectedMorals.length > 0 ? storyConfig.selectedMorals.join(', ') : '💫 Choose some values...'}
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-6">
                    <div className="text-sm font-medium text-blue-600 mb-2">Fun Themes</div>
                    <div className="text-lg font-semibold text-blue-800">
                      {storyConfig.selectedInterests.length > 0 ? storyConfig.selectedInterests.join(', ') : '🎈 Pick some interests...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prompts' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <Play className="text-purple-600" size={28} />
                Prompt Chain Configuration
              </h2>

              {/* System Prompt */}
              <div className="mb-8">
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  System Prompt
                </label>
                <textarea
                  value={promptChain.systemPrompt}
                  onChange={(e) => setPromptChain(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="Define the AI's role and behavior..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                />
                <p className="text-sm text-gray-500 mt-2">This sets the context and personality for the AI</p>
              </div>

              {/* Examples Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Story Examples
                </h3>
                
                {/* Include Examples */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                      <Check className="text-green-600" size={20} />
                      Include Examples (Stories to inspire)
                    </h4>
                    <button
                      onClick={addIncludeExample}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
                    >
                      <Plus size={16} />
                      Add Include Example
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">✨ Add examples of story styles, themes, or approaches you want the AI to use as inspiration</p>
                  <div className="space-y-4">
                    {promptChain.includeExamples.map((example, index) => (
                      <div key={example.id} className="border-2 border-green-200 bg-green-50 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-semibold text-green-800">Include Example {index + 1}</h5>
                          <button
                            onClick={() => removeIncludeExample(example.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-green-700 mb-2">Story Description</label>
                            <input
                              type="text"
                              value={example.description}
                              onChange={(e) => updateIncludeExample(example.id, 'description', e.target.value)}
                              placeholder="Brief description of this story style (e.g., 'A brave character overcoming fears')"
                              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-green-700 mb-2">Example Story</label>
                            <textarea
                              value={example.story}
                              onChange={(e) => updateIncludeExample(example.id, 'story', e.target.value)}
                              placeholder="Write an example story or story excerpt that demonstrates the style you want..."
                              rows={4}
                              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all resize-vertical bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclude Examples */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                      <AlertCircle className="text-red-600" size={20} />
                      Exclude Examples (Stories to avoid)
                    </h4>
                    <button
                      onClick={addExcludeExample}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-md"
                    >
                      <Plus size={16} />
                      Add Exclude Example
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">🚫 Add examples of story elements, themes, or styles you want the AI to avoid</p>
                  <div className="space-y-4">
                    {promptChain.excludeExamples.map((example, index) => (
                      <div key={example.id} className="border-2 border-red-200 bg-red-50 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-semibold text-red-800">Exclude Example {index + 1}</h5>
                          <button
                            onClick={() => removeExcludeExample(example.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-red-700 mb-2">What to Avoid</label>
                            <input
                              type="text"
                              value={example.description}
                              onChange={(e) => updateExcludeExample(example.id, 'description', e.target.value)}
                              placeholder="Brief description of what to avoid (e.g., 'Scary monsters or frightening situations')"
                              className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all bg-white"
                            />
                          </div>
      <div>
                            <label className="block text-sm font-semibold text-red-700 mb-2">Example to Avoid</label>
                            <textarea
                              value={example.story}
                              onChange={(e) => updateExcludeExample(example.id, 'story', e.target.value)}
                              placeholder="Write an example of the type of story content you want to avoid..."
                              rows={4}
                              className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all resize-vertical bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prompt Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Prompt Chain Steps</h3>
                  <button
                    onClick={addPromptStep}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} />
                    Add Step
                  </button>
                </div>
                <div className="space-y-4">
                  {promptChain.steps.map((step, index) => (
                    <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                            Step {step.order}
                          </span>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => updatePromptStep(step.id, 'title', e.target.value)}
                            className="font-medium text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                            placeholder="Step title..."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => movePromptStep(step.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            onClick={() => movePromptStep(step.id, 'down')}
                            disabled={index === promptChain.steps.length - 1}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button
                            onClick={() => removePromptStep(step.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={step.prompt}
                        onChange={(e) => updatePromptStep(step.id, 'prompt', e.target.value)}
                        placeholder="Enter the prompt for this step. Use {childName}, {morals}, {interests}, {ageGroup} as placeholders..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        Available placeholders: {'{childName}'}, {'{morals}'}, {'{interests}'}, {'{ageGroup}'}
                      </div>
                      {index < promptChain.steps.length - 1 && (
                        <div className="flex justify-center mt-4">
                          <ArrowDown className="text-gray-400" size={20} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Story Button */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <h4 className="font-medium text-purple-800 mb-4">Ready to Generate Story?</h4>
                <div className="text-sm text-purple-700 mb-4">
                  <div>✓ {promptChain.steps.length} prompt steps configured</div>
                  <div>✓ {promptChain.includeExamples.length} include examples provided</div>
                  <div>✓ {promptChain.excludeExamples.length} exclude examples provided</div>
                  <div>✓ System prompt defined</div>
                  <div className={apiConfig.apiKeys[apiConfig.selectedProvider] ? 'text-green-600' : 'text-red-600'}>
                    {apiConfig.apiKeys[apiConfig.selectedProvider] ? '✓' : '✗'} API key for {aiProviders[apiConfig.selectedProvider].name}
                  </div>
                  <div className={storyConfig.childName ? 'text-green-600' : 'text-red-600'}>
                    {storyConfig.childName ? '✓' : '✗'} Child's name provided
                  </div>
                  <div className={storyConfig.selectedMorals.length > 0 ? 'text-green-600' : 'text-red-600'}>
                    {storyConfig.selectedMorals.length > 0 ? '✓' : '✗'} Morals selected
                  </div>
                  <div className={storyConfig.selectedInterests.length > 0 ? 'text-green-600' : 'text-red-600'}>
                    {storyConfig.selectedInterests.length > 0 ? '✓' : '✗'} Interests selected
                  </div>
                </div>
                
                {generationState.isGenerating && (
                  <div className="mb-4 p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                      <Loader2 size={18} className="animate-spin" />
                      Generating story... Step {generationState.currentStep} of {generationState.totalSteps}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(generationState.currentStep / generationState.totalSteps) * 100}%` }}
                      ></div>
                    </div>
      </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={generateStory}
                    disabled={generationState.isGenerating}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generationState.isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 size={18} />
                        Generate Bedtime Story
                      </>
                    )}
                  </button>
                  
                  {(generationState.results.length > 0 || generationState.error) && (
                    <button
                      onClick={resetGeneration}
                      className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      title="Reset and start over"
                    >
                      <RefreshCw size={18} />
        </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <BookOpen className="text-purple-600" size={28} />
                Generated Story Results
              </h2>

              {/* Error Display */}
              {generationState.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                    <AlertCircle size={18} />
                    Generation Error
                  </div>
                  <p className="text-red-700">{generationState.error}</p>
                  <button
                    onClick={resetGeneration}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* No Results Yet */}
              {!generationState.finalStory && !generationState.error && generationState.results.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No Story Generated Yet</h3>
                  <p className="text-gray-500 mb-6">Configure your settings and generate a bedtime story to see results here.</p>
                  <button
                    onClick={() => setActiveTab('config')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Start Configuration
                  </button>
                </div>
              )}

              {/* Final Story Display */}
              {generationState.finalStory && (
                <div className="space-y-6">
                  {/* Story Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-purple-800 mb-3">
                      Bedtime Story for {storyConfig.childName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-700">
                      <div>
                        <strong>Age Group:</strong> {ageGroups.find(a => a.value === storyConfig.ageGroup)?.label}
                      </div>
                      <div>
                        <strong>AI Model:</strong> {aiProviders[apiConfig.selectedProvider].name} - {aiProviders[apiConfig.selectedProvider].models.find(m => m.id === apiConfig.selectedModel)?.name}
                      </div>
                      <div>
                        <strong>Morals:</strong> {storyConfig.selectedMorals.join(', ')}
                      </div>
                      <div>
                        <strong>Interests:</strong> {storyConfig.selectedInterests.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <div className="prose prose-lg max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {generationState.finalStory}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={downloadStory}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download size={18} />
                      Download Story
                    </button>
                    <button
                      onClick={generateStory}
                      disabled={generationState.isGenerating}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={18} />
                      Generate New Version
                    </button>
                    <button
                      onClick={resetGeneration}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Trash2 size={18} />
                      Clear Results
                    </button>
                  </div>

                  {/* Generation Steps Details */}
                  {generationState.results.length > 0 && (
                    <details className="mt-8">
                      <summary className="cursor-pointer font-medium text-gray-700 hover:text-purple-600 transition-colors">
                        View Generation Steps ({generationState.results.length} steps)
                      </summary>
                      <div className="mt-4 space-y-4">
                        {generationState.results.map((result, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-800 mb-2">
                              Step {result.step}: {result.title}
                            </h4>
                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Prompt:</strong> {result.prompt}
                            </div>
                            <div className="bg-gray-50 p-3 rounded text-sm">
                              <strong>Response:</strong>
                              <div className="mt-1 whitespace-pre-wrap">{result.response}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
