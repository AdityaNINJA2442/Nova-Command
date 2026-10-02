import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Cpu,
  Layers,
  Users,
  Wrench,
  Boxes,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const {
    machines,
    orders,
    employees,
    workOrders,
    inventory,
    purchaseOrders,
    setActiveTab,
    setSelectedMachineId,
    setSelectedOrderId,
  } = useManufacturingStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedMachines = q
    ? machines.filter((m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
    : machines.slice(0, 3);

  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q)
      )
    : orders.slice(0, 3);

  const matchedEmployees = q
    ? employees.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q)
      )
    : employees.slice(0, 3);

  const matchedWOs = q
    ? workOrders.filter(
        (w) =>
          w.id.toLowerCase().includes(q) ||
          w.machineId.toLowerCase().includes(q) ||
          w.issue.toLowerCase().includes(q)
      )
    : workOrders.slice(0, 2);

  const matchedInventory = q
    ? inventory.filter((i) => i.id.toLowerCase().includes(q) || i.name.toLowerCase().includes(q))
    : inventory.slice(0, 3);

  const matchedSuppliers = q
    ? purchaseOrders.filter(
        (p) =>
          p.supplier.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.itemName.toLowerCase().includes(q)
      )
    : purchaseOrders.slice(0, 2);

  const totalResults =
    matchedMachines.length +
    matchedOrders.length +
    matchedEmployees.length +
    matchedWOs.length +
    matchedInventory.length +
    matchedSuppliers.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 pt-16 sm:pt-20 backdrop-blur-sm">
      <div
        className="border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        style={{
          backgroundColor: '#141D2A',
          borderColor: '#243044',
          color: '#F8FAFC',
        }}
      >
        {/* Search Input Bar (Fixed Header) */}
        <div
          className="flex items-center px-4 py-3.5 border-b gap-3 shrink-0"
          style={{
            borderColor: '#243044',
            backgroundColor: '#141D2A',
          }}
        >
          <Search className="h-5 w-5 shrink-0" style={{ color: '#22D3EE' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search machines, orders, employees, work orders, inventory..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400 font-medium"
            style={{ color: '#F8FAFC' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs px-1.5 py-0.5 rounded hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
              style={{ color: '#94A3B8' }}
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
            style={{ color: '#94A3B8' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List (Scrollable) */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 min-h-0 text-xs">
          {totalResults === 0 ? (
            <div className="text-center py-8" style={{ color: '#94A3B8' }}>
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" style={{ color: '#64748B' }} />
              <p className="font-semibold" style={{ color: '#E2E8F0' }}>No results found for "{query}"</p>
              <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>Try searching for M-004, ORDER-1042, Marcus, or SP-104</p>
            </div>
          ) : (
            <>
              {/* MACHINES */}
              {matchedMachines.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#22D3EE' }}>
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Machines ({matchedMachines.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedMachines.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMachineId(m.id);
                          setActiveTab('machines');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer hover:border-cyan-500/50 hover:bg-[#162235]"
                        style={{
                          backgroundColor: '#111927',
                          borderColor: '#243044',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: '#F8FAFC' }}>{m.id}</span>
                          <span className="truncate max-w-xs font-medium" style={{ color: '#94A3B8' }}>{m.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border"
                            style={
                              m.status === 'running'
                                ? { backgroundColor: 'rgba(6, 78, 59, 0.6)', color: '#34D399', borderColor: 'rgba(16, 185, 129, 0.3)' }
                                : { backgroundColor: 'rgba(120, 53, 15, 0.6)', color: '#FBBF24', borderColor: 'rgba(245, 158, 11, 0.3)' }
                            }
                          >
                            {m.status}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" style={{ color: '#64748B' }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {matchedOrders.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#34D399' }}>
                    <Layers className="h-3.5 w-3.5" />
                    <span>Orders ({matchedOrders.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedOrders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSelectedOrderId(o.id);
                          setActiveTab('orders');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer hover:border-cyan-500/50 hover:bg-[#162235]"
                        style={{
                          backgroundColor: '#111927',
                          borderColor: '#243044',
                        }}
                      >
                        <div>
                          <span className="font-bold" style={{ color: '#F8FAFC' }}>{o.id}</span>
                          <span className="ml-2 font-medium" style={{ color: '#94A3B8' }}>{o.customer}</span>
                          <span className="text-[10px] block truncate" style={{ color: '#64748B' }}>{o.product}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border"
                            style={
                              o.deliveryRisk === 'high'
                                ? { backgroundColor: 'rgba(136, 19, 55, 0.6)', color: '#FDA4AF', borderColor: 'rgba(244, 63, 94, 0.3)' }
                                : { backgroundColor: 'rgba(6, 78, 59, 0.6)', color: '#34D399', borderColor: 'rgba(16, 185, 129, 0.3)' }
                            }
                          >
                            {o.deliveryRisk} Risk
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" style={{ color: '#64748B' }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EMPLOYEES */}
              {matchedEmployees.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#818CF8' }}>
                    <Users className="h-3.5 w-3.5" />
                    <span>Employees & Technicians ({matchedEmployees.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedEmployees.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => {
                          setActiveTab('workforce');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer hover:border-cyan-500/50 hover:bg-[#162235]"
                        style={{
                          backgroundColor: '#111927',
                          borderColor: '#243044',
                        }}
                      >
                        <div>
                          <span className="font-bold" style={{ color: '#F8FAFC' }}>
                            {e.name || (e as any).fullName || (e as any).employeeName || e.id}
                          </span>
                          <span className="ml-2 font-medium" style={{ color: '#94A3B8' }}>
                            ({e.role})
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: '#1E293B',
                            color: '#CBD5E1',
                            borderColor: '#334155',
                          }}
                        >
                          {e.availability}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* WORK ORDERS */}
              {matchedWOs.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#FBBF24' }}>
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Maintenance Work Orders ({matchedWOs.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedWOs.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setActiveTab('maintenance');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer hover:border-cyan-500/50 hover:bg-[#162235]"
                        style={{
                          backgroundColor: '#111927',
                          borderColor: '#243044',
                        }}
                      >
                        <div>
                          <span className="font-bold" style={{ color: '#F8FAFC' }}>{w.id}</span>
                          <span className="ml-2 font-medium" style={{ color: '#94A3B8' }}>{w.machineId}</span>
                          <span className="text-[10px] block truncate" style={{ color: '#64748B' }}>{w.issue}</span>
                        </div>
                        <span
                          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: 'rgba(120, 53, 15, 0.6)',
                            color: '#FBBF24',
                            borderColor: 'rgba(245, 158, 11, 0.3)',
                          }}
                        >
                          {w.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* INVENTORY */}
              {matchedInventory.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#22D3EE' }}>
                    <Boxes className="h-3.5 w-3.5" />
                    <span>Inventory & Spare Parts ({matchedInventory.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedInventory.map((i) => (
                      <button
                        key={i.id}
                        onClick={() => {
                          setActiveTab('inventory');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer hover:border-cyan-500/50 hover:bg-[#162235]"
                        style={{
                          backgroundColor: '#111927',
                          borderColor: '#243044',
                        }}
                      >
                        <div>
                          <span className="font-bold" style={{ color: '#F8FAFC' }}>{i.id}</span>
                          <span className="ml-2 font-medium" style={{ color: '#94A3B8' }}>{i.name}</span>
                        </div>
                        <span className="font-mono font-bold" style={{ color: '#34D399' }}>
                          {i.available} available
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts (Fixed Footer) */}
        <div
          className="px-4 py-2 border-t text-[11px] flex items-center justify-between shrink-0"
          style={{
            backgroundColor: '#111927',
            borderColor: '#243044',
            color: '#94A3B8',
          }}
        >
          <span>Use <strong style={{ color: '#E2E8F0' }}>ESC</strong> to close</span>
          <span>Tip: Press <strong style={{ color: '#E2E8F0' }}>⌘K</strong> or <strong style={{ color: '#E2E8F0' }}>Ctrl+K</strong> anywhere</span>
        </div>
      </div>
    </div>
  );
};
