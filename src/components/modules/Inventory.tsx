import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Wrench,
  Clock,
  Layers,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { InventoryTransaction } from '../../types';

export const Inventory: React.FC = () => {
  const {
    inventory,
    inventoryTransactions,
    addInventoryTransaction,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'raw_material' | 'component' | 'spare_part'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTxModal, setShowTxModal] = useState(false);

  // Transaction form state
  const [txItemId, setTxItemId] = useState('SP-104');
  const [txType, setTxType] = useState<InventoryTransaction['type']>('receipt');
  const [txQty, setTxQty] = useState(1);
  const [txNotes, setTxNotes] = useState('Manual dock receipt replenishment');

  const filteredItems = inventory.filter((item) => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const sp104 = inventory.find((i) => i.id === 'SP-104');
  const mat021 = inventory.find((i) => i.id === 'MAT-021');

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Boxes className="h-5 w-5 text-amber-500" />
            Inventory & Materials Management
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Multi-echelon stock levels, dynamic reservations, spare-part readiness, and immutable transaction ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTxModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Post Stock Transaction</span>
          </button>
        </div>
      </div>

      {/* Critical Spare Part & Raw Material Readiness Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SP-104 Card */}
        <div
          className="p-4 rounded-xl border shadow-xs flex items-start justify-between"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                SP-104 Ceramic Bearing
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: 'var(--info-bg)',
                  color: 'var(--info-text)',
                  borderColor: 'var(--border)',
                }}
              >
                M-004 Spare
              </span>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              Matched angular contact hybrid set for high-speed spindle overhaul.
            </p>
            <div className="flex items-center gap-3 text-xs pt-1" style={{ color: 'var(--text-secondary)' }}>
              <span>On Hand: <strong style={{ color: 'var(--text-primary)' }}>{sp104?.onHand}</strong></span>
              <span>Reserved: <strong className="text-amber-600 dark:text-amber-400">{sp104?.reserved}</strong></span>
              <span>Available: <strong className="text-emerald-600 dark:text-emerald-400">{sp104?.available}</strong></span>
            </div>
          </div>
          <div className="text-right">
            {sp104 && sp104.available <= 0 ? (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                Maintenance Readiness Risk
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                Ready for WO-204
              </span>
            )}
          </div>
        </div>

        {/* MAT-021 Titanium Card */}
        <div
          className="p-4 rounded-xl border shadow-xs flex items-start justify-between"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                MAT-021 Titanium Billet
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Low Buffer
              </span>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              Ti-6Al-4V vacuum billet for ORDER-1042 impellers. Days of cover: 3.5 days.
            </p>
            <div className="flex items-center gap-3 text-xs pt-1" style={{ color: 'var(--text-secondary)' }}>
              <span>On Hand: <strong style={{ color: 'var(--text-primary)' }}>{mat021?.onHand} kg</strong></span>
              <span>Reserved: <strong className="text-amber-600 dark:text-amber-400">{mat021?.reserved} kg</strong></span>
              <span>Available: <strong className="text-amber-600 dark:text-amber-400">{mat021?.available} kg</strong></span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              PO-902 in Customs
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search items by SKU or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {(['all', 'spare_part', 'raw_material', 'component'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer border font-semibold ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{
                backgroundColor: categoryFilter === cat ? undefined : 'var(--surface-secondary)',
                borderColor: categoryFilter === cat ? undefined : 'var(--border)',
                color: categoryFilter === cat ? undefined : 'var(--text-secondary)',
              }}
            >
              {cat === 'all' ? 'All Categories' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Table */}
      <div
        className="border rounded-xl overflow-hidden shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead
              className="border-b uppercase text-[10px] tracking-wider font-bold"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <tr>
                <th className="py-2.5 px-4 whitespace-nowrap">Item SKU / Name</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Category</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">On Hand</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Reserved</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Available</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Reorder Point</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Days Cover</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Stockout Risk</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Storage Location</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredItems.map((item) => {
                const isRisk = item.stockoutRisk === 'high';
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.id}</div>
                      <div className="text-[11px] max-w-xs truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</div>
                    </td>
                    <td className="py-3 px-4 capitalize whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                      {item.onHand} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {item.reserved} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {item.available} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {item.reorderPoint} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                      {item.daysOfCover}d
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          isRisk
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            : item.stockoutRisk === 'medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {item.stockoutRisk}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {item.storageLocation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Ledger Section */}
      <div
        className="rounded-xl p-4 space-y-3 border shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Inventory Transaction Audit Ledger
            </h3>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Audit-ready immutable log</span>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {inventoryTransactions.slice(0, 6).map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    tx.type === 'receipt'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : tx.type === 'reservation'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                  }`}
                >
                  {tx.type}
                </span>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {tx.itemId} · {tx.itemName}
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{tx.notes}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                  {tx.type === 'issue' ? '-' : '+'}
                  {tx.quantity} units
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {tx.performedBy} · Ref: {tx.referenceId}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="border rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Boxes className="h-4 w-4 text-amber-500" />
                Post Inventory Transaction
              </h3>
              <button
                onClick={() => setShowTxModal(false)}
                className="hover:opacity-75 cursor-pointer text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Target Item</label>
                <select
                  value={txItemId}
                  onChange={(e) => setTxItemId(e.target.value)}
                  className="w-full p-2 rounded-lg border font-medium"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} - {item.name} ({item.onHand} on hand)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Transaction Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border font-medium"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="receipt">Receipt (+ Stock)</option>
                    <option value="issue">Issue (- Stock)</option>
                    <option value="reservation">Reservation</option>
                    <option value="adjustment">Cycle Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={txQty}
                    onChange={(e) => setTxQty(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border font-medium"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Notes / Reason</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border font-medium"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setShowTxModal(false)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addInventoryTransaction({
                    itemId: txItemId,
                    type: txType,
                    quantity: txQty,
                    notes: txNotes,
                  });
                  setShowTxModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-sm"
              >
                Post Ledger Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
