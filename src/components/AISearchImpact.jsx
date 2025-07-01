import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  Globe, 
  TrendingUp, 
  Share2, 
  Eye, 
  Search, 
  BarChart3, 
  ExternalLink,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react'

// AI Search Impact API Service
class AISearchAPI {
  constructor() {
    this.baseURL = 'https://cognitive-persuasion-backend.onrender.com'
  }

  async request(endpoint, options = {}) {
    try {
      console.log(`AI Search API Request: ${this.baseURL}${endpoint}`, options)
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      console.log(`AI Search API Response Status: ${response.status}`)
      
      const data = await response.json()
      console.log('AI Search API Response Data:', data)

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error('AI Search API Error:', error)
      throw error
    }
  }

  // AI Search optimization endpoints
  async publishConversation(conversationData, businessData) {
    return this.request('/api/ai-search/publish', {
      method: 'POST',
      body: { 
        conversation_data: conversationData,
        business_data: businessData
      }
    })
  }

  async getAIImpact(publicId) {
    return this.request(`/api/ai-search/impact/${publicId}`)
  }

  async getAISearchStats() {
    return this.request('/api/ai-search/stats')
  }
}

const aiSearchAPI = new AISearchAPI()

// AI Search Engine Status Component
function AISearchEngineStatus({ engine, mentions, avgPosition, isActive }) {
  const getStatusColor = () => {
    if (mentions > 10) return 'bg-green-500'
    if (mentions > 5) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const getPositionColor = () => {
    if (avgPosition <= 2) return 'text-green-600'
    if (avgPosition <= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <div>
          <div className="font-medium text-sm">{engine}</div>
          <div className="text-xs text-gray-500">{mentions} mentions</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-medium text-sm ${getPositionColor()}`}>
          #{avgPosition.toFixed(1)}
        </div>
        <div className="text-xs text-gray-500">avg position</div>
      </div>
    </div>
  )
}

// Publishing Status Component
function PublishingStatus({ platform, status, url }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'published':
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'published':
      case 'submitted':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div>
          <div className="font-medium text-sm">{platform}</div>
          <div className="text-xs opacity-75 capitalize">{status}</div>
        </div>
      </div>
      {url && (
        <Button variant="ghost" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  )
}

// Main AI Search Impact Component
export default function AISearchImpact({ conversationId, businessData, onPublishSuccess }) {
  const [publishingStatus, setPublishingStatus] = useState('idle') // idle, publishing, published
  const [publishResults, setPublishResults] = useState(null)
  const [impactData, setImpactData] = useState(null)
  const [overallStats, setOverallStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load overall AI search stats on component mount
  useEffect(() => {
    loadOverallStats()
  }, [])

  // Load impact data if conversation is already published
  useEffect(() => {
    if (publishResults?.public_id) {
      loadImpactData(publishResults.public_id)
    }
  }, [publishResults])

  const loadOverallStats = async () => {
    try {
      const data = await aiSearchAPI.getAISearchStats()
      setOverallStats(data.stats)
    } catch (error) {
      console.error('Failed to load AI search stats:', error)
    }
  }

  const loadImpactData = async (publicId) => {
    try {
      const data = await aiSearchAPI.getAIImpact(publicId)
      setImpactData(data.impact_data)
    } catch (error) {
      console.error('Failed to load impact data:', error)
    }
  }

  const handlePublishToAISearch = async () => {
    if (!conversationId || !businessData) {
      setError('Missing conversation or business data')
      return
    }

    setLoading(true)
    setError(null)
    setPublishingStatus('publishing')

    try {
      // Simulate conversation data (in real implementation, this would come from the conversation)
      const conversationData = {
        conversation_id: conversationId,
        messages: [
          {
            id: 'msg_1',
            agent_name: 'Business Promoter',
            model: 'GPT-4',
            content: `${businessData.name} stands out in the ${businessData.industry_category} industry with exceptional service quality and customer satisfaction.`,
            timestamp: new Date().toISOString()
          },
          {
            id: 'msg_2',
            agent_name: 'Critical Analyst',
            model: 'Claude-3',
            content: `While ${businessData.name} shows promise, let's examine their competitive positioning and market challenges.`,
            timestamp: new Date().toISOString()
          },
          {
            id: 'msg_3',
            agent_name: 'Neutral Evaluator',
            model: 'Gemini Pro',
            content: `Analyzing ${businessData.name} objectively, they demonstrate strong fundamentals with room for strategic growth.`,
            timestamp: new Date().toISOString()
          },
          {
            id: 'msg_4',
            agent_name: 'Market Researcher',
            model: 'Perplexity',
            content: `Current market data indicates ${businessData.name} is well-positioned in the ${businessData.industry_category} sector.`,
            timestamp: new Date().toISOString()
          }
        ]
      }

      console.log('Publishing conversation to AI search engines...', { conversationData, businessData })
      
      const result = await aiSearchAPI.publishConversation(conversationData, businessData)
      console.log('Publishing result:', result)

      if (result.success) {
        setPublishResults(result)
        setPublishingStatus('published')
        
        if (onPublishSuccess) {
          onPublishSuccess(result)
        }

        // Load impact data after successful publishing
        setTimeout(() => {
          loadImpactData(result.public_id)
        }, 2000)
      } else {
        throw new Error(result.error || 'Publishing failed')
      }

    } catch (error) {
      console.error('Failed to publish to AI search engines:', error)
      setError('Failed to publish: ' + error.message)
      setPublishingStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  const getBusinessName = () => {
    return businessData?.name || 'Selected Business'
  }

  const getIndustryCategory = () => {
    return businessData?.industry_category || 'Business Services'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Search Engine Impact</h2>
        <p className="text-gray-600">Push your business into AI search results across ChatGPT, Claude, Perplexity, and more</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Publishing Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Publish to AI Search Engines</span>
          </CardTitle>
          <CardDescription>
            Make {getBusinessName()} discoverable in AI search results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Business: {getBusinessName()}</div>
              <div className="text-sm text-gray-500">Industry: {getIndustryCategory()}</div>
            </div>
            <Badge variant={publishingStatus === 'published' ? 'default' : 'secondary'}>
              {publishingStatus === 'published' ? 'Published' : 
               publishingStatus === 'publishing' ? 'Publishing...' : 'Ready to Publish'}
            </Badge>
          </div>

          {publishingStatus === 'idle' && (
            <Button 
              onClick={handlePublishToAISearch}
              disabled={loading || !businessData}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Publish to AI Search Engines
            </Button>
          )}

          {publishingStatus === 'publishing' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm">Publishing to AI search engines...</span>
              </div>
              <Progress value={65} className="w-full" />
            </div>
          )}

          {publishingStatus === 'published' && publishResults && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Successfully published to AI search engines!</span>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="text-sm">
                  <div><strong>Public URL:</strong> <a href={publishResults.public_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{publishResults.public_url}</a></div>
                  <div><strong>SEO Score:</strong> {publishResults.seo_score}/100</div>
                  <div><strong>Estimated Impact:</strong> {publishResults.ai_search_impact?.estimated_ai_mentions}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publishing Status */}
      {publishResults?.publishing_results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Publishing Status</span>
            </CardTitle>
            <CardDescription>Track where your business has been published</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <PublishingStatus 
              platform="Google Search" 
              status={publishResults.publishing_results.google_indexing?.status || 'pending'}
              url={publishResults.public_url}
            />
            <PublishingStatus 
              platform="Bing Search" 
              status={publishResults.publishing_results.bing_indexing?.status || 'pending'}
              url={publishResults.public_url}
            />
            <PublishingStatus 
              platform="LinkedIn" 
              status={publishResults.publishing_results.linkedin_post?.status || 'pending'}
            />
            <PublishingStatus 
              platform="Twitter" 
              status={publishResults.publishing_results.twitter_post?.status || 'pending'}
            />
            <PublishingStatus 
              platform="Business Directories" 
              status={publishResults.publishing_results.business_directories?.status || 'pending'}
            />
            <PublishingStatus 
              platform="Knowledge Graphs" 
              status={publishResults.publishing_results.knowledge_graphs?.status || 'pending'}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Search Engine Performance */}
        {(impactData || overallStats) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>AI Search Engine Performance</span>
              </CardTitle>
              <CardDescription>How your business appears in AI search results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overallStats?.ai_search_engines && Object.entries(overallStats.ai_search_engines).map(([engine, data]) => (
                <AISearchEngineStatus
                  key={engine}
                  engine={engine.charAt(0).toUpperCase() + engine.slice(1)}
                  mentions={data.mentions}
                  avgPosition={data.avg_position}
                  isActive={true}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Impact Metrics */}
        {(impactData || overallStats) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Impact Metrics</span>
              </CardTitle>
              <CardDescription>Measure your AI search engine success</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {impactData?.ai_mentions ? 
                      Object.values(impactData.ai_mentions).reduce((a, b) => a + b, 0) : 
                      overallStats?.total_ai_mentions || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total AI Mentions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {impactData?.ranking_positions?.average_position?.toFixed(1) || 
                     overallStats?.ai_search_engines?.perplexity?.avg_position?.toFixed(1) || '3.2'}
                  </div>
                  <div className="text-sm text-gray-500">Avg Position</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {impactData?.sentiment_analysis?.positive || '85'}%
                  </div>
                  <div className="text-sm text-gray-500">Positive Sentiment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {impactData?.ranking_positions?.top_3_appearances || 
                     overallStats?.total_published || 8}
                  </div>
                  <div className="text-sm text-gray-500">Top 3 Results</div>
                </div>
              </div>

              {impactData?.search_queries && (
                <div>
                  <div className="font-medium text-sm mb-2">Target Queries:</div>
                  <div className="space-y-1">
                    {impactData.search_queries.map((query, index) => (
                      <div key={index} className="text-sm bg-gray-50 px-2 py-1 rounded">
                        "{query}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Overall Statistics */}
      {overallStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Platform Statistics</span>
            </CardTitle>
            <CardDescription>Overall AI search engine optimization performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{overallStats.total_published}</div>
                <div className="text-sm text-gray-500">Businesses Published</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{overallStats.total_ai_mentions}</div>
                <div className="text-sm text-gray-500">Total AI Mentions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{overallStats.average_ai_rating}</div>
                <div className="text-sm text-gray-500">Average AI Rating</div>
              </div>
            </div>

            {overallStats.top_performing_businesses && (
              <div className="mt-6">
                <div className="font-medium text-sm mb-3">Top Performing Businesses:</div>
                <div className="space-y-2">
                  {overallStats.top_performing_businesses.map((business, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="font-medium text-sm">{business.name}</div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{business.mentions} mentions</Badge>
                        <Badge variant="default">{business.rating}★</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

