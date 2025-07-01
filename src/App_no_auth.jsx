import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Badge } from './components/ui/badge'
import { X, Users, Building, MessageSquare, CreditCard, Phone, FileText, Zap, TrendingUp, Target, Plus } from 'lucide-react'
import AIConversationDashboard from './components/AIConversationDashboard'

// API Service with better error handling
class APIService {
  constructor() {
    this.baseURL = 'https://cognitive-persuasion-backend.onrender.com'
  }

  async request(endpoint, options = {}) {
    try {
      console.log(`API Request: ${this.baseURL}${endpoint}`, options)
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      console.log(`API Response Status: ${response.status}`)
      
      const data = await response.json()
      console.log('API Response Data:', data)

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
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
    console.log('Creating business with data:', businessData)
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
      .then(data => setCreditBalance(data.balance || data.credit_balance || 0))
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
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Cognitive Persuasion Engine</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CreditCard className="h-4 w-4" />
            <span>{creditBalance} Credits</span>
          </div>
          
          {sessionInfo && (
            <div className="text-sm text-gray-500">
              Session: {sessionInfo.session_id?.substring(0, 8) || 'browser-session'}
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={onContactClick}>
            <Phone className="h-4 w-4 mr-1" />
            Contact
          </Button>
          
          <Button variant="outline" size="sm" onClick={onLegalClick}>
            <FileText className="h-4 w-4 mr-1" />
            Legal
          </Button>
        </div>
      </div>
    </header>
  )
}

// Business List Component
function BusinessList({ businesses, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')

  const categories = ['All Categories', ...new Set(businesses.map(b => b.industry_category).filter(Boolean))]
  
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' || business.industry_category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Your Businesses</CardTitle>
            <CardDescription>Manage and interact with your business types</CardDescription>
          </div>
          <Button onClick={() => window.location.reload()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <Button variant="outline">Most Recent</Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Businesses ({filteredBusinesses.length})</h3>
          
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first business type</p>
              <Button onClick={() => window.location.reload()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Business
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBusinesses.map((business) => (
                <Card key={business.business_type_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{business.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{business.description}</p>
                        <Badge variant="secondary">{business.industry_category}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Contact Modal Component
function ContactModal({ isOpen, onClose }) {
  const [contactInfo, setContactInfo] = useState(null)

  useEffect(() => {
    if (isOpen) {
      api.getContactInfo()
        .then(data => setContactInfo(data))
        .catch(console.error)
    }
  }, [isOpen])

  if (!isOpen) return null

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
              <h3 className="font-medium text-gray-900">Contact Person</h3>
              <p className="text-gray-600">{contactInfo.name}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Company</h3>
              <p className="text-gray-600">{contactInfo.company}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">WhatsApp</h3>
              <a 
                href={`https://wa.me/${contactInfo.whatsapp?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700"
              >
                {contactInfo.whatsapp}
              </a>
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
function LegalModal({ isOpen, onClose }) {
  const [legalPages, setLegalPages] = useState([])
  const [selectedPage, setSelectedPage] = useState(null)
  const [pageContent, setPageContent] = useState(null)

  useEffect(() => {
    if (isOpen && !selectedPage) {
      api.getLegalPages()
        .then(data => setLegalPages(data.pages || []))
        .catch(console.error)
    }
  }, [isOpen, selectedPage])

  if (!isOpen) return null

  const handlePageSelect = async (slug) => {
    try {
      const data = await api.getLegalPage(slug)
      setPageContent(data)
      setSelectedPage(slug)
    } catch (error) {
      console.error('Failed to load legal page:', error)
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
                    Last updated: {pageContent.last_updated}
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

// Business Management Component with better error handling
function BusinessManagement({ onComplete }) {
  const [businesses, setBusinesses] = useState([])
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    description: '',
    industry_category: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    try {
      console.log('Loading businesses...')
      const data = await api.getBusinesses()
      console.log('Businesses loaded:', data)
      setBusinesses(data.business_types || [])
    } catch (error) {
      console.error('Failed to load businesses:', error)
      setError('Failed to load businesses: ' + error.message)
    }
  }

  const handleCreateBusiness = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      console.log('Creating business:', newBusiness)
      const result = await api.createBusiness(newBusiness)
      console.log('Business created:', result)
      
      setNewBusiness({ name: '', description: '', industry_category: '' })
      setSuccess(true)
      await loadBusinesses()
      
      if (onComplete) onComplete()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to create business:', error)
      setError('Failed to create business: ' + error.message)
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-800">Business created successfully!</div>
        </div>
      )}

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

      <BusinessList businesses={businesses} onUpdate={loadBusinesses} />
    </div>
  )
}

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState('businesses')
  const [showContactModal, setShowContactModal] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)

  const tabs = [
    { id: 'businesses', label: 'My Businesses', icon: Building, color: 'orange' },
    { id: 'select-audience', label: 'Select Audience', icon: Target, color: 'purple' },
    { id: 'add-business', label: 'Add Business', icon: Plus, color: 'teal' },
    { id: 'add-audience', label: 'Add Audience', icon: Users, color: 'pink' },
    { id: 'ai-conversations', label: 'AI Conversations', icon: MessageSquare, color: 'purple' },
    { id: 'credits', label: 'Credits', icon: CreditCard, color: 'orange' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'businesses':
      case 'add-business':
        return <BusinessManagement />
      case 'ai-conversations':
        return <AIConversationDashboard />
      case 'credits':
        return (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Credits Management</h3>
            <p className="text-gray-500">Credit system coming soon</p>
          </div>
        )
      default:
        return (
          <div className="text-center py-12">
            <div className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Coming Soon</h3>
            <p className="text-gray-500">This feature is under development</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        onContactClick={() => setShowContactModal(true)}
        onLegalClick={() => setShowLegalModal(true)}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${isActive ? `bg-${tab.color}-600 hover:bg-${tab.color}-700` : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.label}
                </Button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
      <LegalModal isOpen={showLegalModal} onClose={() => setShowLegalModal(false)} />
    </div>
  )
}

