import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to get demo user
async function getDemoUser() {
    const email = 'demo@example.com'
    let user = await db.user.findUnique({ where: { email } })
    if (!user) {
        user = await db.user.create({
            data: {
                email,
                name: 'Demo User',
            }
        })
    }
    return user
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { productId, quantity } = body
        const user = await getDemoUser()

        if (!productId || !quantity || quantity <= 0) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }

        // Transaction to record sale and update inventory
        const result = await db.$transaction(async (tx) => {
            // 1. Get Product and Inventory
            const product = await tx.product.findUnique({
                where: { id: productId },
                include: { inventoryItems: true }
            })

            if (!product) {
                throw new Error('Product not found')
            }

            const inventoryItem = product.inventoryItems[0]
            if (!inventoryItem) {
                throw new Error('Inventory item not found')
            }

            // 2. Check Stock
            if (inventoryItem.currentStock < quantity) {
                throw new Error(`Insufficient stock. Available: ${inventoryItem.currentStock}`)
            }

            // 3. Calculate Total Price
            // Price = HPP * (1 + Margin)
            const price = (product.hpp || 0) * (1 + (product.targetMargin || 0))
            const totalPrice = price * quantity

            // 4. Create Sale Record
            const sale = await tx.sale.create({
                data: {
                    productId,
                    quantity,
                    totalPrice,
                    date: new Date()
                }
            })

            // 5. Update Inventory Stock
            // Also update monthly usage (simple addition for now)
            await tx.inventoryItem.update({
                where: { id: inventoryItem.id },
                data: {
                    currentStock: { decrement: quantity },
                    // In a real app, monthlyUsage would be recalculated based on sales history window
                    // For now, we just increment it to reflect "usage"
                    // monthlyUsage: { increment: quantity } 
                    // Actually, let's leave monthlyUsage as a manual field or separate calculation for now to avoid confusion
                }
            })

            return sale
        })

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Failed to record sale:', error)
        return NextResponse.json({ error: error.message || 'Failed to record sale' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const sales = await db.sale.findMany({
            include: {
                product: true
            },
            orderBy: {
                date: 'desc'
            },
            take: 50
        })
        return NextResponse.json(sales)
    } catch (error) {
        console.error('Failed to fetch sales:', error)
        return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
    }
}
