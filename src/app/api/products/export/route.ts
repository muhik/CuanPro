import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                business: true
            }
        })

        // Define CSV headers
        const headers = [
            'Name',
            'Description',
            'HPP',
            'Target Margin',
            'Current Price',
            'Production Cost',
            'Labor Cost',
            'Overhead Cost',
            'Waste Factor',
            'Unit Production',
            'Category',
            'SKU'
        ]

        // Convert products to CSV rows
        const csvRows = products.map(product => {
            return [
                `"${product.name.replace(/"/g, '""')}"`,
                `"${(product.description || '').replace(/"/g, '""')}"`,
                product.hpp,
                product.targetMargin,
                product.currentPrice || '',
                product.productionCost,
                product.laborCost,
                product.overheadCost,
                product.wasteFactor,
                product.unitProduction,
                `"${(product.category || '').replace(/"/g, '""')}"`,
                `"${(product.sku || '').replace(/"/g, '""')}"`
            ].join(',')
        })

        // Combine headers and rows
        const csvContent = [headers.join(','), ...csvRows].join('\n')

        // Create response with appropriate headers for download
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="products-${new Date().toISOString().split('T')[0]}.csv"`
            }
        })
    } catch (error) {
        console.error('Export error:', error)
        return NextResponse.json(
            { error: 'Failed to export products' },
            { status: 500 }
        )
    }
}
