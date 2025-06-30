import React, { useState, useEffect } from 'react'
import { Building2, MessageSquare, Users, Calendar, Search, Plus, Filter, ChevronRight, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'

const BusinessList = ({ businesses = [], onBusinessClick, onCreateBusiness, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filter and sort businesses
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || business.industry_category === filterCategory
    return matchesSearch && matchesCategory
  })

  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        return (a.industry_category || '').localeCompare(b.industry_category || '')
      case 'recent':
      default:
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedBusinesses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBusinesses = sortedBusinesses.slice(startIndex, startIndex + itemsPerPage)

  // Get unique categories for filter
  const categories = [...new Set(businesses.map(b => b.industry_category).filter(Boolean))]

  const BusinessRow = ({ business, index }) => {
    const isCustom = business.is_custom
    const hasActiveSessions = business.active_sessions > 0 // Mock data for now
    
    return (
      <div 
        key={business.business_type_id}
        className="group flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => onBusinessClick(business)}
      >
        {/* Business Info */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Index Number */}
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
            {startIndex + index + 1}
          </div>
          
          {/* Business Icon */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          
          {/* Business Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">{business.name}</h3>
              {isCustom && (
                <Badge variant="secondary" className="text-xs">Custom</Badge>
              )}
              {hasActiveSessions && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                  <Activity className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{business.description}</p>
            {business.industry_category && (
              <p className="text-xs text-gray-500 mt-1">{business.industry_category}</p>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>{business.total_sessions || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{business.total_audiences || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{business.created_at ? new Date(business.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
        
        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 ml-4" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Businesses</h2>
          <p className="text-gray-600">Manage and interact with your business types</p>
        </div>
        <Button onClick={onCreateBusiness} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Business</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Business List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Businesses ({filteredBusinesses.length})</span>
            {filteredBusinesses.length > itemsPerPage && (
              <span className="text-sm font-normal text-gray-500">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBusinesses.length)} of {filteredBusinesses.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first business type'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && (
                <Button onClick={onCreateBusiness}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Business
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paginatedBusinesses.map((business, index) => (
                <BusinessRow key={business.business_type_id} business={business} index={index} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBusinesses.length)} of {filteredBusinesses.length} businesses
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessList

