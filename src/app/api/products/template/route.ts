import { NextResponse } from 'next/server'

export async function GET() {
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

    const exampleRow = [
        'Contoh Produk',
        'Deskripsi produk anda',
        '15000',
        '0.3',
        '25000',
        '10000',
        '2000',
        '2000',
        '0.05',
        '1',
        'Makanan',
        'PROD-001'
    ]

    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n')

    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="template-import-produk.csv"'
        }
    })
}
