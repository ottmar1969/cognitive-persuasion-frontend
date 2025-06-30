import React, { useState, useEffect } from 'react'
import { CreditCard, Check, Zap, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'

const CreditPricing = ({ api, onPurchaseComplete }) => {
  const [packages, setPackages] = useState([])
  const [creditBalance, setCreditBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [packagesData, balanceData] = await Promise.all([
        api.getCreditPackages(),
        api.getCreditBalance()
      ])
      setPackages(packagesData.packages || [])
      setCreditBalance(balanceData.credit_balance || 0)
    } catch (error) {
      console.error('Failed to load credit data:', error)
      setError('Failed to load credit information')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (packageId) => {
    try {
      setPurchasing(packageId)
      setError('')
      
      const response = await api.initiatePurchase(packageId)
      
      // In a real implementation, this would redirect to PayPal
      // For demo purposes, we'll simulate a successful purchase
      if (response.paypal_url) {
        // Simulate PayPal redirect and return
        setTimeout(async () => {
          try {
            await api.completePurchase(response.transaction_id)
            await loadData() // Refresh data
            if (onPurchaseComplete) {
              onPurchaseComplete()
            }
          } catch (error) {
            setError('Failed to complete purchase')
          } finally {
            setPurchasing(null)
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      setError(error.message || 'Purchase failed')
      setPurchasing(null)
    }
  }

  const getPackageIcon = (packageId) => {
    switch (packageId) {
      case 'starter':
        return <Zap className="h-6 w-6" />
      case 'professional':
        return <TrendingUp className="h-6 w-6" />
      case 'enterprise':
        return <Star className="h-6 w-6" />
      case 'bulk':
        return <CreditCard className="h-6 w-6" />
      default:
        return <CreditCard className="h-6 w-6" />
    }
  }

  const getPackageColor = (packageId) => {
    switch (packageId) {
      case 'starter':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'professional':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'enterprise':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'bulk':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPopularBadge = (packageId) => {
    if (packageId === 'professional') {
      return (
        <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
          Most Popular
        </Badge>
      )
    }
    if (packageId === 'enterprise') {
      return (
        <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white">
          Best Value
        </Badge>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <span>Current Credit Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-indigo-600">
            {creditBalance} Credits
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Each AI session consumes 1-2 credits depending on complexity
          </p>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Credit Packages */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Purchase Credit Packages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${getPackageColor(pkg.id)}`}
            >
              {getPopularBadge(pkg.id)}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPackageIcon(pkg.id)}
                </div>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <CardDescription className="text-sm">
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-gray-600">
                    {pkg.credits} Credits
                  </div>
                  <div className="text-xs text-gray-500">
                    ${pkg.price_per_credit}/credit
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center space-x-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{pkg.credits} AI Sessions</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>All Agent Types</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Custom Business Types</span>
                  </div>
                  {pkg.id !== 'starter' && (
                    <div className="flex items-center justify-center space-x-1">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Priority Support</span>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing === pkg.id}
                  className="w-full"
                  variant={pkg.id === 'professional' ? 'default' : 'outline'}
                >
                  {purchasing === pkg.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Purchase Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Credit Usage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Usage Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Basic Sessions (1 Credit)</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Standard mission objectives</li>
                <li>• Predefined business types</li>
                <li>• Predefined target audiences</li>
                <li>• Basic AI responses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Advanced Sessions (1.5-2 Credits)</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Complex mission objectives (100+ characters)</li>
                <li>• Custom business types</li>
                <li>• Manual audience descriptions</li>
                <li>• Enhanced AI responses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI API Key Setup Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">AI API Key Setup</CardTitle>
          <CardDescription className="text-blue-700">
            Choose how you want to handle AI API access for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Managed Service Option */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 mb-2">
                  Recommended: Managed AI Service (Done For You)
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  We handle all AI API management for you. No setup required, no API key management, 
                  and simplified billing through our credit system.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>No API key management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Seamless integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Simplified billing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Focus on your business</span>
                  </div>
                </div>
                <Button className="mt-3 bg-green-600 hover:bg-green-700">
                  Contact Us for Managed Service
                </Button>
              </div>
            </div>
          </div>

          {/* Self-Managed Option */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Self-Managed: Bring Your Own API Key
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Use your own OpenAI API key. You'll manage billing directly with OpenAI 
                  and have full control over your API usage.
                </p>
                
                {/* Step-by-step instructions */}
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">How to Get Your OpenAI API Key:</h5>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                    <li>
                      <strong>Create an Account:</strong> Visit{' '}
                      <a 
                        href="https://openai.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://openai.com
                      </a>{' '}
                      and sign up for an account
                    </li>
                    <li>
                      <strong>Access API Section:</strong> Once logged in, navigate to the API section 
                      or your dashboard. Look for "API Keys" or "Developer Settings"
                    </li>
                    <li>
                      <strong>Generate New Key:</strong> Click "Create new secret key" and copy it immediately 
                      (you won't be able to view it again)
                    </li>
                    <li>
                      <strong>Set Up Billing:</strong> Ensure your OpenAI account has billing configured 
                      with sufficient credits or a subscription plan
                    </li>
                    <li>
                      <strong>Add to Your Account:</strong> Paste your API key in your account settings 
                      to start using AI features
                    </li>
                  </ol>
                  
                  <Alert className="mt-4">
                    <AlertDescription className="text-sm">
                      <strong>Important:</strong> Keep your API key secure and never share it. 
                      You'll be responsible for all usage charges on your OpenAI account.
                    </AlertDescription>
                  </Alert>
                  
                  <Button variant="outline" className="mt-3">
                    Add My API Key
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Quick Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-green-700 mb-2">Managed Service</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>✓ No setup required</li>
                  <li>✓ One billing source</li>
                  <li>✓ Predictable costs</li>
                  <li>✓ Full support included</li>
                  <li>✓ Automatic updates</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-700 mb-2">Self-Managed</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>✓ Direct OpenAI billing</li>
                  <li>✓ Full API control</li>
                  <li>✓ Use existing OpenAI credits</li>
                  <li>⚠ Requires setup</li>
                  <li>⚠ Separate billing management</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreditPricing

