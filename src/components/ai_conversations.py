import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, RotateCcw, MessageSquare, Users, Activity, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { config as API_CONFIG } from '../config.js'

// AI Conversation Dashboard Component
function AIConversationDashboard() {
  const [businesses, setBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [conversationState, setConversationState] = useState('stopped')
  const [messages, setMessages] = useState([])
  const [conversationStats, setConversationStats] = useState({
    totalMessages: 0,
    currentRound: 0,
    lastActivity: null
  })
  const [aiAgents, setAiAgents] = useState([
    { name: 'Business Promoter', model: 'GPT-4', status: 'active' },
    { name: 'Critical Analyst', model: 'Claude-3', status: 'active' },
    { name: 'Neutral Evaluator', model: 'Gemini Pro', status: 'active' },
    { name: 'Market Researcher', model: 'Perplexity', status: 'active' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  // Load businesses on component mount
  useEffect(() => {
    loadBusinesses()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Poll for conversation updates when active
  useEffect(() => {
    let interval = null
    if (conversationId && conversationState === 'running') {
      interval = setInterval(() => {
        fetchConversationUpdates()
      }, 2000) // Poll every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [conversationId, conversationState])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadBusinesses = async () => {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/businesses`)
      const data = await response.json()
      setBusinesses(data.businesses || [])
    } catch (error) {
      console.error('Failed to load businesses:', error)
      setError('Failed to load businesses')
    }
  }

  const fetchConversationUpdates = async () => {
    if (!conversationId) return

    try {
      // Get conversation status
      const statusResponse = await fetch(`${API_CONFIG.API_BASE_URL}/api/ai-conversations/${conversationId}/status`)
      const statusData = await statusResponse.json()
      
      if (statusData.state) {
        setConversationState(statusData.state)
        setConversationStats({
          totalMessages: statusData.total_messages || 0,
          currentRound: statusData.current_round || 0,
          lastActivity: statusData.last_activity
        })
      }

      // Get new messages
      const messagesResponse = await fetch(`${API_CONFIG.API_BASE_URL}/api/ai-conversations/${conversationId}/messages`)
      const messagesData = await messagesResponse.json()
      
      if (messagesData.messages) {
        setMessages(messagesData.messages)
      }
    } catch (error) {
      console.error('Failed to fetch conversation updates:', error)
    }
  }

  const startConversation = async () => {
    if (!selectedBusiness) {
      setError('Please select a business first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/ai-conversations/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_id: selectedBusiness.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        setConversationId(data.conversation_id)
        setConversationState('running')
        setMessages([])
        setConversationStats({ totalMessages: 0, currentRound: 1, lastActivity: new Date().toISOString() })
      } else {
        setError(data.error || 'Failed to start conversation')
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
      setError('Failed to start conversation')
    } finally {
      setLoading(false)
    }
  }

  const pauseConversation = async () => {
    if (!conversationId) return

    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/ai-conversations/${conversationId}/pause`, {
        method: 'POST'
      })

      if (response.ok) {
        setConversationState('paused')
      }
    } catch (error) {
      console.error('Failed to pause conversation:', error)
    }
  }

  const resumeConversation = async () => {
    if (!conversationId) return

    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/ai-conversations/${conversationId}/resume`, {
        method: 'POST'
      })

      if (response.ok) {
        setConversationState('running')
      }
    } catch (error) {
      console.error('Failed to resume conversation:', error)
    }
  }

  const stopConversation = async () => {
    if (!conversationId) return

    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/ai-conversations/${conversationId}/stop`, {
        method: 'POST'
      })

      if (response.ok) {
        setConversationState('stopped')
      }
    } catch (error) {
      console.error('Failed to stop conversation:', error)
    }
  }

  const resetConversation = () => {
    setConversationId(null)
    setConversationState('stopped')
    setMessages([])
    setConversationStats({ totalMessages: 0, currentRound: 0, lastActivity: null })
    setError(null)
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString()
  }

  const getStateColor = (state) => {
    switch (state) {
      case 'running': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'stopped': return 'bg-gray-500'
      case 'completed': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getAgentColor = (agentName) => {
    const colors = {
      'Business Promoter': 'bg-blue-100 text-blue-800',
      'Critical Analyst': 'bg-red-100 text-red-800',
      'Neutral Evaluator': 'bg-green-100 text-green-800',
      'Market Researcher': 'bg-purple-100 text-purple-800'
    }
    return colors[agentName] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Conversation Engine</h2>
        <p className="text-gray-600">Real-time AI-to-AI business promotion debates</p>
      </div>

      {/* Mission Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Mission Control
          </CardTitle>
          <CardDescription>
            Select a business and control AI conversations in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Business Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Business
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedBusiness?.id || ''}
                onChange={(e) => {
                  const business = businesses.find(b => b.id === parseInt(e.target.value))
                  setSelectedBusiness(business)
                }}
              >
                <option value="">Choose a business to promote</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} ({business.industry_category})
                  </option>
                ))}
              </select>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStateColor(conversationState)}`}></div>
                <span className="text-sm font-medium capitalize">{conversationState}</span>
              </div>
              
              <div className="flex space-x-2">
                {conversationState === 'stopped' && (
                  <Button 
                    onClick={startConversation} 
                    disabled={!selectedBusiness || loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Debate
                  </Button>
                )}
                
                {conversationState === 'running' && (
                  <Button 
                    onClick={pauseConversation}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                
                {conversationState === 'paused' && (
                  <Button 
                    onClick={resumeConversation}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
                
                {(conversationState === 'running' || conversationState === 'paused') && (
                  <Button 
                    onClick={stopConversation}
                    variant="destructive"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                )}
                
                <Button 
                  onClick={resetConversation}
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Live AI Conversation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Live AI Conversation
          </CardTitle>
          <CardDescription>
            Real-time AI-to-AI debate about {selectedBusiness?.name || 'selected business'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 border border-gray-200 rounded-lg p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No active conversation</p>
                  <p className="text-sm">Select a business and start a debate to see AI conversations</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getAgentColor(message.agent_name)}>
                        {message.agent_name}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{message.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Conversation Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{conversationStats.totalMessages}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{conversationStats.currentRound}</div>
                <div className="text-sm text-gray-600">Current Round</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              AI Agents
            </CardTitle>
            <CardDescription>
              Active participants in the conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiAgents.map((agent, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-600">{agent.model}</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Profile */}
      {selectedBusiness && (
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{selectedBusiness.name}</h3>
              <p className="text-gray-600">{selectedBusiness.industry_category}</p>
              <p className="text-gray-800">{selectedBusiness.description}</p>
              <div className="mt-4">
                <Badge className="bg-blue-100 text-blue-800">
                  Status: active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AIConversationDashboard

