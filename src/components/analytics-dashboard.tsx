'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, Package, BarChart3, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface AnalyticsData {
    metrics: {
        revenue: number
        profit: number
        avgMargin: number
        profitMargin: number
        lowStockCount: number
    }
    insights: {
        type: 'alert' | 'success' | 'trending' | 'info'
        title: string
        description: string
    }[]
}

export function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/analytics', { cache: 'no-store' })
                const jsonData = await res.json()
                setData(jsonData)
            } catch (error) {
                console.error('Failed to fetch analytics:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAnalytics()
    }, [])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        )
    }

    if (!data) {
        return <div>Failed to load analytics data.</div>
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <AlertTriangle className="w-4 h-4 text-red-500" />
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'trending': return <TrendingUp className="w-4 h-4 text-blue-500" />
            default: return <Info className="w-4 h-4 text-slate-500" />
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Business Performance</CardTitle>
                    <CardDescription>Real-time metrics based on your data</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Average Target Margin</span>
                                <span className="text-sm text-blue-600">{data.metrics.avgMargin}%</span>
                            </div>
                            <Progress value={data.metrics.avgMargin} className="h-2" />
                            <p className="text-xs text-slate-500 mt-1">Average margin set across all products</p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Realized Profit Margin</span>
                                <span className="text-sm text-green-600">{data.metrics.profitMargin}%</span>
                            </div>
                            <Progress value={data.metrics.profitMargin} className="h-2" />
                            <p className="text-xs text-slate-500 mt-1">Based on recorded sales (Revenue - COGS)</p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Stock Health</span>
                                <span className="text-sm text-purple-600">
                                    {data.metrics.lowStockCount === 0 ? 'Healthy' : `${data.metrics.lowStockCount} Low Items`}
                                </span>
                            </div>
                            <Progress value={Math.max(0, 100 - (data.metrics.lowStockCount * 10))} className="h-2" />
                            <p className="text-xs text-slate-500 mt-1">Inventory availability score</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                    <CardDescription>Smart recommendations for your business</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.insights.map((insight, index) => (
                            <Alert key={index}>
                                {getIcon(insight.type)}
                                <AlertDescription>
                                    <strong>{insight.title}:</strong> {insight.description}
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
