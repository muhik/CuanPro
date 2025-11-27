import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            )
        }

        const text = await file.text()
        const lines = text.split('\n')
        const headers = lines[0].split(',')

        // Validate headers (basic check)
        if (!headers.includes('Name') || !headers.includes('HPP')) {
            return NextResponse.json(
                { error: 'Invalid CSV format. Missing required columns.' },
                { status: 400 }
            )
        }

        let successCount = 0
        let errorCount = 0

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            try {
                // Simple CSV parser that handles quotes
                const values: string[] = []
                let inQuotes = false
                let currentValue = ''

                for (let char of line) {
                    if (char === '"') {
                        inQuotes = !inQuotes
                    } else if (char === ',' && !inQuotes) {
                        values.push(currentValue)
                        currentValue = ''
                    } else {
                        currentValue += char
                    }
                }
                values.push(currentValue)

                // Clean up values (remove surrounding quotes)
                const cleanValues = values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'))

                // Map values to schema
                // Order: Name, Description, HPP, Target Margin, Current Price, Production Cost, Labor Cost, Overhead Cost, Waste Factor, Unit Production, Category, SKU
                const [
                    name, description, hpp, targetMargin, currentPrice,
                    productionCost, laborCost, overheadCost, wasteFactor,
                    unitProduction, category, sku
                ] = cleanValues

                if (!name || !hpp) continue

                // Get default business (first one found) - in real app might need selection
                const business = await prisma.business.findFirst()
                if (!business) {
                    throw new Error('No business found')
                }

                await prisma.product.upsert({
                    where: { sku: sku || 'undefined' }, // Use SKU for upsert if available
                    update: {
                        name,
                        description,
                        hpp: parseFloat(hpp),
                        targetMargin: parseFloat(targetMargin),
                        currentPrice: currentPrice ? parseFloat(currentPrice) : null,
                        productionCost: parseFloat(productionCost),
                        laborCost: parseFloat(laborCost),
                        overheadCost: parseFloat(overheadCost),
                        wasteFactor: parseFloat(wasteFactor),
                        unitProduction: parseInt(unitProduction),
                        category,
                    },
                    create: {
                        name,
                        description,
                        hpp: parseFloat(hpp),
                        targetMargin: parseFloat(targetMargin),
                        currentPrice: currentPrice ? parseFloat(currentPrice) : null,
                        productionCost: parseFloat(productionCost),
                        laborCost: parseFloat(laborCost),
                        overheadCost: parseFloat(overheadCost),
                        wasteFactor: parseFloat(wasteFactor),
                        unitProduction: parseInt(unitProduction),
                        category,
                        sku: sku || undefined,
                        businessId: business.id
                    }
                })
                successCount++
            } catch (e) {
                console.error(`Error processing line ${i}:`, e)
                errorCount++
            }
        }

        return NextResponse.json({
            message: `Import completed. Success: ${successCount}, Failed: ${errorCount}`,
            successCount,
            errorCount
        })

    } catch (error) {
        console.error('Import error:', error)
        return NextResponse.json(
            { error: 'Failed to import products' },
            { status: 500 }
        )
    }
}
