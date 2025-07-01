import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { MessageSquare, Play, Pause, Square, RotateCcw, Users, TrendingUp, Clock, Zap, Globe, Share2 } from 'lucide-react'
import AISearchImpact from './AISearchImpact'

// API Service for AI Conversations
class AIConversationAPI {
  constructor() {
    this.baseURL = 'https://cognitive-persuasion-backend.onrender.com'
  }

  async request(endpoint, options = {}) {
    try {
      console.log(`AI API Request: ${this.baseURL}${endpoint}`, options)
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      console.log(`AI API Response Status: ${response.status}`)
      
      const data = await response.json()
      console.log('AI API Response Data:', data)

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error('AI API Error:', error)
      throw error
    }
  }

  // Business endpoints
  async getBusinesses() {
    return this.request('/api/businesses')
  }

  // AI Conversation endpoints
  async startConversation(businessId) {
    return this.request('/api/ai-conversations/start', {
      method: 'POST',
      body: { business_id: businessId }
    })
  }

  async pauseConversation(conversationId) {
    return this.request(`/api/ai-conversations/${conversationId}/pause`, {
      method: 'POST'
    })
  }

  async resumeConversation(conversationId) {
    return this.request(`/api/ai-conversations/${conversationId}/resume`, {
      method: 'POST'
    })
  }

  async stopConversation(conversationId) {
    return this.request(`/api/ai-conversations/${conversationId}/stop`, {
      method: 'POST'
    })
  }

  async resetConversation(conversationId) {
    return this.request(`/api/ai-conversations/${conversationId}/reset`, {
      method: 'POST'
    })
  }

  async getConversationStatus(conversationId) {
    return this.request(`/api/ai-conversations/${conversationId}/status`)
  }

  async getConversationMessages(conversationId) {
    return this.request(`/api/ai-conversations/${conversationId}/messages`)
  }
}

const aiAPI = new AIConversationAPI()

// AI Agent Status Component
function AIAgentStatus({ agent, isActive }) {
  const getStatusColor = () => {
    if (isActive) return 'bg-green-500'
    return 'bg-gray-400'
  }

  const getStatusText = () => {
    if (isActive) return 'Active'
    return 'Standby'
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <div>
          <div className="font-medium text-sm">{agent.name}</div>
          <div className="text-xs text-gray-500">{agent.model}</div>
        </div>
      </div>
      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
        {getStatusText()}
      </Badge>
    </div>
  )
}

