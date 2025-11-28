'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Search,
  Download,
  Upload,
  RefreshCw,
  Plus
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  unit: string
  supplier: string
  lastUpdated: string
  reorderAlert: boolean
  trend: 'up' | 'down' | 'stable'
  monthlyUsage: number
  leadTime: number
}

export function InventoryTable() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAlertsOnly, setShowAlertsOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchInventory = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/inventory', { cache: 'no-store' })
      const data = await res.json()
      if (Array.isArray(data)) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: item.itemName,
          category: item.product?.category || 'Uncategorized',
          currentStock: item.currentStock,
          minStock: item.minStock,
          maxStock: 100, // Default
          unitCost: item.unitCost,
          unit: 'unit', // Default
          supplier: 'Internal', // Default
          lastUpdated: new Date(item.updatedAt).toISOString().split('T')[0],
          reorderAlert: item.reorderAlert,
          trend: 'stable' as 'up' | 'down' | 'stable', // Default
          monthlyUsage: 0, // Default
          leadTime: 1 // Default
        }))
        setInventoryItems(mapped)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const categories = ['all', ...Array.from(new Set(inventoryItems.map(item => item.category)))]

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesAlerts = !showAlertsOnly || item.reorderAlert

    return matchesSearch && matchesCategory && matchesAlerts
  })

  const getStockStatus = (item: InventoryItem) => {
    const stockPercentage = (item.currentStock / item.maxStock) * 100

    if (item.currentStock <= item.minStock) {
      return { status: 'critical', color: 'bg-red-500', text: 'Critical' }
    } else if (stockPercentage < 30) {
      return { status: 'low', color: 'bg-yellow-500', text: 'Low' }
    } else if (stockPercentage < 70) {
      return { status: 'normal', color: 'bg-blue-500', text: 'Normal' }
    } else {
      return { status: 'high', color: 'bg-green-500', text: 'High' }
    }
  }

  const calculateDaysUntilStockout = (item: InventoryItem): number => {
    if (item.monthlyUsage === 0) return 999
    const dailyUsage = item.monthlyUsage / 30
    return Math.floor(item.currentStock / dailyUsage)
  }

  const calculateReorderQuantity = (item: InventoryItem): number => {
    const dailyUsage = item.monthlyUsage / 30
    const safetyStock = dailyUsage * item.leadTime
    const reorderPoint = item.minStock + safetyStock
    return Math.max(Math.ceil(reorderPoint - item.currentStock), 0)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const toggleReorderAlert = (itemId: string) => {
    setInventoryItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, reorderAlert: !item.reorderAlert }
          : item
      )
    )
  }

  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
  const criticalItems = inventoryItems.filter(item => item.currentStock <= item.minStock).length
  const reorderAlerts = inventoryItems.filter(item => item.reorderAlert).length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Items</p>
                <p className="text-2xl font-bold">{inventoryItems.length}</p>
                <p className="text-sm text-slate-500">products</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</p>
                <p className="text-sm text-slate-500">inventory</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Critical Stock</p>
                <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
                <p className="text-sm text-slate-500">need reorder</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Alerts Active</p>
                <p className="text-2xl font-bold text-yellow-600">{reorderAlerts}</p>
                <p className="text-sm text-slate-500">notifications</p>
              </div>
              <Bell className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Monitor and manage your inventory levels and reorder points
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search inventory items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <Button
                variant={showAlertsOnly ? "default" : "outline"}
                onClick={() => setShowAlertsOnly(!showAlertsOnly)}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Alerts Only
              </Button>

              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import
              </Button>

              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>

              <Button variant="outline" className="flex items-center gap-2" onClick={fetchInventory}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min/Max Stock</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Days Until Stockout</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No inventory items found. Add a product to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item)
                    const daysUntilStockout = calculateDaysUntilStockout(item)
                    const reorderQuantity = calculateReorderQuantity(item)

                    return (
                      <TableRow key={item.id} className={item.reorderAlert ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-sm text-slate-500">{item.supplier}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <div className="font-semibold">
                              {item.currentStock} {item.unit}
                            </div>
                            <div className="text-sm text-slate-500">
                              {formatCurrency(item.currentStock * item.unitCost)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Min: {item.minStock} {item.unit}</div>
                            <div>Max: {item.maxStock} {item.unit}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitCost)}/{item.unit}
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <div className={`font-semibold ${daysUntilStockout < 7 ? 'text-red-600' : daysUntilStockout < 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {daysUntilStockout > 365 ? '> 1 year' : `${daysUntilStockout} days`}
                            </div>
                            {reorderQuantity > 0 && (
                              <div className="text-xs text-slate-500">
                                Order: {reorderQuantity} {item.unit}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                            {item.trend === 'stable' && <div className="w-4 h-4 bg-blue-500 rounded-full" />}
                            <span className="text-sm capitalize">{item.trend}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${stockStatus.color}`}></div>
                            <span className="text-sm">{stockStatus.text}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleReorderAlert(item.id)}
                              className={item.reorderAlert ? 'text-red-600' : 'text-slate-400'}
                            >
                              {item.reorderAlert ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {criticalItems > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Critical Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryItems
                .filter(item => item.currentStock <= item.minStock)
                .map(item => {
                  const reorderQuantity = calculateReorderQuantity(item)
                  const daysUntilStockout = calculateDaysUntilStockout(item)

                  return (
                    <Alert key={item.id} className="border-red-200 bg-red-50 dark:bg-red-900/10">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>{item.name}</strong> is critically low at {item.currentStock} {item.unit}.
                            <div className="text-sm mt-1">
                              Estimated stockout in {daysUntilStockout > 365 ? '> 1 year' : `${daysUntilStockout} days`}.
                              Recommended reorder: {reorderQuantity} {item.unit}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="ml-4">
                            Order Now
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}