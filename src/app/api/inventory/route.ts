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
    const inventory = await db.inventoryItem.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Failed to fetch inventory:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user = await getDemoUser()

    // Create Business if not exists (required for Product)
    let business = await db.business.findFirst({ where: { userId: user.id } })
    if (!business) {
      business = await db.business.create({
        data: {
          name: "Demo Business",
          userId: user.id
        }
      })
    }

    // Transaction to create Product and InventoryItem
    const result = await db.$transaction(async (tx) => {
      // Calculate HPP if not provided but costs are
      let hpp = body.hpp || 0
      if (!hpp && body.productionCost) {
        const totalCost = (body.productionCost || 0) + (body.laborCost || 0) + (body.overheadCost || 0)
        const wasteMultiplier = 1 + ((body.wasteFactor || 5) / 100)
        hpp = (totalCost * wasteMultiplier) / (body.unitProduction || 1)
      }

      const product = await tx.product.create({
        data: {
          name: body.name,
          category: body.category || 'Uncategorized',
          description: body.description,
          hpp: hpp,
          productionCost: body.productionCost || 0,
          laborCost: body.laborCost || 0,
          overheadCost: body.overheadCost || 0,
          unitProduction: body.unitProduction || 1,
          wasteFactor: body.wasteFactor || 5,
          targetMargin: body.targetMargin || 0.3,
          businessId: business.id,
          sku: body.sku,
        }
      })

      const inventoryItem = await tx.inventoryItem.create({
        data: {
          productId: product.id,
          userId: user.id,
          itemName: product.name,
          currentStock: Number(body.currentStock) || 0,
          minStock: Number(body.minStock) || 10,
          unitCost: Number(body.unitCost) || 0,
          reorderAlert: (Number(body.currentStock) || 0) <= (Number(body.minStock) || 10)
        }
      })

      return inventoryItem
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to create inventory item:', error)
    return NextResponse.json(
      { error: error instanceof Error ? `[v2] ${error.message}` : '[v2] Failed to create inventory item' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const user = await getDemoUser()

    if (!body.id) {
      return NextResponse.json({ error: 'Inventory ID is required' }, { status: 400 })
    }

    // Transaction to update Product and InventoryItem
    const result = await db.$transaction(async (tx) => {
      // 1. Update Inventory Item
      const inventoryItem = await tx.inventoryItem.update({
        where: {
          id: body.id,
          userId: user.id
        },
        data: {
          currentStock: Number(body.currentStock),
          minStock: Number(body.minStock),
          unitCost: Number(body.unitCost),
          reorderAlert: (Number(body.currentStock)) <= (Number(body.minStock))
        }
      })

      // 2. Update Product if product details are provided
      if (body.name || body.sku) {
        await tx.product.update({
          where: { id: inventoryItem.productId },
          data: {
            name: body.name,
            category: body.category,
            sku: body.sku,
            // Only update costs if explicitly provided (optional for simple inventory edit)
            ...(body.productionCost && { productionCost: body.productionCost }),
            ...(body.hpp && { hpp: body.hpp }),
          }
        })
      }

      return inventoryItem
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to update inventory item:', error)
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 })
  }
}
