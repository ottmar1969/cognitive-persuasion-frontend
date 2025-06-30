import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Brain, Lightbulb, Heart, Crown, Users, RefreshCw, Copy, Check } from 'lucide-react'

// AI Response Display Component
export function AIResponseDisplay({ responses, onRegenerate, loading = false }) {
  const [copiedAgent, setCopiedAgent] = useState(null)

  const agentConfig = {
    logic_agent: {
      title: 'Logic Agent',
      icon: Brain,
      color: 'bg-blue-500',
      description: 'Rational, fact-based persuasion',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    emotion_agent: {
      title: 'Emotion Agent',
      icon: Heart,
      color: 'bg-red-500',
      description: 'Emotional appeal and connection',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    creative_agent: {
      title: 'Creative Agent',
      icon: Lightbulb,
      color: 'bg-yellow-500',
      description: 'Creative storytelling and imagery',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    authority_agent: {
      title: 'Authority Agent',
      icon: Crown,
      color: 'bg-purple-500',
      description: 'Expertise and credibility',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    social_proof_agent: {
      title: 'Social Proof Agent',
      icon: Users,
      color: 'bg-green-500',
      description: 'Testimonials and peer validation',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  }

  const copyToClipboard = async (text, agentType) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAgent(agentType)
      setTimeout(() => setCopiedAgent(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  if (!responses || Object.keys(responses).length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No AI responses available. Create a session to generate persuasive messages.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">AI-Generated Responses</h3>
          <p className="text-sm text-gray-600">Five different persuasion approaches for your campaign</p>
        </div>
        {onRegenerate && (
          <Button
            onClick={onRegenerate}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(responses).map(([agentType, response]) => {
          const config = agentConfig[agentType]
          if (!config || !response) return null

          const IconComponent = config.icon

          return (
            <Card key={agentType} className={`${config.bgColor} ${config.borderColor} border-2`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${config.color} text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {config.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(response, agentType)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedAgent === agentType ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 leading-relaxed">{response}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {Object.keys(responses).length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Usage Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use different agents for different audience segments</li>
            <li>• Combine multiple approaches for comprehensive campaigns</li>
            <li>• Test which agent resonates best with your specific audience</li>
            <li>• Click the copy button to use responses in your marketing materials</li>
          </ul>
        </div>
      )}
    </div>
  )
}

// Session Results Modal Component
export function SessionResultsModal({ session, isOpen, onClose, onRegenerate }) {
  if (!isOpen || !session) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Session Results</h2>
              <p className="text-gray-600 mt-1">{session.mission_objective}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <Badge variant="secondary">
              {session.business_type?.name || 'Unknown Business'}
            </Badge>
            <Badge variant="outline">
              {session.target_audience?.name || 'Unknown Audience'}
            </Badge>
            <Badge variant="secondary">
              {session.credits_consumed} Credits Used
            </Badge>
          </div>
        </div>

        <div className="p-6">
          <AIResponseDisplay
            responses={session.ai_responses}
            onRegenerate={onRegenerate}
          />
        </div>
      </div>
    </div>
  )
}

// Enhanced Session Card Component
export function SessionCard({ session, onClick, onStatusChange }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">
            {session.mission_objective}
          </CardTitle>
          <Badge className={getStatusColor(session.status)}>
            {session.status}
          </Badge>
        </div>
        <CardDescription>
          Created {formatDate(session.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Business:</span>
            <p className="text-gray-600 truncate">
              {session.business_type?.name || 'Unknown'}
            </p>
          </div>
          <div>
            <span className="font-medium">Audience:</span>
            <p className="text-gray-600 truncate">
              {session.target_audience?.name || 'Unknown'}
            </p>
          </div>
          <div>
            <span className="font-medium">Credits Used:</span>
            <p className="text-gray-600">{session.credits_consumed}</p>
          </div>
          <div>
            <span className="font-medium">Responses:</span>
            <p className="text-gray-600">
              {session.ai_responses ? Object.keys(session.ai_responses).length : 0} agents
            </p>
          </div>
        </div>
        
        {session.ai_responses && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <Heart className="h-4 w-4 text-red-500" />
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <Crown className="h-4 w-4 text-purple-500" />
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-500 ml-2">
                AI responses generated
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

