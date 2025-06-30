import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Bot, Zap, Lightbulb, Shield, Users, Copy, RefreshCw, Loader2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'

const LiveChat = ({ business, audience, onBack, currentUser }) => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [missionObjective, setMissionObjective] = useState('')
  const [sessionStarted, setSessionStarted] = useState(false)
  const [typingAgents, setTypingAgents] = useState(new Set())
  const [sessionStats, setSessionStats] = useState({
    creditsUsed: 0,
    messagesCount: 0,
    duration: 0
  })
  const messagesEndRef = useRef(null)
  const startTimeRef = useRef(null)

  // AI Agent configurations
  const aiAgents = {
    logic: {
      name: 'Logic Agent',
      icon: Bot,
      color: 'blue',
      provider: 'OpenAI GPT-4',
      description: 'Analytical reasoning and data-driven insights'
    },
    emotion: {
      name: 'Emotion Agent', 
      icon: Zap,
      color: 'red',
      provider: 'OpenAI GPT-4',
      description: 'Emotional intelligence and persuasive messaging'
    },
    creative: {
      name: 'Creative Agent',
      icon: Lightbulb,
      color: 'yellow',
      provider: 'Google Gemini',
      description: 'Innovative ideas and creative solutions'
    },
    authority: {
      name: 'Authority Agent',
      icon: Shield,
      color: 'green',
      provider: 'Google Gemini',
      description: 'Credibility and expert positioning'
    },
    social: {
      name: 'Social Proof Agent',
      icon: Users,
      color: 'purple',
      provider: 'Claude (Anthropic)',
      description: 'Social validation and community building'
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Update session duration
  useEffect(() => {
    if (sessionStarted && !startTimeRef.current) {
      startTimeRef.current = Date.now()
    }
    
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setSessionStats(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionStarted])

  const startSession = async () => {
    if (!missionObjective.trim()) return

    setIsLoading(true)
    setSessionStarted(true)
    
    try {
      // Add initial system message
      const systemMessage = {
        id: Date.now(),
        type: 'system',
        content: `🚀 **Mission Started**: ${missionObjective}`,
        timestamp: new Date(),
        business: business.name,
        audience: audience.name
      }
      setMessages([systemMessage])

      // Simulate AI agents starting to work
      const agentOrder = ['logic', 'emotion', 'creative', 'authority', 'social']
      
      for (let i = 0; i < agentOrder.length; i++) {
        const agentType = agentOrder[i]
        const agent = aiAgents[agentType]
        
        // Show typing indicator
        setTypingAgents(prev => new Set([...prev, agentType]))
        
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
        
        // Remove typing indicator
        setTypingAgents(prev => {
          const newSet = new Set(prev)
          newSet.delete(agentType)
          return newSet
        })
        
        // Generate contextual response based on business and audience
        const response = generateAIResponse(agentType, business, audience, missionObjective)
        
        const message = {
          id: Date.now() + i,
          type: 'ai',
          agentType,
          content: response,
          timestamp: new Date(),
          provider: agent.provider
        }
        
        setMessages(prev => [...prev, message])
        setSessionStats(prev => ({
          ...prev,
          creditsUsed: prev.creditsUsed + 1,
          messagesCount: prev.messagesCount + 1
        }))
        
        // Small delay between agents
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
    } catch (error) {
      console.error('Session error:', error)
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        content: 'Failed to start AI session. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (agentType, business, audience, objective) => {
    const businessContext = `${business.name} (${business.industry_category})`
    const audienceContext = audience.manual_description || audience.description
    
    const responses = {
      logic: [
        `Based on data analysis for ${businessContext}, targeting ${audience.name} requires a strategic approach. Key metrics show that ${audienceContext.toLowerCase()} respond best to clear value propositions with measurable benefits. I recommend focusing on ROI-driven messaging that demonstrates concrete outcomes.`,
        `From a logical standpoint, ${business.name} should leverage industry benchmarks to position against competitors. The target demographic of ${audience.name} typically evaluates decisions based on cost-benefit analysis and proven results.`,
        `Statistical evidence suggests that ${audienceContext.toLowerCase()} have specific pain points that ${businessContext} can address. The optimal approach involves presenting data-backed solutions with clear implementation timelines.`
      ],
      emotion: [
        `The emotional connection with ${audience.name} is crucial for ${business.name}. ${audienceContext} often feel overwhelmed by choices - we need to create messaging that provides comfort and confidence. Focus on peace of mind, security, and the feeling of making the right decision.`,
        `For ${businessContext}, the emotional trigger points with ${audience.name} center around trust and reliability. These customers want to feel valued and understood. Our messaging should emphasize personal attention and genuine care for their success.`,
        `The emotional journey for ${audienceContext.toLowerCase()} involves moving from uncertainty to confidence. ${business.name} should position itself as the trusted guide who understands their challenges and provides reassuring solutions.`
      ],
      creative: [
        `Here's an innovative approach for ${business.name}: Create a unique customer experience that sets you apart in the ${business.industry_category} space. For ${audience.name}, consider developing interactive tools or personalized consultations that make the decision process engaging and memorable.`,
        `Creative positioning for ${businessContext} could involve storytelling that resonates with ${audienceContext.toLowerCase()}. Think about creating case studies that feel like success stories rather than sales pitches - showing transformation and positive outcomes.`,
        `An out-of-the-box idea: ${business.name} could develop a signature methodology or framework that becomes synonymous with your brand. This gives ${audience.name} something tangible to remember and share with others.`
      ],
      authority: [
        `${business.name} needs to establish thought leadership in the ${business.industry_category} sector. For ${audience.name}, credibility comes from demonstrated expertise and industry recognition. Showcase certifications, awards, and expert endorsements prominently.`,
        `Authority positioning for ${businessContext} should emphasize years of experience and successful track record. ${audienceContext} trust providers who have proven themselves with similar customers and can provide references and testimonials.`,
        `To build authority with ${audience.name}, ${business.name} should share industry insights and educational content. Position yourself as the go-to expert who not only provides services but also educates and guides customers toward informed decisions.`
      ],
      social: [
        `Social proof is powerful for ${audience.name} when considering ${business.name}. ${audienceContext} are heavily influenced by peer recommendations and community validation. Leverage customer testimonials, case studies, and user-generated content to build trust.`,
        `For ${businessContext}, community building around your brand creates strong social validation. ${audience.name} want to see that others like them have chosen and succeeded with your services. Create opportunities for customers to share their experiences.`,
        `The social aspect for ${audienceContext.toLowerCase()} involves belonging to a community of smart decision-makers. ${business.name} should foster a sense of exclusivity and insider knowledge that makes customers feel part of something special.`
      ]
    }
    
    const agentResponses = responses[agentType] || ['Generic response for this agent type.']
    return agentResponses[Math.floor(Math.random() * agentResponses.length)]
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    // Could add a toast notification here
  }

  const regenerateResponse = async (agentType) => {
    setTypingAgents(prev => new Set([...prev, agentType]))
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setTypingAgents(prev => {
      const newSet = new Set(prev)
      newSet.delete(agentType)
      return newSet
    })
    
    const newResponse = generateAIResponse(agentType, business, audience, missionObjective)
    
    setMessages(prev => prev.map(msg => 
      msg.agentType === agentType && msg.type === 'ai' 
        ? { ...msg, content: newResponse, timestamp: new Date() }
        : msg
    ))
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const TypingIndicator = ({ agentType }) => {
    const agent = aiAgents[agentType]
    const Icon = agent.icon
    
    return (
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
        <div className={`w-8 h-8 rounded-full bg-${agent.color}-100 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 text-${agent.color}-600`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{agent.name}</span>
            <Badge variant="outline" className="text-xs">{agent.provider}</Badge>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <span className="text-sm text-gray-600">Thinking</span>
            <div className="flex space-x-1">
              <Circle className="w-2 h-2 text-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <Circle className="w-2 h-2 text-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <Circle className="w-2 h-2 text-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MessageBubble = ({ message }) => {
    if (message.type === 'system') {
      return (
        <div className="text-center py-4">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            {message.content}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Business: {message.business} • Audience: {message.audience}
          </div>
        </div>
      )
    }

    if (message.type === 'error') {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {message.content}
          </AlertDescription>
        </Alert>
      )
    }

    const agent = aiAgents[message.agentType]
    const Icon = agent.icon

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full bg-${agent.color}-100 flex items-center justify-center`}>
            <Icon className={`w-4 h-4 text-${agent.color}-600`} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{agent.name}</span>
            <Badge variant="outline" className="text-xs">{message.provider}</Badge>
            <span className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <div className="ml-11 bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-gray-800 leading-relaxed">{message.content}</p>
          
          <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyMessage(message.content)}
              className="text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateResponse(message.agentType)}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-sm text-gray-600">Targeting: {audience.name}</p>
            </div>
          </div>
          
          {sessionStarted && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div>Credits: {sessionStats.creditsUsed}</div>
              <div>Messages: {sessionStats.messagesCount}</div>
              <div>Duration: {formatDuration(sessionStats.duration)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!sessionStarted ? (
          /* Mission Setup */
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Start AI Conversation</CardTitle>
                <CardDescription>
                  Define your mission objective to begin the AI-powered discussion between multiple agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mission Objective
                  </label>
                  <Textarea
                    placeholder="Describe what you want to achieve with this business and audience..."
                    value={missionObjective}
                    onChange={(e) => setMissionObjective(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Business:</strong> {business.name}
                    <br />
                    <span className="text-gray-600">{business.description}</span>
                  </div>
                  <div>
                    <strong>Audience:</strong> {audience.name}
                    <br />
                    <span className="text-gray-600">
                      {audience.manual_description || audience.description}
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={startSession} 
                  disabled={!missionObjective.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Session...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Start AI Conversation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {/* Typing Indicators */}
            {Array.from(typingAgents).map(agentType => (
              <TypingIndicator key={agentType} agentType={agentType} />
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveChat

