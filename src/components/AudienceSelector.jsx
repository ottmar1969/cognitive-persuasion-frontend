import React, { useState } from 'react'
import { ArrowLeft, Users, MessageSquare, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'

const AudienceSelector = ({ business, audiences, onAudienceSelect, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter audiences based on search
  const filteredAudiences = audiences.filter(audience =>
    audience.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (audience.description && audience.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (audience.manual_description && audience.manual_description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const AudienceCard = ({ audience }) => {
    const description = audience.manual_description || audience.description
    const isCustom = audience.is_custom

    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
        onClick={() => onAudienceSelect(audience)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{audience.name}</h3>
            </div>
            {isCustom && (
              <Badge variant="secondary" className="text-xs">Custom</Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {audience.created_at ? new Date(audience.created_at).toLocaleDateString() : 'Predefined'}
            </span>
            <Button size="sm" variant="outline">
              <MessageSquare className="w-3 h-3 mr-1" />
              Start Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Businesses
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Target Audience</h2>
          <p className="text-gray-600">Choose an audience for <strong>{business.name}</strong></p>
        </div>
      </div>

      {/* Business Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{business.name}</h3>
              <p className="text-sm text-gray-600">{business.description}</p>
              {business.industry_category && (
                <p className="text-xs text-gray-500 mt-1">{business.industry_category}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search audiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audiences Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Available Audiences ({filteredAudiences.length})
          </h3>
        </div>

        {filteredAudiences.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audiences found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first target audience to get started'
                }
              </p>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create New Audience
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAudiences.map((audience) => (
              <AudienceCard key={audience.audience_id} audience={audience} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6 text-center">
          <Plus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Need a specific audience?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create a custom audience tailored to your business needs
          </p>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Audience
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default AudienceSelector

