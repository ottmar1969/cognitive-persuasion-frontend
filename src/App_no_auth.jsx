import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Brain, Zap, Target, CreditCard, Settings, Phone, FileText, Menu, X, ExternalLink } from 'lucide-react'
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
import CreditPricing from './components/CreditPricing.jsx'
import { config as API_CONFIG } from './config.js'
import './App.css'

// Browser Fingerprinting
class BrowserFingerprint {
  static generate() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      canvas: canvas.toDataURL(),
      webgl: this.getWebGLFingerprint(),
      plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      indexedDB: !!window.indexedDB,
      cpuClass: navigator.cpuClass || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    };
    
    const fingerprintString = JSON.stringify(fingerprint);
    return this.hashCode(fingerprintString);
  }
  
  static getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? 
        gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 
        'webgl-available';
    } catch (e) {
      return 'webgl-error';
    }
  }
  
  static hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

// API Service without authentication
class APIService {
  constructor() {
    this.baseURL = API_CONFIG.API_BASE_URL
    this.fingerprint = BrowserFingerprint.generate()
    this.sessionId = `${this.fingerprint}_${Date.now()}`
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': this.sessionId,
        'X-Fingerprint': this.fingerprint
      },
      ...options
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

  // Session endpoints
  async getSessionInfo() {
    return this.request('/api/session')
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

  // Payment endpoints
  async getCreditPackages() {
    return this.request('/api/payments/packages')
  }

  async getCreditBalance() {
    return this.request('/api/payments/balance')
  }

  // Contact endpoints
  async getContactInfo() {
    return this.request('/api/contact')
  }

  // Legal endpoints
  async getLegalPages() {
    return this.request('/api/legal')
  }

  async getLegalPage(slug) {
    return this.request(`/api/legal/${slug}`)
  }

  // Config endpoints
  async getAPIConfig() {
    return this.request('/api/config')
  }
}

const api = new APIService()

// Dashboard Header Component
function DashboardHeader({ onContactClick, onLegalClick }) {
  const [creditBalance, setCreditBalance] = useState(0)
  const [sessionInfo, setSessionInfo] = useState(null)

  useEffect(() => {
    // Load credit balance
    api.getCreditBalance()
      .then(data => setCreditBalance(data.balance || 0))
      .catch(console.error)
    
    // Load session info
    api.getSessionInfo()
      .then(data => setSessionInfo(data))
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
            {creditBalance} Credits
          </Badge>
          <Button variant="outline" size="sm" onClick={onContactClick}>
            <Phone className="h-4 w-4 mr-1" />
            Contact
          </Button>
          <Button variant="outline" size="sm" onClick={onLegalClick}>
            <FileText className="h-4 w-4 mr-1" />
            Legal
          </Button>
          {sessionInfo && (
            <Badge variant="outline" className="text-xs">
              Session: {sessionInfo.fingerprint ? sessionInfo.fingerprint.substring(0, 8) : 'browser'}
            </Badge>
          )}
        </div>
      </div>
    </header>
  )
}

// Contact Modal Component
function ContactModal({ onClose }) {
  const [contactInfo, setContactInfo] = useState(null)

  useEffect(() => {
    api.getContactInfo()
      .then(data => setContactInfo(data))
      .catch(console.error)
  }, [])

  const handleWhatsAppClick = () => {
    if (contactInfo?.whatsapp) {
      const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contact Information</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {contactInfo ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p className="text-gray-700">{contactInfo.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Company</Label>
              <p className="text-gray-700">{contactInfo.company}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">WhatsApp</Label>
              <div className="flex items-center space-x-2">
                <p className="text-gray-700">{contactInfo.whatsapp}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleWhatsAppClick}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading contact information...</p>
        )}
      </div>
    </div>
  )
}

// Legal Modal Component
function LegalModal({ onClose }) {
  const [selectedPage, setSelectedPage] = useState(null)
  const [pageContent, setPageContent] = useState(null)

  const legalPages = [
    { slug: 'terms', title: 'Terms of Service', description: 'Terms and conditions for using our service' },
    { slug: 'privacy', title: 'Privacy Policy', description: 'How we collect and use your information' },
    { slug: 'gdpr', title: 'GDPR Compliance', description: 'Our commitment to data protection' },
    { slug: 'cookies', title: 'Cookie Policy', description: 'How we use cookies and tracking' }
  ]

  const handlePageSelect = async (slug) => {
    try {
      const data = await api.getLegalPage(slug)
      setPageContent(data)
      setSelectedPage(slug)
    } catch (error) {
      console.error('Failed to load legal page:', error)
      // Fallback content
      setPageContent({
        title: legalPages.find(p => p.slug === slug)?.title || 'Legal Page',
        content: 'Legal content for VisitorIntel Cognitive Persuasion Engine.'
      })
      setSelectedPage(slug)
    }
  }

  const handleBack = () => {
    setSelectedPage(null)
    setPageContent(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedPage ? pageContent?.title : 'Legal Information'}
          </h2>
          <div className="flex space-x-2">
            {selectedPage && (
              <Button variant="outline" size="sm" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          {!selectedPage ? (
            <div className="grid gap-4">
              {legalPages.map((page) => (
                <Card key={page.slug} className="cursor-pointer hover:bg-gray-50" onClick={() => handlePageSelect(page.slug)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription>{page.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="prose max-w-none">
              {pageContent ? (
                <div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {pageContent.content}
                  </div>
                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    Last updated: {pageContent.last_updated || new Date().toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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
      setBusinesses(data || [])
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
      if (onComplete) onComplete()
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
                  onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                  placeholder="e.g., Premium Roofing Services"
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry-category">Industry Category</Label>
                <Input
                  id="industry-category"
                  value={newBusiness.industry_category}
                  onChange={(e) => setNewBusiness({ ...newBusiness, industry_category: e.target.value })}
                  placeholder="e.g., Construction & Home Services"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newBusiness.description}
                onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                placeholder="Brief description of your business"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Business Type'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Businesses</CardTitle>
          <CardDescription>Manage and interact with your business types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input placeholder="Search businesses..." className="flex-1" />
              <Button variant="outline">All Categories</Button>
              <Button variant="outline">Most Recent</Button>
            </div>
            
            {businesses.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses yet</h3>
                <p className="text-gray-600">Create your first business type to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="font-medium">Businesses ({businesses.length})</h4>
                <div className="grid gap-2">
                  {businesses.map((business, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h5 className="font-medium">{business.name || `Business ${index + 1}`}</h5>
                      <p className="text-sm text-gray-600">{business.description || 'No description'}</p>
                      {business.industry_category && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {business.industry_category}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Audience Management Component
function AudienceManagement({ onComplete }) {
  const [audiences, setAudiences] = useState([])
  const [newAudience, setNewAudience] = useState({
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
      setAudiences(data || [])
    } catch (error) {
      console.error('Failed to load audiences:', error)
    }
  }

  const handleCreateAudience = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.createManualAudience(newAudience.description, newAudience.name)
      setNewAudience({ name: '', description: '' })
      await loadAudiences()
      if (onComplete) onComplete()
    } catch (error) {
      console.error('Failed to create audience:', error)
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

      <Card>
        <CardHeader>
          <CardTitle>Create Audience (Manual Description)</CardTitle>
          <CardDescription>Describe your target audience in natural language</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAudience} className="space-y-4">
            <div>
              <Label htmlFor="audience-name">Audience Name (Optional)</Label>
              <Input
                id="audience-name"
                value={newAudience.name}
                onChange={(e) => setNewAudience({ ...newAudience, name: e.target.value })}
                placeholder="e.g., Tech-Savvy Homeowners"
              />
            </div>
            <div>
              <Label htmlFor="audience-description">Audience Description</Label>
              <textarea
                id="audience-description"
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md"
                value={newAudience.description}
                onChange={(e) => setNewAudience({ ...newAudience, description: e.target.value })}
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

      <Card>
        <CardHeader>
          <CardTitle>Your Audiences</CardTitle>
          <CardDescription>Manage your target audiences</CardDescription>
        </CardHeader>
        <CardContent>
          {audiences.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audiences yet</h3>
              <p className="text-gray-600">Create your first target audience to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="font-medium">Audiences ({audiences.length})</h4>
              <div className="grid gap-2">
                {audiences.map((audience, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h5 className="font-medium">{audience.name || `Audience ${index + 1}`}</h5>
                    <p className="text-sm text-gray-600">{audience.description || audience.manual_description || 'No description'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Audience Selection Page Component
function AudienceSelectionPage() {
  const [businesses, setBusinesses] = useState([])
  const [audiences, setAudiences] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [businessData, audienceData] = await Promise.all([
        api.getBusinesses(),
        api.getAudiences()
      ])
      setBusinesses(businessData || [])
      setAudiences(audienceData || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAudienceSelect = (audience) => {
    console.log('Selected audience:', audience)
    // Here you would typically navigate to the chat or next step
    alert(`Selected audience: ${audience.name || 'Unnamed Audience'} for business: ${selectedBusiness.name || 'Unnamed Business'}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (selectedBusiness) {
    return (
      <AudienceSelector
        business={selectedBusiness}
        audiences={audiences}
        onAudienceSelect={handleAudienceSelect}
        onBack={() => setSelectedBusiness(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Business</h2>
        <p className="text-gray-600">Choose a business to select target audience for</p>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-4">
              Create your first business to get started with audience selection
            </p>
            <Button variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Add Business
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((business, index) => (
            <Card 
              key={business.business_id || index} 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
              onClick={() => setSelectedBusiness(business)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Target className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{business.name || `Business ${index + 1}`}</h3>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {business.description || 'No description available'}
                </p>
                
                {business.industry_category && (
                  <Badge variant="secondary" className="text-xs mb-3">
                    {business.industry_category}
                  </Badge>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {business.created_at ? new Date(business.created_at).toLocaleDateString() : 'Recently added'}
                  </span>
                  <Button size="sm" variant="outline">
                    <Zap className="w-3 h-3 mr-1" />
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('businesses')
  const [showContactModal, setShowContactModal] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        onContactClick={() => setShowContactModal(true)}
        onLegalClick={() => setShowLegalModal(true)}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <Button
                variant={activeTab === 'businesses' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('businesses')}
              >
                <Target className="h-4 w-4 mr-2" />
                My Businesses
              </Button>
              <Button
                variant={activeTab === 'audiences' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('audiences')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Select Audience
              </Button>
              <Button
                variant={activeTab === 'add-business' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('add-business')}
              >
                <Target className="h-4 w-4 mr-2" />
                Add Business
              </Button>
              <Button
                variant={activeTab === 'add-audience' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('add-audience')}
              >
                <Zap className="h-4 w-4 mr-2" />
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
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'businesses' && <BusinessManagement />}
          {activeTab === 'audiences' && <AudienceSelectionPage />}
          {activeTab === 'add-business' && <BusinessManagement />}
          {activeTab === 'add-audience' && <AudienceManagement />}
          {activeTab === 'credits' && <CreditPricing />}
        </div>
      </div>

      {/* Modals */}
      {showContactModal && (
        <ContactModal onClose={() => setShowContactModal(false)} />
      )}
      {showLegalModal && (
        <LegalModal onClose={() => setShowLegalModal(false)} />
      )}
    </div>
  )
}

export default App

