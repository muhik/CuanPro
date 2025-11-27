'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'

interface Sale {
    id: string
    product: {
        name: string
    }
    quantity: number
    totalPrice: number
    date: string
}

export function RecentTransactions({ refreshTrigger }: { refreshTrigger?: number }) {
    const [sales, setSales] = useState<Sale[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchSales = async () => {
        try {
            const res = await fetch('/api/sales')
            const data = await res.json()
            if (Array.isArray(data)) {
                setSales(data)
            }
        } catch (error) {
            console.error('Failed to fetch sales:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSales()
    }, [refreshTrigger])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest sales history</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center py-8 text-slate-500">Loading...</div>
                ) : sales.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        No transactions yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sales.map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                        <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{sale.product.name}</p>
                                        <p className="text-xs text-slate-500">{formatDate(sale.date)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm text-emerald-600">{formatCurrency(sale.totalPrice)}</p>
                                    <p className="text-xs text-slate-500">{sale.quantity} items</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
