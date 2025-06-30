import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Brain, Zap, Target, CreditCard, Settings, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import BusinessList from './components/BusinessList.jsx'
import LiveChat from './components/LiveChat.jsx'
import AudienceSelector from './components/AudienceSelector.jsx'
import { config as API_CONFIG } from './config.js'
import mockAPI from './mockApi.js'
import './App.css'

// Auth Context
const AuthContext = React.createContext()

// API Service
class APIService {
  constructor() {
    this.baseURL = API_CONFIG.API_BASE_URL
    this.token = localStorage.getItem('auth_token')
    this.mockMode = API_CONFIG.MOCK_MODE || false // Use real API
  }

  async request(endpoint, options = {}) {
    // Use mock API if in mock mode
    if (this.mockMode) {
      return this.handleMockRequest(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed')
      }
      
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async handleMockRequest(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    try {
      switch (endpoint) {
        case '/api/auth/register':
          return await mockAPI.register(body.email, body.password);
        case '/api/auth/login':
          return await mockAPI.login(body.email, body.password);
        case '/api/auth/profile':
          return await mockAPI.getProfile();
        case '/api/businesses':
          if (method === 'POST') {
            return await mockAPI.createBusinessType(body);
          }
          return await mockAPI.getBusinessTypes();
        case '/api/audiences':
          return await mockAPI.getTargetAudiences();
        case '/api/audiences/manual':
          return await mockAPI.createManualAudience(body);
        case '/api/payments/packages':
          return await mockAPI.getCreditPackages();
        case '/api/payments/balance':
          return await mockAPI.getCreditBalance();
        default:
          throw new Error(`Mock endpoint not implemented: ${endpoint}`);
      }
    } catch (error) {
      throw new Error(error.message || 'Mock API request failed');
    }
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Auth endpoints
  async register(email, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: { email, password },
    })
  }

  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  }

  async getProfile() {
    return this.request('/api/auth/profile')
  }

  // Business endpoints
  async getBusinesses() {
    return this.request('/api/businesses')
  }

  async createBusiness(businessData) {
    return this.request('/api/businesses', {
      method: 'POST',
      body: businessData,
    })
  }

  // Audience endpoints
  async getAudiences() {
    return this.request('/api/audiences')
  }

  async createAudience(audienceData) {
    return this.request('/api/audiences', {
      method: 'POST',
      body: audienceData,
    })
  }

  async createManualAudience(manualDescription, name) {
    return this.request('/api/audiences/manual', {
      method: 'POST',
      body: { manual_description: manualDescription, name },
    })
  }

  // AI Session endpoints
  async createSession(sessionData) {
    return this.request('/api/sessions', {
      method: 'POST',
      body: sessionData,
    })
  }

  async getSessions() {
    return this.request('/api/sessions')
  }

  async getSession(sessionId) {
    return this.request(`/api/sessions/${sessionId}`)
  }

  async regenerateResponses(sessionId) {
    return this.request(`/api/sessions/${sessionId}/regenerate`, {
      method: 'POST'
    })
  }

  // Payment endpoints
  async getCreditPackages() {
    return this.request('/api/payments/packages')
  }

  async getCreditBalance() {
    return this.request('/api/payments/balance')
  }

  async initiatePurchase(packageId) {
    return this.request('/api/payments/purchase', {
      method: 'POST',
      body: { package_id: packageId },
    })
  }
}

const api = new APIService()

