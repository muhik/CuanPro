'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Save } from 'lucide-react'
import { toast } from 'sonner'

interface InventoryFormProps {
    onSuccess?: () => void
    initialData?: {
        id: string
        name: string
        category: string
        sku: string
        currentStock: number
        minStock: number
        unitCost: number
    }
}

export function InventoryForm({ onSuccess, initialData }: InventoryFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        sku: '',
        currentStock: '',
        minStock: '10',
        unitCost: ''
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                category: initialData.category,
                sku: initialData.sku || '',
                currentStock: String(initialData.currentStock),
                minStock: String(initialData.minStock),
                unitCost: String(initialData.unitCost)
            })
        }
    }, [initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const url = '/api/inventory'
            const method = initialData ? 'PUT' : 'POST'

            const body: any = {
                name: formData.name,
                category: formData.category,
                sku: formData.sku,
                currentStock: Number(formData.currentStock),
                minStock: Number(formData.minStock),
                unitCost: Number(formData.unitCost),
            }

            if (initialData) {
                body.id = initialData.id
            } else {
                // Only for new items
                body.productionCost = Number(formData.unitCost)
                body.hpp = Number(formData.unitCost)
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                throw new Error(initialData ? 'Failed to update item' : 'Failed to create item')
            }

            toast.success(initialData ? 'Product updated successfully' : 'Product added to inventory')

            if (!initialData) {
                setFormData({
                    name: '',
                    category: '',
                    sku: '',
                    currentStock: '',
                    minStock: '10',
                    unitCost: ''
                })
            }
            onSuccess?.()
        } catch (error) {
            toast.error(initialData ? 'Failed to update product' : 'Failed to add product')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle>{initialData ? 'Edit Product' : 'Add New Product'}</CardTitle>
                <CardDescription>
                    {initialData ? 'Update inventory details' : 'Add a new item to your inventory tracking'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="px-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Mozzarella Cheese"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Raw Material">Raw Material</SelectItem>
                                    <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                                    <SelectItem value="Packaging">Packaging</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU (Optional)</Label>
                            <Input
                                id="sku"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="e.g. CHE-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unitCost">Unit Cost (Rp)</Label>
                            <Input
                                id="unitCost"
                                type="number"
                                required
                                min="0"
                                value={formData.unitCost}
                                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currentStock">Current Stock</Label>
                            <Input
                                id="currentStock"
                                type="number"
                                required
                                min="0"
                                value={formData.currentStock}
                                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minStock">Minimum Stock Alert</Label>
                            <Input
                                id="minStock"
                                type="number"
                                required
                                min="0"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                placeholder="10"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="px-0 pb-0">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {initialData ? 'Saving...' : 'Adding...'}
                            </>
                        ) : (
                            <>
                                {initialData ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                {initialData ? 'Save Changes' : 'Add to Inventory'}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
