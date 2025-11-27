import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { productName, basePrice } = body

        if (!productName) {
            return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
        }

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Base price for simulation (default to 50000 if not provided)
        const price = Number(basePrice) || 50000

        // Generate random variation helper
        const vary = (val: number, percent: number) => {
            const variation = val * (percent / 100)
            const random = (Math.random() - 0.5) * 2 // -1 to 1
            return Math.round(val + (variation * random))
        }

        const competitors = [
            {
                id: 'c1',
                name: 'Official Store',
                productName: `Premium ${productName}`,
                price: vary(price * 1.2, 10),
                originalPrice: vary(price * 1.4, 5),
                discount: 15,
                rating: 4.8,
                reviewCount: vary(500, 20),
                soldCount: vary(1200, 15),
                sentiment: 0.92,
                source: 'Tokopedia',
                url: 'https://tokopedia.com',
                lastUpdated: new Date().toISOString(),
                priceHistory: generatePriceHistory(price * 1.2)
            },
            {
                id: 'c2',
                name: 'Star Seller Shop',
                productName: `${productName} Murah`,
                price: vary(price * 0.9, 10),
                originalPrice: vary(price * 1.1, 5),
                discount: 25,
                rating: 4.5,
                reviewCount: vary(2000, 30),
                soldCount: vary(5000, 20),
                sentiment: 0.85,
                source: 'Shopee',
                url: 'https://shopee.co.id',
                lastUpdated: new Date().toISOString(),
                priceHistory: generatePriceHistory(price * 0.9)
            },
            {
                id: 'c3',
                name: 'Resto Tetangga',
                productName: `${productName} Spesial`,
                price: vary(price * 1.3, 5),
                originalPrice: vary(price * 1.3, 0),
                discount: 0,
                rating: 4.6,
                reviewCount: vary(150, 10),
                soldCount: vary(400, 10),
                sentiment: 0.88,
                source: 'GoFood',
                url: 'https://gofood.co.id',
                lastUpdated: new Date().toISOString(),
                priceHistory: generatePriceHistory(price * 1.3)
            },
            {
                id: 'c4',
                name: 'Warung Viral',
                productName: `Paket ${productName}`,
                price: vary(price * 1.1, 8),
                originalPrice: vary(price * 1.5, 5),
                discount: 30,
                rating: 4.3,
                reviewCount: vary(800, 15),
                soldCount: vary(2500, 25),
                sentiment: 0.75,
                source: 'GrabFood',
                url: 'https://grab.com',
                lastUpdated: new Date().toISOString(),
                priceHistory: generatePriceHistory(price * 1.1)
            }
        ]

        const insights = [
            {
                type: 'opportunity',
                title: 'Price Competitiveness',
                description: `Your base price of ${formatCurrency(price)} is ${price < competitors[1].price ? 'lower' : 'competitive'} compared to market leaders.`,
                impact: 'high',
                confidence: 0.89
            },
            {
                type: 'trend',
                title: 'High Demand',
                description: `High search volume for "${productName}" on marketplaces this week.`,
                impact: 'medium',
                confidence: 0.75
            },
            {
                type: 'threat',
                title: 'Aggressive Discounting',
                description: 'Competitors on Shopee are offering up to 25% discounts.',
                impact: 'medium',
                confidence: 0.82
            }
        ]

        return NextResponse.json({ competitors, insights })

    } catch (error) {
        console.error('Analysis failed:', error)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }
}

function generatePriceHistory(basePrice: number) {
    const history: { date: string; price: number }[] = []
    const now = new Date()
    for (let i = 4; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - (i * 7))
        history.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(basePrice * (1 + (Math.random() * 0.1 - 0.05)))
        })
    }
    return history
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}