// Auth Provider Component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      api.setToken(token)
      api.getProfile()
        .then(data => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('auth_token')
          api.setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await api.login(email, password)
    api.setToken(data.access_token)
    setUser(data.user)
    return data
  }

  const register = async (email, password) => {
    const data = await api.register(email, password)
    api.setToken(data.access_token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    api.setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Login Component
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = React.useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl">Cognitive Persuasion Engine</CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard Header Component
function DashboardHeader({ user, onLogout }) {
  const [creditBalance, setCreditBalance] = useState(0)

  useEffect(() => {
    api.getCreditBalance()
      .then(data => setCreditBalance(data.credit_balance))
      .catch(console.error)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-900">Cognitive Persuasion Engine</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            <CreditCard className="h-4 w-4 mr-1" />
            ${creditBalance.toFixed(2)} Credits
          </Badge>
          <span className="text-sm text-gray-600">{user.email}</span>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

// Business Management Component
function BusinessManagement({ onComplete }) {
  const [businesses, setBusinesses] = useState([])
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    description: '',
    industry_category: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    try {
      const data = await api.getBusinesses()
      setBusinesses(data.business_types || [])
    } catch (error) {
      console.error('Failed to load businesses:', error)
    }
  }

  const handleCreateBusiness = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.createBusiness(newBusiness)
      setNewBusiness({ name: '', description: '', industry_category: '' })
      await loadBusinesses()
      if (onComplete) onComplete() // Notify parent component
    } catch (error) {
      console.error('Failed to create business:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Types</h2>
        <p className="text-gray-600">Manage your business types for targeted AI responses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Business Type</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBusiness} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={newBusiness.name}
                  onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
                  placeholder="e.g., Premium Roofing Services"
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry Category</Label>
                <Input
                  id="industry"
                  value={newBusiness.industry_category}
                  onChange={(e) => setNewBusiness({...newBusiness, industry_category: e.target.value})}
                  placeholder="e.g., Construction & Home Services"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newBusiness.description}
                onChange={(e) => setNewBusiness({...newBusiness, description: e.target.value})}
                placeholder="Brief description of your business"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Add Business Type'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <Card key={business.business_type_id}>
            <CardHeader>
              <CardTitle className="text-lg">{business.name}</CardTitle>
              {business.is_predefined && (
                <Badge variant="secondary" className="w-fit">Predefined</Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{business.description}</p>
              {business.industry_category && (
                <Badge variant="outline">{business.industry_category}</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Audience Management Component
function AudienceManagement({ onComplete }) {
  const [audiences, setAudiences] = useState([])
  const [newAudience, setNewAudience] = useState({
    name: '',
    description: '',
    demographics: {},
    psychographics: {}
  })
  const [manualAudience, setManualAudience] = useState({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAudiences()
  }, [])

  const loadAudiences = async () => {
    try {
      const data = await api.getAudiences()
      setAudiences(data.target_audiences || [])
    } catch (error) {
      console.error('Failed to load audiences:', error)
    }
  }

  const handleCreateAudience = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.createAudience(newAudience)
      setNewAudience({ name: '', description: '', demographics: {}, psychographics: {} })
      await loadAudiences()
      if (onComplete) onComplete() // Notify parent component
    } catch (error) {
      console.error('Failed to create audience:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateManualAudience = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.createManualAudience(manualAudience.description, manualAudience.name)
      setManualAudience({ name: '', description: '' })
      await loadAudiences()
      if (onComplete) onComplete() // Notify parent component
    } catch (error) {
      console.error('Failed to create manual audience:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Target Audiences</h2>
        <p className="text-gray-600">Define your target audiences for personalized messaging</p>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList>
          <TabsTrigger value="manual">Manual Input</TabsTrigger>
          <TabsTrigger value="structured">Structured Input</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Create Audience (Manual Description)</CardTitle>
              <CardDescription>
                Describe your target audience in natural language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateManualAudience} className="space-y-4">
                <div>
                  <Label htmlFor="manual-name">Audience Name (Optional)</Label>
                  <Input
                    id="manual-name"
                    value={manualAudience.name}
                    onChange={(e) => setManualAudience({...manualAudience, name: e.target.value})}
                    placeholder="e.g., Tech-Savvy Homeowners"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-description">Audience Description</Label>
                  <textarea
                    id="manual-description"
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={4}
                    value={manualAudience.description}
                    onChange={(e) => setManualAudience({...manualAudience, description: e.target.value})}
                    placeholder="Describe your target audience: demographics, interests, pain points, decision factors, etc."
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Audience'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structured">
          <Card>
            <CardHeader>
              <CardTitle>Create Audience (Structured)</CardTitle>
              <CardDescription>
                Define your audience with specific demographic and psychographic data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAudience} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audience-name">Audience Name</Label>
                    <Input
                      id="audience-name"
                      value={newAudience.name}
                      onChange={(e) => setNewAudience({...newAudience, name: e.target.value})}
                      placeholder="e.g., Young Professionals"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="audience-description">Description</Label>
                    <Input
                      id="audience-description"
                      value={newAudience.description}
                      onChange={(e) => setNewAudience({...newAudience, description: e.target.value})}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Audience'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {audiences.map((audience) => (
          <Card key={audience.audience_id}>
            <CardHeader>
              <CardTitle className="text-lg">{audience.name}</CardTitle>
              {audience.is_predefined && (
                <Badge variant="secondary" className="w-fit">Predefined</Badge>
              )}
              {audience.psychographics?.manual_description && (
                <Badge variant="outline" className="w-fit">Manual Input</Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{audience.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// AI Session Component
function AISessionManager() {
  const [businesses, setBusinesses] = useState([])
  const [audiences, setAudiences] = useState([])
  const [sessions, setSessions] = useState([])
  const [newSession, setNewSession] = useState({
    business_type_id: '',
    audience_id: '',
    mission_objective: ''
  })
  const [loading, setLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [businessData, audienceData, sessionData] = await Promise.all([
        api.getBusinesses(),
        api.getAudiences(),
        api.getSessions()
      ])
      setBusinesses(businessData.businesses)
      setAudiences(audienceData.audiences)
      setSessions(sessionData.sessions)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleCreateSession = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await api.createSession(newSession)
      setNewSession({ business_type_id: '', audience_id: '', mission_objective: '' })
      
      // Show the results immediately
      setSelectedSession(result.session)
      setShowResults(true)
      
      // Reload sessions list
      loadData()
      
    } catch (error) {
      console.error('Failed to create session:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionClick = async (session) => {
    try {
      // Get full session details if not already loaded
      if (!session.ai_responses) {
        const fullSession = await api.getSession(session.session_id)
        setSelectedSession(fullSession.session)
      } else {
        setSelectedSession(session)
      }
      setShowResults(true)
    } catch (error) {
      console.error('Failed to load session details:', error)
    }
  }

  const handleRegenerate = async () => {
    if (!selectedSession) return
    
    setLoading(true)
    try {
      const result = await api.regenerateResponses(selectedSession.session_id)
      setSelectedSession({
        ...selectedSession,
        ai_responses: result.ai_responses,
        credits_consumed: selectedSession.credits_consumed + result.credits_consumed
      })
      loadData() // Refresh the sessions list
    } catch (error) {
      console.error('Failed to regenerate responses:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Persuasion Sessions</h2>
        <p className="text-gray-600">Create AI-powered persuasion campaigns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Launch New Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business-select">Business Type</Label>
                <select
                  id="business-select"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newSession.business_type_id}
                  onChange={(e) => setNewSession({...newSession, business_type_id: e.target.value})}
                  required
                >
                  <option value="">Select Business Type</option>
                  {businesses.map((business) => (
                    <option key={business.business_type_id} value={business.business_type_id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="audience-select">Target Audience</Label>
                <select
                  id="audience-select"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newSession.audience_id}
                  onChange={(e) => setNewSession({...newSession, audience_id: e.target.value})}
                  required
                >
                  <option value="">Select Target Audience</option>
                  {audiences.map((audience) => (
                    <option key={audience.audience_id} value={audience.audience_id}>
                      {audience.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="mission-objective">Mission Objective</Label>
              <textarea
                id="mission-objective"
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={3}
                value={newSession.mission_objective}
                onChange={(e) => setNewSession({...newSession, mission_objective: e.target.value})}
                placeholder="e.g., Perfect roofing team services for residential customers"
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Session...' : 'Launch AI Session'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Sessions</h3>
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No sessions created yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sessions.slice(0, 6).map((session) => (
              <SessionCard
                key={session.session_id}
                session={session}
                onClick={() => handleSessionClick(session)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results Modal */}
      <SessionResultsModal
        session={selectedSession}
        isOpen={showResults}
        onClose={() => {
          setShowResults(false)
          setSelectedSession(null)
        }}
        onRegenerate={handleRegenerate}
      />
    </div>
  )
}

// Credit Management Component
function CreditManagement() {
  const [packages, setPackages] = useState({})
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCreditData()
  }, [])

  const loadCreditData = async () => {
    try {
      const [packageData, balanceData] = await Promise.all([
        api.getCreditPackages(),
        api.getCreditBalance()
      ])
      setPackages(packageData.packages)
      setBalance(balanceData.credit_balance)
    } catch (error) {
      console.error('Failed to load credit data:', error)
    }
  }

  const handlePurchase = async (packageId) => {
    setLoading(true)
    try {
      const result = await api.initiatePurchase(packageId)
      if (result.approval_url) {
        window.open(result.approval_url, '_blank')
      } else {
        alert('PayPal integration requires valid API credentials')
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Credit Management</h2>
        <p className="text-gray-600">Purchase credits for AI sessions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ${balance.toFixed(2)} Credits
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(packages).map(([packageId, packageInfo]) => (
          <Card key={packageId} className="relative">
            <CardHeader>
              <CardTitle>{packageInfo.name}</CardTitle>
              <CardDescription>{packageInfo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">${packageInfo.price.toFixed(2)}</div>
                <div className="text-sm text-gray-600">
                  {packageInfo.credits} credits (${packageInfo.price_per_credit.toFixed(2)}/credit)
                </div>
                {packageInfo.savings_vs_starter > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Save {packageInfo.savings_vs_starter}%
                  </Badge>
                )}
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => handlePurchase(packageId)}
                disabled={loading}
              >
                Purchase
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Main Dashboard Component
function Dashboard() {
  // Mock user for bypassing authentication
  const user = { email: 'demo@example.com', user_id: 'demo-user' }
  const logout = () => {} // Empty logout function
  
  const [activeTab, setActiveTab] = useState('businesses')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [selectedAudience, setSelectedAudience] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [businesses, setBusinesses] = useState([])
  const [audiences, setAudiences] = useState([])

  useEffect(() => {
    loadBusinesses()
    loadAudiences()
  }, [])

  const loadBusinesses = async () => {
    try {
      const data = await api.getBusinesses()
      setBusinesses(data.business_types || [])
    } catch (error) {
      console.error('Failed to load businesses:', error)
    }
  }

  const loadAudiences = async () => {
    try {
      const data = await api.getAudiences()
      setAudiences(data.target_audiences || [])
    } catch (error) {
      console.error('Failed to load audiences:', error)
    }
  }

  const handleBusinessClick = (business) => {
    setSelectedBusiness(business)
    setActiveTab('chat-setup')
  }

  const handleStartChat = (audience) => {
    setSelectedAudience(audience)
    setShowChat(true)
  }

  const handleBackToBusinesses = () => {
    setSelectedBusiness(null)
    setSelectedAudience(null)
    setShowChat(false)
    setActiveTab('businesses')
  }

  const handleCreateBusiness = () => {
    setActiveTab('business-form')
  }

  if (showChat && selectedBusiness && selectedAudience) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LiveChat 
          business={selectedBusiness}
          audience={selectedAudience}
          onBack={handleBackToBusinesses}
          currentUser={user}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={logout} />
      
      <div className="flex">
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="space-y-2">
            <Button
              variant={activeTab === 'businesses' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('businesses')}
            >
              <Settings className="h-4 w-4 mr-2" />
              My Businesses
            </Button>
            <Button
              variant={activeTab === 'chat-setup' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('chat-setup')}
              disabled={!selectedBusiness}
            >
              <Target className="h-4 w-4 mr-2" />
              Select Audience
            </Button>
            <Button
              variant={activeTab === 'business-form' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('business-form')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Add Business
            </Button>
            <Button
              variant={activeTab === 'audience-form' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('audience-form')}
            >
              <Target className="h-4 w-4 mr-2" />
              Add Audience
            </Button>
            <Button
              variant={activeTab === 'credits' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('credits')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Credits
            </Button>
          </div>
        </nav>

        <main className="flex-1 p-6">
          {activeTab === 'businesses' && (
            <BusinessList 
              businesses={businesses}
              onBusinessClick={handleBusinessClick}
              onCreateBusiness={handleCreateBusiness}
              currentUser={user}
            />
          )}
          {activeTab === 'chat-setup' && selectedBusiness && (
            <AudienceSelector 
              business={selectedBusiness}
              audiences={audiences}
              onAudienceSelect={handleStartChat}
              onBack={handleBackToBusinesses}
            />
          )}
          {activeTab === 'business-form' && <BusinessManagement onComplete={loadBusinesses} />}
          {activeTab === 'audience-form' && <AudienceManagement onComplete={loadAudiences} />}
          {activeTab === 'credits' && <CreditManagement />}
        </main>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthContext.Consumer>
          {({ user, loading }) => {
            if (loading) {
              return (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
                    <p>Loading...</p>
                  </div>
                </div>
              )
            }

            return (
              <Routes>
                <Route 
                  path="/" 
                  element={<Dashboard />} 
                />
                <Route 
                  path="/dashboard" 
                  element={<Dashboard />} 
                />
                <Route 
                  path="/login" 
                  element={<Navigate to="/dashboard" />} 
                />
              </Routes>
            )
          }}
        </AuthContext.Consumer>
      </Router>
    </AuthProvider>
  )
}

export default App

