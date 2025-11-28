import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const {
      productName,
      hpp,
      currentPrice,
      targetProfit,
      dailyVolume,
      season,
      fixedCosts = 5000000,
      initialInvestment = 50000000
    } = await request.json()

    if (!productName || !hpp || !currentPrice || !targetProfit || !dailyVolume) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const seasonMultipliers = {
      peak: 1.5,
      normal: 1.0,
      'off-peak': 0.7
    }

    const seasonMultiplier = seasonMultipliers[season as keyof typeof seasonMultipliers] || 1.0
    const monthlyVolume = dailyVolume * 30 * seasonMultiplier
    const monthlyRevenue = monthlyVolume * currentPrice
    const monthlyCosts = monthlyVolume * hpp
    const monthlyProfit = monthlyRevenue - monthlyCosts

    // Calculate break-even point
    const contributionMargin = currentPrice - hpp
    const breakEvenUnits = fixedCosts / contributionMargin
    const breakEvenRevenue = breakEvenUnits * currentPrice

    // Calculate ROI
    const annualProfit = monthlyProfit * 12
    const roi = (annualProfit / initialInvestment) * 100

    // Calculate cash flow
    const monthlyCashFlow = monthlyProfit - (fixedCosts / 12)

    // Generate 12-month projection data
    const projections = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 0; i < 12; i++) {
      const seasonalFactor = i >= 10 || i <= 1 ? 1.2 : i >= 5 && i <= 7 ? 0.8 : 1.0
      const adjustedVolume = monthlyVolume * seasonalFactor

      projections.push({
        month: monthNames[i],
        revenue: adjustedVolume * currentPrice,
        profit: adjustedVolume * (currentPrice - hpp) - fixedCosts,
        costs: adjustedVolume * hpp + fixedCosts,
        breakEven: breakEvenRevenue
      })
    }

    // Generate sensitivity analysis
    const sensitivity = [
      {
        scenario: 'Best Case (+20% Volume)',
        revenue: monthlyRevenue * 1.2,
        profit: monthlyProfit * 1.2,
        margin: ((monthlyProfit * 1.2) / (monthlyRevenue * 1.2)) * 100
      },
      {
        scenario: 'Base Case',
        revenue: monthlyRevenue,
        profit: monthlyProfit,
        margin: (monthlyProfit / monthlyRevenue) * 100
      },
      {
        scenario: 'Worst Case (-20% Volume)',
        revenue: monthlyRevenue * 0.8,
        profit: monthlyProfit * 0.8,
        margin: ((monthlyProfit * 0.8) / (monthlyRevenue * 0.8)) * 100
      },
      {
        scenario: 'Costs +10%',
        revenue: monthlyRevenue,
        profit: monthlyProfit - (monthlyCosts * 0.1),
        margin: ((monthlyProfit - (monthlyCosts * 0.1)) / monthlyRevenue) * 100
      }
    ]

    // AI-powered insights
    let aiInsights = []
    try {
      const zai = await ZAI.create()

      const insightPrompt = `
        Analyze this business projection and provide actionable insights:
        
        Product: ${productName}
        HPP: Rp ${hpp.toLocaleString('id-ID')}
        Current Price: Rp ${currentPrice.toLocaleString('id-ID')}
        Target Profit: ${targetProfit}%
        Daily Volume: ${dailyVolume}
        Season: ${season}
        
        Monthly Metrics:
        - Revenue: Rp ${monthlyRevenue.toLocaleString('id-ID')}
        - Profit: Rp ${monthlyProfit.toLocaleString('id-ID')}
        - Break Even: Rp ${breakEvenRevenue.toLocaleString('id-ID')}
        - ROI: ${roi.toFixed(1)}%
        
        Provide 3-5 specific recommendations for improving profitability and managing risks.
        Consider market trends, operational efficiency, and financial management.
      `

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a business consultant specializing in UMKM businesses in Indonesia. Provide practical, actionable advice.'
          },
          {
            role: 'user',
            content: insightPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })

      const aiResponse = completion.choices[0]?.message?.content
      if (aiResponse) {
        aiInsights = aiResponse.split('\n').filter((line: string) => line.trim().length > 0)
      }

    } catch (aiError) {
      console.error('AI insights failed:', aiError)
      aiInsights = [
        'Focus on increasing sales volume to improve economies of scale',
        'Monitor and control variable costs to maintain healthy margins',
        'Consider seasonal promotions during peak seasons',
        'Implement inventory management to reduce waste'
      ]
    }

    return NextResponse.json({
      success: true,
      projections: {
        monthly: projections,
        summary: {
          monthlyRevenue,
          monthlyProfit,
          breakEvenPoint: breakEvenRevenue,
          roi,
          cashFlow: monthlyCashFlow,
          monthlyVolume,
          contributionMargin
        },
        sensitivity,
        aiInsights
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Business projection error:', error)
    return NextResponse.json(
      { error: 'Failed to generate business projection' },
      { status: 500 }
    )
  }
}