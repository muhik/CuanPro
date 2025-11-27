'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Target,
  Zap,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface CompetitorData {
  id: string
  name: string
  productName: string
  price: number
  originalPrice: number
  discount: number
  rating: number
  reviewCount: number
  soldCount: number
  sentiment: number
  source: string
  url: string
  lastUpdated: string
  priceHistory: { date: string; price: number }[]
}

interface MarketInsight {
  type: 'opportunity' | 'threat' | 'trend'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
}

interface Product {
  id: string
  name: string
  hpp: number
  targetMargin: number
}

export function CompetitorAnalysis() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSource, setSelectedSource] = useState('all')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/inventory')
        const data = await res.json()
        if (Array.isArray(data)) {
          setProducts(data.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            hpp: item.product.hpp,
            targetMargin: item.product.targetMargin
          })))
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }
    fetchProducts()
  }, [])

  const runCompetitorAnalysis = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product first')
      return
    }

    const product = products.find(p => p.id === selectedProductId)
    if (!product) return

    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          basePrice: product.hpp * (1 + product.targetMargin)
        })
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setCompetitors(data.competitors)
      setMarketInsights(data.insights)
      toast.success('Analysis completed successfully')
    } catch (error) {
      console.error('Analysis failed:', error)
      toast.error('Failed to run analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const sources = ['all', 'Tokopedia', 'Shopee', 'GoFood', 'GrabFood']

  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competitor.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSource = selectedSource === 'all' || competitor.source === selectedSource

    return matchesSearch && matchesSource
  })

  const averagePrice = competitors.length > 0
    ? competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length
    : 0
  const averageRating = competitors.length > 0
    ? competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length
    : 0
  const averageDiscount = competitors.length > 0
    ? competitors.reduce((sum, c) => sum + c.discount, 0) / competitors.length
    : 0
  const totalReviews = competitors.reduce((sum, c) => sum + c.reviewCount, 0)

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.8) return 'text-green-600'
    if (sentiment >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSentimentText = (sentiment: number) => {
    if (sentiment >= 0.8) return 'Very Positive'
    if (sentiment >= 0.6) return 'Positive'
    if (sentiment >= 0.4) return 'Neutral'
    return 'Negative'
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Target className="w-4 h-4 text-green-500" />
      case 'threat':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-blue-500" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Product Selection Header */}
      <Card className="bg-slate-50 dark:bg-slate-900 border-dashed">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label>Select Product to Analyze</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product from inventory..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={runCompetitorAnalysis}
              disabled={isAnalyzing || !selectedProductId}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white min-w-[150px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {competitors.length > 0 ? (
        <>
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Price</p>
                    <p className="text-2xl font-bold">{formatCurrency(averagePrice)}</p>
                    <p className="text-sm text-slate-500">competitors</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Rating</p>
                    <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                    <p className="text-sm text-slate-500">out of 5</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Discount</p>
                    <p className="text-2xl font-bold">{averageDiscount.toFixed(1)}%</p>
                    <p className="text-sm text-slate-500">market rate</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Reviews</p>
                    <p className="text-2xl font-bold">{totalReviews.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">customer feedback</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Market data for {products.find(p => p.id === selectedProductId)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search competitors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
                  >
                    {sources.map(source => (
                      <option key={source} value={source}>
                        {source === 'all' ? 'All Sources' : source}
                      </option>
                    ))}
                  </select>

                  <Button variant="outline" className="flex items-center gap-2" onClick={runCompetitorAnalysis}>
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="competitors" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="competitors">Competitors</TabsTrigger>
                  <TabsTrigger value="insights">Market Insights</TabsTrigger>
                  <TabsTrigger value="trends">Price Trends</TabsTrigger>
                </TabsList>

                <TabsContent value="competitors">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Competitor</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Sold</TableHead>
                          <TableHead>Sentiment</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCompetitors.map((competitor) => (
                          <TableRow key={competitor.id}>
                            <TableCell className="font-medium">{competitor.name}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-semibold">{competitor.productName}</div>
                                <div className="text-sm text-slate-500">
                                  {competitor.soldCount.toLocaleString()} sold
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-right">
                                <div className="font-bold text-lg">{formatCurrency(competitor.price)}</div>
                                {competitor.discount > 0 && (
                                  <div className="text-sm text-slate-500 line-through">
                                    {formatCurrency(competitor.originalPrice)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {competitor.discount > 0 ? (
                                <Badge className="bg-green-100 text-green-800">
                                  -{competitor.discount}%
                                </Badge>
                              ) : (
                                <Badge variant="secondary">No discount</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-semibold">{competitor.rating}</span>
                                <span className="text-sm text-slate-500">
                                  ({competitor.reviewCount})
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-right">
                                <div className="font-semibold">{competitor.soldCount.toLocaleString()}</div>
                                <div className="text-sm text-slate-500">units</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`font-semibold ${getSentimentColor(competitor.sentiment)}`}>
                                  {getSentimentText(competitor.sentiment)}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {(competitor.sentiment * 100).toFixed(0)}%
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{competitor.source}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(competitor.url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="insights">
                  <div className="space-y-4">
                    {marketInsights.map((insight, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              {getInsightIcon(insight.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{insight.title}</h3>
                                <Badge className={getImpactColor(insight.impact)}>
                                  {insight.impact} impact
                                </Badge>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 mb-3">
                                {insight.description}
                              </p>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-500">Confidence:</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={insight.confidence * 100} className="w-20 h-2" />
                                    <span className="text-sm font-medium">
                                      {Math.round(insight.confidence * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="trends">
                  <Card>
                    <CardHeader>
                      <CardTitle>Price Trends Analysis</CardTitle>
                      <CardDescription>
                        Track competitor price movements over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {competitors.map((competitor) => (
                          <div key={competitor.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold">{competitor.name}</h3>
                                <p className="text-sm text-slate-500">{competitor.productName}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">{formatCurrency(competitor.price)}</div>
                                {competitor.discount > 0 && (
                                  <Badge className="bg-green-100 text-green-800">
                                    -{competitor.discount}%
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Price History</span>
                                <span>Last 30 days</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {competitor.priceHistory.map((point, index) => (
                                  <div key={index} className="flex-1 text-center">
                                    <div className="text-xs text-slate-500">
                                      {new Date(point.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="font-semibold text-sm">
                                      {formatCurrency(point.price)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
            <p>Select a product above and click "Run AI Analysis" to see competitor data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}