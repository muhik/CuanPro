import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const recentProducts = await db.product.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 3,
            select: {
                id: true,
                name: true,
                hpp: true,
                targetMargin: true,
                createdAt: true
            }
        })

        const formattedProducts = recentProducts.map(product => ({
            id: product.id,
            name: product.name,
            price: product.hpp * (1 + product.targetMargin),
            createdAt: product.createdAt
        }))

        return NextResponse.json(formattedProducts)
    } catch (error) {
        console.error('Failed to fetch recent products:', error)
        return NextResponse.json({ error: 'Failed to fetch recent products' }, { status: 500 })
    }
}