// Conversation Message Component
function ConversationMessage({ message }) {
  const getAgentColor = (agentName) => {
    const colors = {
      'Business Promoter': 'border-l-blue-500 bg-blue-50',
      'Critical Analyst': 'border-l-red-500 bg-red-50',
      'Neutral Evaluator': 'border-l-green-500 bg-green-50',
      'Market Researcher': 'border-l-purple-500 bg-purple-50'
    }
    return colors[agentName] || 'border-l-gray-500 bg-gray-50'
  }

  return (
    <div className={`border-l-4 p-3 mb-3 rounded-r-lg ${getAgentColor(message.agent_name)}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-sm">{message.agent_name}</div>
        <div className="text-xs text-gray-500">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
      <div className="text-sm text-gray-700">{message.content}</div>
    </div>
  )
}

// Main Enhanced AI Conversation Dashboard Component
export default function AIConversationDashboardEnhanced() {
  const [businesses, setBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [selectedBusinessData, setSelectedBusinessData] = useState(null)
  const [conversationState, setConversationState] = useState('stopped')
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState({
    totalMessages: 0,
    currentRound: 0,
    duration: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('conversation')
  const [publishSuccess, setPublishSuccess] = useState(null)

  // AI Agents configuration
  const aiAgents = [
    {
      name: 'Business Promoter',
      model: 'GPT-4',
      role: 'Advocate for the business with factual, compelling arguments',
      api_service: 'openai'
    },
    {
      name: 'Critical Analyst',
      model: 'Claude-3',
      role: 'Ask tough questions and challenge claims objectively',
      api_service: 'anthropic'
    },
    {
      name: 'Neutral Evaluator',
      model: 'Gemini Pro',
      role: 'Provide balanced analysis and mediate discussions',
      api_service: 'google'
    },
    {
      name: 'Market Researcher',
      model: 'Perplexity',
      role: 'Provide real-time market data and competitive analysis',
      api_service: 'perplexity'
    }
  ]

  // Load businesses on component mount
  useEffect(() => {
    loadBusinesses()
  }, [])

  // Update selected business data when selection changes
  useEffect(() => {
    if (selectedBusiness && businesses.length > 0) {
      const businessData = businesses.find(b => b.business_type_id === selectedBusiness)
      setSelectedBusinessData(businessData)
    } else {
      setSelectedBusinessData(null)
    }
  }, [selectedBusiness, businesses])

  const loadBusinesses = async () => {
    try {
      console.log('Loading businesses for AI conversations...')
      const data = await aiAPI.getBusinesses()
      console.log('Businesses loaded for AI:', data)
      setBusinesses(data.business_types || [])
    } catch (error) {
      console.error('Failed to load businesses for AI conversations:', error)
      setError('Failed to load businesses: ' + error.message)
    }
  }

  const handleStartConversation = async () => {
    if (!selectedBusiness) {
      setError('Please select a business first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Starting AI conversation for business:', selectedBusiness)
      const result = await aiAPI.startConversation(selectedBusiness)
      console.log('Conversation started:', result)
      
      setCurrentConversationId(result.conversation_id)
      setConversationState('running')
      setMessages([])
      setStats({ totalMessages: 0, currentRound: 1, duration: 0 })
      
      // Start polling for messages
      startMessagePolling(result.conversation_id)
    } catch (error) {
      console.error('Failed to start conversation:', error)
      setError('Failed to start conversation: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseConversation = async () => {
    if (!currentConversationId) return

    try {
      await aiAPI.pauseConversation(currentConversationId)
      setConversationState('paused')
    } catch (error) {
      console.error('Failed to pause conversation:', error)
      setError('Failed to pause conversation: ' + error.message)
    }
  }

  const handleResumeConversation = async () => {
    if (!currentConversationId) return

    try {
      await aiAPI.resumeConversation(currentConversationId)
      setConversationState('running')
      startMessagePolling(currentConversationId)
    } catch (error) {
      console.error('Failed to resume conversation:', error)
      setError('Failed to resume conversation: ' + error.message)
    }
  }

  const handleStopConversation = async () => {
    if (!currentConversationId) return

    try {
      await aiAPI.stopConversation(currentConversationId)
      setConversationState('stopped')
      setCurrentConversationId(null)
      stopMessagePolling()
    } catch (error) {
      console.error('Failed to stop conversation:', error)
      setError('Failed to stop conversation: ' + error.message)
    }
  }

  const handleResetConversation = async () => {
    if (!currentConversationId) return

    try {
      await aiAPI.resetConversation(currentConversationId)
      setMessages([])
      setStats({ totalMessages: 0, currentRound: 0, duration: 0 })
      setConversationState('stopped')
      setCurrentConversationId(null)
    } catch (error) {
      console.error('Failed to reset conversation:', error)
      setError('Failed to reset conversation: ' + error.message)
    }
  }

  // Message polling (simulated for now)
  const [pollingInterval, setPollingInterval] = useState(null)

  const startMessagePolling = (conversationId) => {
    const interval = setInterval(async () => {
      try {
        // For now, simulate messages since the backend might not have real AI responses yet
        if (messages.length < 16) {
          const simulatedMessage = {
            id: `msg_${Date.now()}`,
            agent_name: aiAgents[messages.length % 4].name,
            content: `This is a simulated AI response about ${getSelectedBusinessName()}. Message ${messages.length + 1} analyzing the business from the perspective of ${aiAgents[messages.length % 4].role.toLowerCase()}.`,
            timestamp: new Date().toISOString(),
            conversation_id: conversationId,
            business_id: selectedBusiness
          }
          
          setMessages(prev => [...prev, simulatedMessage])
          setStats(prev => ({
            ...prev,
            totalMessages: prev.totalMessages + 1,
            currentRound: Math.floor((prev.totalMessages + 1) / 4) + 1,
            duration: prev.duration + 5
          }))

          // Auto-complete conversation after 16 messages
          if (messages.length === 15) {
            setTimeout(() => {
              setConversationState('completed')
              stopMessagePolling()
              setActiveTab('ai-search') // Switch to AI search tab when conversation completes
            }, 3000)
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error)
      }
    }, 3000) // Poll every 3 seconds

    setPollingInterval(interval)
  }

  const stopMessagePolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMessagePolling()
    }
  }, [pollingInterval])

  const getSelectedBusinessName = () => {
    const business = businesses.find(b => b.business_type_id === selectedBusiness)
    return business ? business.name : 'No business selected'
  }

  const handlePublishSuccess = (result) => {
    setPublishSuccess(result)
    console.log('AI Search publishing successful:', result)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Conversation Engine</h2>
        <p className="text-gray-600">Real-time AI-to-AI business promotion debates with AI search engine optimization</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Success Display */}
      {publishSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-800">
            <strong>Success!</strong> Your business has been published to AI search engines. 
            <a href={publishSuccess.public_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
              View public page →
            </a>
          </div>
        </div>
      )}

      {/* Mission Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Mission Control</span>
          </CardTitle>
          <CardDescription>Select a business and control AI conversations in real-time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Business Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Business</label>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={conversationState === 'running'}
            >
              <option value="">Choose a business to promote</option>
              {businesses.map((business) => (
                <option key={business.business_type_id} value={business.business_type_id}>
                  {business.name} - {business.industry_category}
                </option>
              ))}
            </select>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                conversationState === 'running' ? 'bg-green-500' : 
                conversationState === 'paused' ? 'bg-yellow-500' : 
                conversationState === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium capitalize">{conversationState}</span>
            </div>

            {conversationState === 'stopped' && (
              <Button 
                onClick={handleStartConversation} 
                disabled={!selectedBusiness || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Debate
              </Button>
            )}

            {conversationState === 'running' && (
              <Button 
                onClick={handlePauseConversation}
                variant="outline"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}

            {conversationState === 'paused' && (
              <Button 
                onClick={handleResumeConversation}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}

            {(conversationState === 'running' || conversationState === 'paused') && (
              <Button 
                onClick={handleStopConversation}
                variant="destructive"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}

            {currentConversationId && (
              <Button 
                onClick={handleResetConversation}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conversation" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>AI Conversation</span>
          </TabsTrigger>
          <TabsTrigger value="ai-search" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>AI Search Impact</span>
            {conversationState === 'completed' && (
              <Badge variant="secondary" className="ml-2">Ready</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Conversation */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Live AI Conversation</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time AI-to-AI debate about {getSelectedBusinessName()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No active conversation</p>
                          <p className="text-sm">Select a business and start a debate to see AI conversations</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {messages.map((message) => (
                          <ConversationMessage key={message.id} message={message} />
                        ))}
                        {conversationState === 'completed' && (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-blue-600 mb-2">
                              <Globe className="h-4 w-4" />
                              <span className="font-medium">Conversation Complete!</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Your AI conversation is ready to be published to AI search engines. 
                              Switch to the "AI Search Impact" tab to push your business into AI search results.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Conversation Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Conversation Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Messages</span>
                    <span className="font-medium">{stats.totalMessages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Round</span>
                    <span className="font-medium">{stats.currentRound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="font-medium">{Math.floor(stats.duration / 60)}:{(stats.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Agents Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>AI Agents</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiAgents.map((agent) => (
                    <AIAgentStatus 
                      key={agent.name} 
                      agent={agent} 
                      isActive={conversationState === 'running'}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-search" className="space-y-6">
          <AISearchImpact 
            conversationId={currentConversationId}
            businessData={selectedBusinessData}
            onPublishSuccess={handlePublishSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

