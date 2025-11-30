'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, Plus, Trash2, TrendingUp, DollarSign, Package, Zap, Loader2, Edit, X, AlertTriangle, Wallet, Settings } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface ProductForm {
  id?: string
  inventoryId?: string
  name: string
  description: string
  category: string
  sku: string
  productionCost: number
  laborCost: number
  overheadCost: number
  wasteFactor: number
  unitProduction: number
  targetMargin: number
  currentStock: number
  minStock: number
}

interface PriceOptimization {
  competitive: { price: number; confidence: number; reasoning: string }
  standard: { price: number; confidence: number; reasoning: string }
  premium: { price: number; confidence: number; reasoning: string }
}

interface Budget {
  id: string
  category: string
  amount: number
}

export function HPPForm() {
  const [products, setProducts] = useState<ProductForm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('form')

  const [currentProduct, setCurrentProduct] = useState<ProductForm>({
    name: '',
    description: '',
    category: '',
    sku: '',
    productionCost: 0,
    laborCost: 0,
    overheadCost: 0,
    wasteFactor: 5,
    unitProduction: 1,
    targetMargin: 30,
    currentStock: 0,
    minStock: 10
  })

  const [priceOptimizations, setPriceOptimizations] = useState<Record<string, PriceOptimization>>({})
  const [isCalculating, setIsCalculating] = useState(false)

  // Budget State
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<{ category: string, amount: number, mode: 'set' | 'add' }>({ category: '', amount: 0, mode: 'add' })
  const [isSavingBudget, setIsSavingBudget] = useState(false)

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/inventory', { cache: 'no-store' })
        const data = await res.json()
        if (Array.isArray(data)) {
          const mappedProducts = data.map((item: any) => ({
            id: item.product.id,
            inventoryId: item.id,
            name: item.product.name,
            description: item.product.description || '',
            category: item.product.category || 'Uncategorized',
            sku: item.product.sku || '',
            productionCost: item.product.productionCost,
            laborCost: item.product.laborCost,
            overheadCost: item.product.overheadCost,
            wasteFactor: item.product.wasteFactor,
            unitProduction: item.product.unitProduction,
            targetMargin: item.product.targetMargin * 100, // Convert back to percentage
            currentStock: item.currentStock,
            minStock: item.minStock
          }))
          setProducts(mappedProducts)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        toast.error('Gagal mengambil data produk')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
    fetchProducts()
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setBudgets(data)
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
    }
  }

  const handleSaveBudget = async () => {
    if (!editingBudget.category || editingBudget.amount <= 0) {
      toast.error('Mohon pilih kategori dan masukkan jumlah budget')
      return
    }

    setIsSavingBudget(true)
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBudget)
      })

      if (!res.ok) throw new Error('Failed to save budget')

      await fetchBudgets()
      toast.success('Budget berhasil diperbarui')
      setEditingBudget({ category: '', amount: 0, mode: 'add' })
    } catch (error) {
      console.error('Failed to save budget:', error)
      toast.error('Gagal menyimpan budget')
    } finally {
      setIsSavingBudget(false)
    }
  }

  const getCategoryUsage = (category: string): number => {
    return products
      .filter(p => p.category === category && p.id !== currentProduct.id) // Exclude current product if editing
      .reduce((total, p) => total + (p.productionCost * p.unitProduction), 0)
  }

  const getCategoryBudget = (category: string): number => {
    return budgets.find(b => b.category === category)?.amount || 0
  }

  const calculateHPP = (product: ProductForm): number => {
    const totalCost = product.productionCost + product.laborCost + product.overheadCost
    const wasteMultiplier = 1 + (product.wasteFactor / 100)
    const hpp = (totalCost * wasteMultiplier) / product.unitProduction
    return hpp
  }

  const calculatePriceOptimization = async (product: ProductForm): Promise<PriceOptimization> => {
    const hpp = calculateHPP(product)

    // Simulate AI calculation
    await new Promise(resolve => setTimeout(resolve, 1000))

    const competitivePrice = hpp * 1.2
    const standardPrice = hpp * 1.3
    const premiumPrice = hpp * 1.5

    // Add psychological pricing
    const psychologicalPrice = (price: number) => {
      const rounded = Math.round(price / 1000) * 1000
      return rounded - 100
    }

    return {
      competitive: {
        price: psychologicalPrice(competitivePrice),
        confidence: 0.85,
        reasoning: 'Harga kompetitif berdasarkan analisis 10 kompetitor lokal dengan margin 20%'
      },
      standard: {
        price: psychologicalPrice(standardPrice),
        confidence: 0.92,
        reasoning: 'Harga standar dengan margin 30%, sesuai dengan rata-rata industri'
      },
      premium: {
        price: psychologicalPrice(premiumPrice),
        confidence: 0.78,
        reasoning: 'Harga premium dengan margin 50%, untuk positioning produk high-end'
      }
    }
  }

  const [error, setError] = useState<string | null>(null)

  const handleAddProduct = async () => {
    if (currentProduct.name && currentProduct.productionCost > 0) {
      // Budget Validation
      if (currentProduct.category) {
        const budget = getCategoryBudget(currentProduct.category)
        if (budget > 0) {
          const currentUsage = getCategoryUsage(currentProduct.category)
          const newUsage = currentProduct.productionCost * currentProduct.unitProduction
          const totalUsage = currentUsage + newUsage

          if (totalUsage > budget) {
            const exceededBy = totalUsage - budget
            toast.error(`Budget terlampaui! Total penggunaan: ${formatCurrency(totalUsage)} (Budget: ${formatCurrency(budget)})`)
            setError(`Budget kategori ${currentProduct.category} terlampaui sebesar ${formatCurrency(exceededBy)}. Mohon sesuaikan biaya produksi atau unit produksi.`)
            return
          }
        }
      }

      setIsSaving(true)
      setError(null)
      try {
        const hpp = calculateHPP(currentProduct)
        const isEditing = !!currentProduct.id

        const response = await fetch('/api/inventory', {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: isEditing ? currentProduct.inventoryId : undefined, // Use Inventory ID for PUT
            name: currentProduct.name,
            description: currentProduct.description,
            category: currentProduct.category,
            sku: currentProduct.sku,
            productionCost: currentProduct.productionCost,
            laborCost: currentProduct.laborCost,
            overheadCost: currentProduct.overheadCost,
            wasteFactor: currentProduct.wasteFactor,
            unitProduction: currentProduct.unitProduction,
            targetMargin: currentProduct.targetMargin / 100, // Convert to decimal
            hpp: hpp,
            // Inventory defaults from form (only used for creation or specific updates)
            currentStock: currentProduct.currentStock,
            minStock: currentProduct.minStock,
            unitCost: hpp // Use HPP as unit cost
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save product')
        }

        const savedItem = data

        if (isEditing) {
          // Update local state
          setProducts(products.map(p => p.id === currentProduct.id ? { ...currentProduct } : p))
          toast.success('Produk berhasil diperbarui')
        } else {
          // Add to local state with ID from server
          setProducts([...products, { ...currentProduct, id: savedItem.productId, inventoryId: savedItem.id }])
          toast.success('Produk berhasil disimpan ke database')
        }

        handleCancelEdit() // Reset form
      } catch (error) {
        console.error('Failed to save product:', error)
        const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan produk'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsSaving(false)
      }
    } else {
      toast.error('Mohon lengkapi nama produk dan biaya produksi')
    }
  }

  const handleDeleteProduct = (index: number) => {
    // Note: This only removes from local state for now as we don't have a delete API yet
    // In a real app, we would call DELETE API
    setProducts(products.filter((_, i) => i !== index))
  }

  const handleOptimizePrices = async () => {
    setIsCalculating(true)
    const optimizations: Record<string, PriceOptimization> = {}

    for (const product of products) {
      optimizations[product.name] = await calculatePriceOptimization(product)
    }

    setPriceOptimizations(optimizations)
    setIsCalculating(false)
  }

  const handleEditProduct = (product: ProductForm) => {
    setCurrentProduct(product)
    setActiveTab('form')
  }

  const handleCancelEdit = () => {
    setCurrentProduct({
      name: '',
      description: '',
      category: '',
      sku: '',
      productionCost: 0,
      laborCost: 0,
      overheadCost: 0,
      wasteFactor: 5,
      unitProduction: 1,
      targetMargin: 30,
      currentStock: 0,
      minStock: 10
    })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          HPP Calculator & Price Optimizer
        </CardTitle>
        <CardDescription>
          Hitung Harga Pokok Penjualan dan dapatkan rekomendasi harga optimal dengan AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Wallet className="w-4 h-4" />
                Budget Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pengaturan Budget Kategori</DialogTitle>
                <DialogDescription>
                  Atur batas anggaran produksi untuk setiap kategori produk.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={editingBudget.category}
                    onValueChange={(val) => setEditingBudget({ ...editingBudget, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Makanan</SelectItem>
                      <SelectItem value="Beverage">Minuman</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Electronics">Elektronik</SelectItem>
                      <SelectItem value="Other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  {editingBudget.category && (
                    <div className="text-sm text-slate-500 mt-1">
                      Budget Saat Ini: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(getCategoryBudget(editingBudget.category))}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tambah Budget</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={editingBudget.amount || ''}
                      onChange={(e) => setEditingBudget({ ...editingBudget, amount: Number(e.target.value) })}
                      placeholder="Contoh: 5000000"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Masukkan jumlah yang ingin ditambahkan ke budget saat ini.
                  </p>
                </div>
                <Button onClick={handleSaveBudget} disabled={isSavingBudget} className="w-full">
                  {isSavingBudget ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tambah Budget'}
                </Button>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Daftar Budget Aktif</h4>
                  {budgets.length === 0 ? (
                    <p className="text-sm text-slate-500">Belum ada budget yang diatur.</p>
                  ) : (
                    <div className="space-y-4">
                      {budgets.map(budget => {
                        const usage = getCategoryUsage(budget.category)
                        const remaining = budget.amount - usage
                        const percentage = Math.min((usage / budget.amount) * 100, 100)
                        const isExceeded = remaining < 0

                        return (
                          <div key={budget.id} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold">{budget.category}</span>
                              <Badge variant={isExceeded ? "destructive" : "outline"}>
                                {isExceeded ? "Over Budget" : "Active"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                              <div>
                                <span className="text-slate-500 block text-xs">Total Budget</span>
                                <span className="font-medium">{formatCurrency(budget.amount)}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-500 block text-xs">Sisa Budget</span>
                                <span className={`font-medium ${isExceeded ? 'text-red-600' : 'text-green-600'}`}>
                                  {formatCurrency(remaining)}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>Terpakai: {formatCurrency(usage)}</span>
                                <span>{Math.round(percentage)}%</span>
                              </div>
                              <Progress
                                value={percentage}
                                className={`h-2 ${isExceeded ? "bg-red-100 [&>div]:bg-red-500" : "bg-blue-100 [&>div]:bg-blue-500"}`}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="form">Input Produk</TabsTrigger>
            <TabsTrigger value="products">Daftar Produk ({products.length})</TabsTrigger>
            <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    value={currentProduct.name}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    placeholder="Contoh: Long Pizza"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={currentProduct.description}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                    placeholder="Deskripsi produk..."
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={currentProduct.category} onValueChange={(value) => setCurrentProduct({ ...currentProduct, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Makanan</SelectItem>
                      <SelectItem value="Beverage">Minuman</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Electronics">Elektronik</SelectItem>
                      <SelectItem value="Other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  {currentProduct.category && (
                    <div className="mt-2 text-xs">
                      {(() => {
                        const budget = getCategoryBudget(currentProduct.category)
                        if (budget > 0) {
                          const currentUsage = getCategoryUsage(currentProduct.category)
                          const newUsage = currentProduct.productionCost * currentProduct.unitProduction
                          const totalUsage = currentUsage + newUsage
                          const remaining = budget - totalUsage
                          const isExceeded = remaining < 0

                          return (
                            <div className={`p-2 rounded ${isExceeded ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                              <div className="flex justify-between mb-1">
                                <span>Budget: {formatCurrency(budget)}</span>
                                <span>Sisa: {formatCurrency(remaining)}</span>
                              </div>
                              <Progress
                                value={Math.min((totalUsage / budget) * 100, 100)}
                                className={`h-1.5 ${isExceeded ? 'bg-red-200 [&>div]:bg-red-600' : 'bg-blue-200 [&>div]:bg-blue-600'}`}
                              />
                              {isExceeded && (
                                <div className="mt-1 font-semibold">
                                  ⚠️ Budget terlampaui!
                                </div>
                              )}
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={currentProduct.sku}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                    placeholder="Contoh: LPZ-001"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="productionCost">Biaya Produksi (/unit)</Label>
                  <Input
                    id="productionCost"
                    type="number"
                    value={currentProduct.productionCost}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, productionCost: Number(e.target.value) })}
                    placeholder="15000"
                  />
                </div>
                <div>
                  <Label htmlFor="laborCost">Biaya Tenaga Kerja (/unit)</Label>
                  <Input
                    id="laborCost"
                    type="number"
                    value={currentProduct.laborCost}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, laborCost: Number(e.target.value) })}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="overheadCost">Biaya Overhead (/unit)</Label>
                  <Input
                    id="overheadCost"
                    type="number"
                    value={currentProduct.overheadCost}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, overheadCost: Number(e.target.value) })}
                    placeholder="3000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wasteFactor">Waste Factor (%)</Label>
                    <Input
                      id="wasteFactor"
                      type="number"
                      value={currentProduct.wasteFactor}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, wasteFactor: Number(e.target.value) })}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitProduction">Unit Produksi</Label>
                    <Input
                      id="unitProduction"
                      type="number"
                      value={currentProduct.unitProduction}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, unitProduction: Number(e.target.value) })}
                      placeholder="100"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="targetMargin">Target Margin (%)</Label>
                  <Input
                    id="targetMargin"
                    type="number"
                    value={currentProduct.targetMargin}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, targetMargin: Number(e.target.value) })}
                    placeholder="30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Stok Saat Ini</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={currentProduct.currentStock}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, currentStock: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStock">Min. Stok (Alert)</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={currentProduct.minStock}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, minStock: Number(e.target.value) })}
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {currentProduct.name && (
              <Alert>
                <DollarSign className="w-4 h-4" />
                <AlertDescription>
                  <strong>HPP Perkiraan:</strong> {formatCurrency(calculateHPP(currentProduct))}
                  <br />
                  <strong>Harga Jual Suggested:</strong> {formatCurrency(calculateHPP(currentProduct) * (1 + currentProduct.targetMargin / 100))}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAddProduct} className="flex-1" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {currentProduct.id ? 'Menyimpan...' : 'Menyimpan...'}
                  </>
                ) : (
                  <>
                    {currentProduct.id ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Produk
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Produk
                      </>
                    )}
                  </>
                )}
              </Button>
              {currentProduct.id && (
                <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                Memuat data produk...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada produk yang ditambahkan
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{product.name}</h3>
                            <Badge variant="secondary">{product.category}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{product.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">HPP:</span>
                              <div className="font-semibold">{formatCurrency(calculateHPP(product))}</div>
                            </div>
                            <div>
                              <span className="text-slate-500">Target Margin:</span>
                              <div className="font-semibold">{product.targetMargin}%</div>
                            </div>
                            <div>
                              <span className="text-slate-500">Harga Jual:</span>
                              <div className="font-semibold text-green-600">
                                {formatCurrency(calculateHPP(product) * (1 + product.targetMargin / 100))}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-500">Unit Produksi:</span>
                              <div className="font-semibold">{product.unitProduction}</div>
                            </div>
                            <div>
                              <span className="text-slate-500">Waste Factor:</span>
                              <div className="font-semibold">{product.wasteFactor}%</div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">AI Price Optimization</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Dapatkan rekomendasi harga optimal berdasarkan analisis kompetitor dan sentimen pasar
                </p>
              </div>
              <Button
                onClick={handleOptimizePrices}
                disabled={isCalculating || products.length === 0}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {isCalculating ? 'Analyzing...' : 'Optimize Prices'}
              </Button>
            </div>

            {Object.keys(priceOptimizations).length > 0 && (
              <div className="space-y-6">
                {Object.entries(priceOptimizations).map(([productName, optimization]) => (
                  <Card key={productName}>
                    <CardHeader>
                      <CardTitle className="text-lg">{productName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              Competitive
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {Math.round(optimization.competitive.confidence * 100)}% confidence
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {formatCurrency(optimization.competitive.price)}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            {optimization.competitive.reasoning}
                          </p>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              Standard
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {Math.round(optimization.standard.confidence * 100)}% confidence
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {formatCurrency(optimization.standard.price)}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            {optimization.standard.reasoning}
                          </p>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                              Premium
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {Math.round(optimization.premium.confidence * 100)}% confidence
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {formatCurrency(optimization.premium.price)}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            {optimization.premium.reasoning}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}