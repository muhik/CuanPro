import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Helper to get or create a demo user
async function getDemoUser() {
    const email = 'demo@example.com'
    try {
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
        const user = await db.user.findUnique({ where: { email } })
        if (!user) throw new Error('Failed to create/find demo user')
        return user
    }
}

export async function GET() {
    try {
        const user = await getDemoUser()
        const budgets = await db.categoryBudget.findMany({
            where: { userId: user.id }
        })
        return NextResponse.json(budgets)
    } catch (error) {
        console.error('Failed to fetch budgets:', error)
        return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const user = await getDemoUser()

        const { category, amount, mode = 'set' } = body

        if (!category || amount === undefined) {
            return NextResponse.json({ error: 'Category and amount are required' }, { status: 400 })
        }

        const updateData = mode === 'add'
            ? { amount: { increment: Number(amount) } }
            : { amount: Number(amount) }

        const budget = await db.categoryBudget.upsert({
            where: {
                userId_category: {
                    userId: user.id,
                    category: category
                }
            },
            update: updateData,
            create: {
                userId: user.id,
                category: category,
                amount: Number(amount)
            }
        })

        return NextResponse.json(budget)
    } catch (error) {
        console.error('Failed to save budget:', error)
        return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 })
    }
}
