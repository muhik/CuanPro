'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Calculator, TrendingUp, Package, DollarSign, Upload, Download, BarChart3, Settings, Moon, Sun } from 'lucide-react'
import { HPPForm } from '@/components/hpp-form'
import { ProjectionChart } from '@/components/projection-chart'
import { InventoryTable } from '@/components/inventory-table'
import { SalesForm } from '@/components/sales/SalesForm'
import { RecentTransactions } from '@/components/sales/RecentTransactions'
import { CompetitorAnalysis } from '@/components/competitor-analysis'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { useTheme } from 'next-themes'
import { useToast } from '@/hooks/use-toast'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    avgHpp: 0,
    monthlyRevenue: 0,
    avgMargin: 0
  })

  const [recentProducts, setRecentProducts] = useState<{ id: string; name: string; price: number; createdAt: string }[]>([])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalProducts: data.totalProducts || 0,
          avgHpp: data.avgHpp || 0,
          monthlyRevenue: data.monthlyRevenue || 0,
          avgMargin: data.avgMargin || 0
        })
      } else {
        console.error('Failed to fetch stats:', res.statusText)
      }

      const recentRes = await fetch('/api/products/recent')
      const recentData = await recentRes.json()
      if (Array.isArray(recentData)) {
        setRecentProducts(recentData)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchStats()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatCompactCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(amount)
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/products/export')
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export Successful",
        description: "Product data has been downloaded.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export products. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Import failed')

      toast({
        title: "Import Successful",
        description: `Successfully imported ${result.successCount} products. Failed: ${result.errorCount}`,
      })

      // Refresh stats and other data
      fetchStats()

    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Could not import products.",
        variant: "destructive"
      })
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CuanPro</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">HPP Calculator & Business Analytics</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Total Products</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Avg HPP</p>
                  <p className="text-3xl font-bold">{formatCompactCurrency(stats.avgHpp)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Monthly Revenue</p>
                  <p className="text-3xl font-bold">{formatCompactCurrency(stats.monthlyRevenue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Profit Margin</p>
                  <p className="text-3xl font-bold">{Math.round(stats.avgMargin * 100)}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="hpp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="hpp">HPP Calculator</TabsTrigger>
            <TabsTrigger value="sales">Sales Input</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="hpp" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <HPPForm />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Import/Export data produk</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".csv"
                    />
                    <Button className="w-full" variant="outline" onClick={handleImportClick}>
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV/Excel
                    </Button>
                    <div className="text-center">
                      <a href="/api/products/template" className="text-xs text-muted-foreground hover:underline">
                        Download Template CSV
                      </a>
                    </div>
                    <Button className="w-full" variant="outline" onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Products
                    </Button>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Recent Products</Label>
                      <div className="space-y-2">
                        {recentProducts.length === 0 ? (
                          <div className="text-sm text-slate-500 text-center py-2">No products yet</div>
                        ) : (
                          recentProducts.map((product) => (
                            <div key={product.id} className="flex flex-col p-2 bg-slate-50 dark:bg-slate-800 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{product.name}</span>
                                <Badge variant="secondary">{formatCompactCurrency(product.price)}</Badge>
                              </div>
                              <span className="text-xs text-slate-500 mt-1">
                                {new Date(product.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesForm onSuccess={fetchStats} />

              <RecentTransactions refreshTrigger={stats.monthlyRevenue} />
            </div>
          </TabsContent>

          <TabsContent value="projections">
            <ProjectionChart />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryTable />
          </TabsContent>

          <TabsContent value="competitors">
            <CompetitorAnalysis />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}