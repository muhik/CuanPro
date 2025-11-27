'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
    id: string
    name: string
    currentStock: number
    unitCost: number
    targetMargin: number
    hpp: number
}

export function SalesForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [formData, setFormData] = useState({
        productId: '',
        quantity: ''
    })

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/inventory')
                const data = await res.json()
                if (Array.isArray(data)) {
                    setProducts(data.map((item: any) => ({
                        id: item.product.id,
                        name: item.product.name,
                        currentStock: item.currentStock,
                        unitCost: item.unitCost,
                        targetMargin: item.product.targetMargin,
                        hpp: item.product.hpp
                    })))
                }
            } catch (error) {
                console.error('Failed to fetch products:', error)
            }
        }
        fetchProducts()
    }, [])

    const selectedProduct = products.find(p => p.id === formData.productId)
    const price = selectedProduct ? (selectedProduct.hpp * (1 + selectedProduct.targetMargin)) : 0
    const totalPrice = price * (Number(formData.quantity) || 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: formData.productId,
                    quantity: Number(formData.quantity)
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to record sale')
            }

            toast.success('Sale recorded successfully')
            setFormData({
                productId: '',
                quantity: ''
            })
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
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
                <CardTitle>Input Sales</CardTitle>
                <CardDescription>Record a new sales transaction</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="product">Select Product</Label>
                        <Select
                            value={formData.productId}
                            onValueChange={(value) => setFormData({ ...formData, productId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.name} (Stock: {product.currentStock})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            required
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="Enter quantity sold"
                        />
                    </div>

                    {selectedProduct && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Unit Price:</span>
                                <span>{formatCurrency(price)}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-2">
                                <span>Total Revenue:</span>
                                <span className="text-green-600">{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading || !formData.productId || !formData.quantity}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Recording...
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Record Sale
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
