'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Calculator
} from 'lucide-react'

interface ProjectionData {
  month: string
  revenue: number
  profit: number
  costs: number
  breakEven: number
}

interface SensitivityAnalysis {
  scenario: string
  revenue: number
  profit: number
  margin: number
}

export function ProjectionChart() {
  const [selectedProduct, setSelectedProduct] = useState('Long Pizza')
  const [targetProfit, setTargetProfit] = useState(30)
  const [dailyVolume, setDailyVolume] = useState(50)
  const [season, setSeason] = useState('normal')
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([])
  const [sensitivityData, setSensitivityData] = useState<SensitivityAnalysis[]>([])
  const [breakEvenPoint, setBreakEvenPoint] = useState(0)
  const [roi, setRoi] = useState(0)
  const [cashFlow, setCashFlow] = useState(0)

  const [products, setProducts] = useState<{
    name: string;
    hpp: number;
    currentPrice: number;
    productionCost: number;
    laborCost: number;
    overheadCost: number;
  }[]>([])

  const [costBreakdown, setCostBreakdown] = useState([
    { name: 'Bahan Baku', value: 0, color: '#10b981' },
    { name: 'Tenaga Kerja', value: 0, color: '#3b82f6' },
    { name: 'Overhead', value: 0, color: '#f59e0b' }
  ])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/inventory')
        const data = await res.json()
        if (Array.isArray(data)) {
          const mappedProducts = data.map((item: any) => ({
            name: item.product.name,
            hpp: item.product.hpp,
            currentPrice: item.product.hpp * (1 + item.product.targetMargin),
            productionCost: item.product.productionCost,
            laborCost: item.product.laborCost,
            overheadCost: item.product.overheadCost
          }))
          setProducts(mappedProducts)
          if (mappedProducts.length > 0) {
            setSelectedProduct(mappedProducts[0].name)
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }
    fetchProducts()
  }, [])

  const seasonMultipliers = {
    peak: 1.5,
    normal: 1.0,
    'off-peak': 0.7
  }

  const calculateProjections = () => {
    const product = products.find(p => p.name === selectedProduct)
    if (!product) return

    const seasonMultiplier = seasonMultipliers[season as keyof typeof seasonMultipliers]
    const monthlyVolume = dailyVolume * 30 * seasonMultiplier
    const monthlyRevenue = monthlyVolume * product.currentPrice
    const monthlyCosts = monthlyVolume * product.hpp
    const monthlyProfit = monthlyRevenue - monthlyCosts

    // Calculate break-even point
    const fixedCosts = 5000000 // Monthly fixed costs
    const contributionMargin = product.currentPrice - product.hpp
    const breakEvenUnits = fixedCosts / contributionMargin
    const breakEvenRevenue = breakEvenUnits * product.currentPrice

    // Calculate ROI
    const initialInvestment = 50000000
    const annualProfit = monthlyProfit * 12
    const calculatedRoi = (annualProfit / initialInvestment) * 100

    // Calculate cash flow
    const monthlyCashFlow = monthlyProfit - (fixedCosts / 12)

    // Generate 12-month projection data
    const projections: ProjectionData[] = []
    for (let i = 0; i < 12; i++) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const seasonalFactor = i >= 10 || i <= 1 ? 1.2 : i >= 5 && i <= 7 ? 0.8 : 1.0
      const adjustedVolume = monthlyVolume * seasonalFactor

      projections.push({
        month: monthNames[i],
        revenue: adjustedVolume * product.currentPrice,
        profit: adjustedVolume * (product.currentPrice - product.hpp) - fixedCosts,
        costs: adjustedVolume * product.hpp + fixedCosts,
        breakEven: breakEvenRevenue
      })
    }

    // Generate sensitivity analysis
    const sensitivity: SensitivityAnalysis[] = [
      {
        scenario: 'Best Case (+20% Volume)',
        revenue: monthlyRevenue * 1.2,
        profit: monthlyProfit * 1.2,
        margin: ((monthlyProfit * 1.2) / (monthlyRevenue * 1.2)) * 100
      },
      {
        scenario: 'Base Case',
        revenue: monthlyRevenue,
        profit: monthlyProfit,
        margin: (monthlyProfit / monthlyRevenue) * 100
      },
      {
        scenario: 'Worst Case (-20% Volume)',
        revenue: monthlyRevenue * 0.8,
        profit: monthlyProfit * 0.8,
        margin: ((monthlyProfit * 0.8) / (monthlyRevenue * 0.8)) * 100
      },
      {
        scenario: 'Costs +10%',
        revenue: monthlyRevenue,
        profit: monthlyProfit - (monthlyCosts * 0.1),
        margin: ((monthlyProfit - (monthlyCosts * 0.1)) / monthlyRevenue) * 100
      }
    ]

    setProjectionData(projections)
    setSensitivityData(sensitivity)
    setBreakEvenPoint(breakEvenRevenue)
    setRoi(calculatedRoi)
    setCashFlow(monthlyCashFlow)

    // Update Cost Breakdown
    const total = product.productionCost + product.laborCost + product.overheadCost
    if (total > 0) {
      setCostBreakdown([
        { name: 'Bahan Baku', value: Math.round((product.productionCost / total) * 100), color: '#10b981' },
        { name: 'Tenaga Kerja', value: Math.round((product.laborCost / total) * 100), color: '#3b82f6' },
        { name: 'Overhead', value: Math.round((product.overheadCost / total) * 100), color: '#f59e0b' }
      ])
    }
  }

  useEffect(() => {
    calculateProjections()
  }, [selectedProduct, targetProfit, dailyVolume, season, products])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(Math.round(num))
  }



  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Business Projection Control
          </CardTitle>
          <CardDescription>
            Set parameters for business projections and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="product">Produk</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.name} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="profit">Target Profit (%)</Label>
              <Input
                id="profit"
                type="number"
                value={targetProfit}
                onChange={(e) => setTargetProfit(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="volume">Daily Volume</Label>
              <Input
                id="volume"
                type="number"
                value={dailyVolume}
                onChange={(e) => setDailyVolume(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="season">Season</Label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peak">Peak Season</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="off-peak">Off-Peak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Break Even</p>
                <p className="text-2xl font-bold">{formatCurrency(breakEvenPoint)}</p>
                <p className="text-sm text-slate-500">per bulan</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ROI</p>
                <p className="text-2xl font-bold">{roi.toFixed(1)}%</p>
                <p className="text-sm text-slate-500">annual</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cash Flow</p>
                <p className="text-2xl font-bold">{formatCurrency(cashFlow)}</p>
                <p className="text-sm text-slate-500">per bulan</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly Volume</p>
                <p className="text-2xl font-bold">{formatNumber(dailyVolume * 30)}</p>
                <p className="text-sm text-slate-500">units</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Projection</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="comparison">Scenario Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>12-Month Revenue Projection</CardTitle>
              <CardDescription>
                Projected revenue, profit, and costs over the next 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Profit"
                  />
                  <Line
                    type="monotone"
                    dataKey="costs"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Costs"
                  />
                  <Line
                    type="monotone"
                    dataKey="breakEven"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Break Even"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensitivity">
          <Card>
            <CardHeader>
              <CardTitle>Sensitivity Analysis</CardTitle>
              <CardDescription>
                How changes in key variables affect your business performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sensitivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scenario" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Scenario: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {sensitivityData.map((item, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>{item.scenario}:</strong> Margin {item.margin.toFixed(1)}%
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Cost Breakdown
                </CardTitle>
                <CardDescription>
                  Percentage breakdown of your costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>
                  Detailed cost breakdown and optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}

                  <Alert className="mt-4">
                    <Calculator className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Optimization Tip:</strong> Consider reducing overhead costs by 5-10% through energy efficiency measures.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
              <CardDescription>
                Compare different business scenarios side by side
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Scenario</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Profit</th>
                      <th className="text-right p-2">Margin</th>
                      <th className="text-right p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivityData.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{item.scenario}</td>
                        <td className="text-right p-2">{formatCurrency(item.revenue)}</td>
                        <td className="text-right p-2">{formatCurrency(item.profit)}</td>
                        <td className="text-right p-2">{item.margin.toFixed(1)}%</td>
                        <td className="text-right p-2">
                          {item.margin > 20 ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Healthy
                            </Badge>
                          ) : item.margin > 10 ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Caution
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Risk
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}