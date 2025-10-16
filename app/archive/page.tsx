'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import Image from 'next/image'
import { getFighterImageUrl } from '@/lib/fighter-images'

interface ArchivedDialectic {
  id: string
  thesis: string
  created_at: string
  archived_at: string
  fighter1: {
    id: string
    name: string
    fighter_name: string
  }
  fighter2: {
    id: string
    name: string
    fighter_name: string
  }
  synthesis_claim: string | null
  synthesis_count: number
}

interface ArchiveResponse {
  dialectics: ArchivedDialectic[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ArchivePage() {
  const router = useRouter()
  const [dialectics, setDialectics] = useState<ArchivedDialectic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fighterFilter, setFighterFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchDialectics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })

      if (search) params.append('search', search)
      if (fighterFilter) params.append('fighter', fighterFilter)

      const response = await fetch(`/api/archive?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ArchiveResponse = await response.json()

      // Ensure data exists and has the expected structure
      const dialecticsArray = Array.isArray(data?.dialectics) ? data.dialectics : []
      const paginationData = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }

      setDialectics(dialecticsArray)
      setPagination(paginationData)
    } catch (error) {
      console.error('Error fetching archived dialectics:', error)
      setDialectics([])
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDialectics()
  }, [currentPage, search, fighterFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchDialectics()
  }

  const clearFilters = () => {
    setSearch('')
    setFighterFilter('')
    setCurrentPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => router.push('/')}
            className="btn btn-ghost text-sm px-4 py-2 flex items-center gap-2 hover:text-primary transition-colors mb-4"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>

          <h1 className="text-3xl md:text-5xl font-bold mb-2 neon-header-pink">
            🏛️ SYNTHESIS ARCHIVE 🏛️
          </h1>
          <p className="text-muted-foreground">
            Explore archived dialectical exchanges and their emergent insights
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 bg-card/90 border-2 border-primary/30">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search thesis statements and synthesis claims..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Fighter</label>
              <input
                type="text"
                value={fighterFilter}
                onChange={(e) => setFighterFilter(e.target.value)}
                placeholder="Enter fighter name..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary px-6 py-2 hover:scale-105 transition-transform"
            >
              🔍 Search
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="btn btn-outline px-6 py-2 hover:bg-primary/10 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading archived dialectics...</p>
        </div>
      ) : Array.isArray(dialectics) && dialectics.length > 0 ? (
        <>
          {/* Results Info */}
          <div className="text-center text-sm text-muted-foreground">
            Showing {dialectics?.length || 0} of {pagination?.total || 0} archived dialectics
          </div>

          {/* Archive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dialectics?.map((dialectic) => (
              <Card
                key={dialectic?.id || 'unknown'}
                className="group relative p-6 bg-gradient-to-br from-card/90 to-background/50 border-2 border-primary/30 hover:border-primary/60 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                onClick={() => router.push(`/arena/${dialectic?.id}`)}
              >
                {/* Synthesis Claim Header */}
                {dialectic?.synthesis_claim && (
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="text-xs text-primary font-bold mb-2 uppercase tracking-wider">
                      💎 Core Insight
                    </div>
                    <blockquote className="text-sm font-medium italic leading-relaxed">
                      &ldquo;{dialectic?.synthesis_claim}&rdquo;
                    </blockquote>
                  </div>
                )}

                {/* Fighters - Vertical Mobile-Style Layout */}
                <div className="flex flex-col items-center gap-2 mb-4">
                  {/* Fighter 1 */}
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400 flex-shrink-0 bg-muted">
                      {dialectic?.fighter1?.name && getFighterImageUrl(dialectic.fighter1.name) ? (
                        <Image
                          src={getFighterImageUrl(dialectic.fighter1.name)!}
                          alt={dialectic.fighter1.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                          {dialectic?.fighter1?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-blue-400">
                        {dialectic?.fighter1?.name || 'Unknown Fighter'}
                      </div>
                      <div className="text-xs text-blue-300/70">
                        {dialectic?.fighter1?.fighter_name || 'Fighter'}
                      </div>
                    </div>
                  </div>

                  {/* VS Badge */}
                  <div className="text-xs text-primary font-bold py-1" style={{fontFamily: '"Press Start 2P", cursive'}}>
                    VS
                  </div>

                  {/* Fighter 2 */}
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-400 flex-shrink-0 bg-muted">
                      {dialectic?.fighter2?.name && getFighterImageUrl(dialectic.fighter2.name) ? (
                        <Image
                          src={getFighterImageUrl(dialectic.fighter2.name)!}
                          alt={dialectic.fighter2.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                          {dialectic?.fighter2?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-red-400">
                        {dialectic?.fighter2?.name || 'Unknown Fighter'}
                      </div>
                      <div className="text-xs text-red-300/70">
                        {dialectic?.fighter2?.fighter_name || 'Fighter'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thesis */}
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Original Thesis
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3">
                    &ldquo;{dialectic?.thesis || 'No thesis available'}&rdquo;
                  </p>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Archived: {dialectic?.archived_at ? new Date(dialectic.archived_at).toLocaleDateString() : 'Unknown date'}
                  </div>
                  <div>
                    {dialectic?.synthesis_count || 0} syntheses generated
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {(pagination?.totalPages || 0) > 1 && (
            <div className="flex justify-center space-x-2 pt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors"
              >
                Previous
              </button>

              <span className="px-4 py-2">
                Page {currentPage} of {pagination?.totalPages || 0}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(pagination?.totalPages || 0, currentPage + 1))}
                disabled={currentPage === (pagination?.totalPages || 0)}
                className="px-4 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold mb-2">No Archived Dialectics Found</h3>
          <p className="text-muted-foreground mb-6">
            {search || fighterFilter
              ? 'No archived dialectics match your search criteria.'
              : 'No dialectics have been archived yet. Complete some dialectical exchanges first!'}
          </p>
          {(search || fighterFilter) && (
            <button
              onClick={clearFilters}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}