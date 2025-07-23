import { NextRequest, NextResponse } from 'next/server'

const DEFILLAMA_API_BASE = 'https://api.llama.fi'

// DeFi Total Value Locked (TVL) verilerini al
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chain = searchParams.get('chain') || 'all' // 'ethereum', 'bsc', 'polygon', etc.

    // TVL genel bilgileri
    const [tvlResponse, protocolsResponse] = await Promise.all([
      fetch(`${DEFILLAMA_API_BASE}/charts`),
      fetch(`${DEFILLAMA_API_BASE}/protocols`)
    ])

    if (!tvlResponse.ok || !protocolsResponse.ok) {
      throw new Error('Failed to fetch DeFi data')
    }

    const tvlData = await tvlResponse.json()
    const protocolsData = await protocolsResponse.json()

    // Son 30 günün TVL verilerini al
    const recentTVL = tvlData.slice(-30).map((item: any) => ({
      date: new Date(item.date * 1000).toISOString().split('T')[0],
      totalLiquidityUSD: item.totalLiquidityUSD || 0
    }))

    // En büyük 20 protokolü al
    const topProtocols = protocolsData
      .filter((protocol: any) => protocol.tvl > 0)
      .sort((a: any, b: any) => b.tvl - a.tvl)
      .slice(0, 20)
      .map((protocol: any) => ({
        name: protocol.name,
        symbol: protocol.symbol,
        tvl: protocol.tvl,
        change_1h: protocol.change_1h || 0,
        change_1d: protocol.change_1d || 0,
        change_7d: protocol.change_7d || 0,
        mcap: protocol.mcap || 0,
        category: protocol.category,
        chains: protocol.chains || [],
        logo: protocol.logo || null
      }))

    // Chain bazında TVL dağılımı
    const chainTVL: { [key: string]: number } = {}
    protocolsData.forEach((protocol: any) => {
      if (protocol.chains && Array.isArray(protocol.chains)) {
        protocol.chains.forEach((chain: string) => {
          chainTVL[chain] = (chainTVL[chain] || 0) + (protocol.chainTvls?.[chain] || 0)
        })
      }
    })

    const topChains = Object.entries(chainTVL)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([name, tvl]) => ({ name, tvl }))

    // Kategori bazında TVL
    const categoryTVL: { [key: string]: number } = {}
    protocolsData.forEach((protocol: any) => {
      if (protocol.category && protocol.tvl) {
        categoryTVL[protocol.category] = (categoryTVL[protocol.category] || 0) + protocol.tvl
      }
    })

    const topCategories = Object.entries(categoryTVL)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([name, tvl]) => ({ name, tvl }))

    // Toplam TVL hesapla
    const totalTVL = recentTVL[recentTVL.length - 1]?.totalLiquidityUSD || 0
    const previousTVL = recentTVL[recentTVL.length - 2]?.totalLiquidityUSD || 0
    const tvlChange24h = totalTVL > 0 && previousTVL > 0 ? ((totalTVL - previousTVL) / previousTVL) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTVL,
          tvlChange24h,
          protocolCount: protocolsData.length,
          chainCount: Object.keys(chainTVL).length
        },
        historicalTVL: recentTVL,
        topProtocols,
        chainDistribution: topChains,
        categoryDistribution: topCategories
      }
    })

  } catch (error) {
    console.error('Error fetching DeFi data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch DeFi TVL data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
