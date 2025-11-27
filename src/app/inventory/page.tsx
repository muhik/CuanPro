import { InventoryTable } from '@/components/inventory-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InventoryPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Inventory Management</h1>
                <p className="text-slate-600 dark:text-slate-400">Track stock, manage products, and handle reorders.</p>
            </div>

            <InventoryTable />
        </div>
    )
}
