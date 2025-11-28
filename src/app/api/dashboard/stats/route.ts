import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Helper to get demo user (same as in inventory route)
async function getDemoUser() {
    const email = 'demo@example.com'
    try {
        // Use upsert to handle race conditions
        return await db.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: 'Demo User',
            }
        })
    } catch (error) {
        console.error('Error getting demo user:', error)
        // Fallback to find if upsert fails (rare)
        const user = await db.user.findUnique({ where: { email } })
        if (!user) throw new Error('Failed to create/find demo user')
        return user
    }
}

export async function GET() {
    try {
        const user = await getDemoUser()

        // Fetch all products with inventory for the user
        const products = await db.product.findMany({
            where: {
                business: {
                    userId: user.id
                }
            },
            include: {
                inventoryItems: true
            }
        })

        const totalProducts = products.length

        // Calculate Average HPP
        const totalHpp = products.reduce((sum, product) => sum + (product.hpp || 0), 0)
        const avgHpp = totalProducts > 0 ? totalHpp / totalProducts : 0

        // Calculate Monthly Revenue (Real Data)
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const sales = await db.sale.findMany({
            where: {
                date: {
                    gte: startOfMonth
                },
                product: {
                    business: {
                        userId: user.id
                    }
                }
            }
        })

        const monthlyRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0)

        // Calculate Average Margin
        let totalMargin = 0
        products.forEach(product => {
            totalMargin += product.targetMargin || 0
        })
        const avgMargin = totalProducts > 0 ? totalMargin / totalProducts : 0

        return NextResponse.json({
            totalProducts,
            avgHpp,
            monthlyRevenue,
            avgMargin
        })

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
    }
}
