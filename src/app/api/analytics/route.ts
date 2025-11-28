import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        // 1. Fetch all products with inventory and sales
        const products = await db.product.findMany({
            include: {
                inventoryItems: true,
                sales: {
                    where: {
                        date: {
                            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) // Last 30 days
                        }
                    }
                }
            }
        })

        // 2. Calculate Metrics
        let totalRevenue = 0
        let totalCost = 0
        let totalMargin = 0
        let productCount = products.length
        let lowStockItems = []
        let topSellingProducts = []
        let highMarginProducts = []

        for (const product of products) {
            const inventory = product.inventoryItems[0]
            const currentStock = inventory?.currentStock || 0
            const minStock = inventory?.minStock || 0
            const hpp = product.hpp || 0
            const margin = product.targetMargin || 0
            const sellingPrice = hpp * (1 + margin)

            // Margin Accumulation
            totalMargin += margin

            // Low Stock Check
            if (currentStock <= minStock) {
                lowStockItems.push({
                    name: product.name,
                    currentStock,
                    minStock
                })
            }

            // High Margin Check (> 40%)
            if (margin > 0.4) {
                highMarginProducts.push({
                    name: product.name,
                    margin: margin
                })
            }

            // Sales Analysis
            const productRevenue = product.sales.reduce((acc, sale) => acc + sale.totalPrice, 0)
            const productSalesQty = product.sales.reduce((acc, sale) => acc + sale.quantity, 0)

            totalRevenue += productRevenue
            // Cost for sold items
            totalCost += productSalesQty * hpp

            if (productSalesQty > 0) {
                topSellingProducts.push({
                    name: product.name,
                    quantity: productSalesQty,
                    revenue: productRevenue
                })
            }
        }

        // Sort Top Selling
        topSellingProducts.sort((a, b) => b.quantity - a.quantity)

        // Averages
        const avgMargin = productCount > 0 ? (totalMargin / productCount) * 100 : 0
        const profit = totalRevenue - totalCost
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

        // 3. Generate AI Insights
        const insights = []

        // Insight: Low Stock
        if (lowStockItems.length > 0) {
            insights.push({
                type: 'alert',
                title: 'Inventory Alert',
                description: `${lowStockItems.length} products are running low on stock (${lowStockItems.map(i => i.name).slice(0, 3).join(', ')}...). Restock recommended.`
            })
        }

        // Insight: High Margin Opportunities
        if (highMarginProducts.length > 0) {
            insights.push({
                type: 'success',
                title: 'Profit Drivers',
                description: `${highMarginProducts.length} products have high margins (>40%). Consider promoting ${highMarginProducts[0].name} to boost profits.`
            })
        } else {
            insights.push({
                type: 'info',
                title: 'Margin Optimization',
                description: `Average margin is ${Math.round(avgMargin)}%. Consider reviewing HPP or increasing prices for lower margin items.`
            })
        }

        // Insight: Sales Trend
        if (topSellingProducts.length > 0) {
            insights.push({
                type: 'trending',
                title: 'Top Performer',
                description: `${topSellingProducts[0].name} is your best seller with ${topSellingProducts[0].quantity} units sold. Ensure stock availability.`
            })
        } else {
            insights.push({
                type: 'info',
                title: 'Sales Insight',
                description: "No sales recorded in the last 30 days. Start recording sales to get performance insights."
            })
        }

        return NextResponse.json({
            metrics: {
                revenue: totalRevenue,
                profit: profit,
                avgMargin: Math.round(avgMargin),
                profitMargin: Math.round(profitMargin),
                lowStockCount: lowStockItems.length
            },
            insights
        })

    } catch (error) {
        console.error('Failed to fetch analytics:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
