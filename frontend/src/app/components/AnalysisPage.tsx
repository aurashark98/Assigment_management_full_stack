import { useEffect, useMemo, useState } from 'react';
import { MessageCircleQuestion, Sparkles } from 'lucide-react';

export function AnalysisPage() {
  const [devices, setDevices] = useState<Array<any>>([]);

  useEffect(() => {
    // Generate placeholder analytics data
    const now = Date.now();
    const dummy = Array.from({ length: 6 }).map((_, i) => {
      const base = 60 * 60 * 1000;
      // Use simple human-friendly labels instead of real Date objects to avoid Date parsing issues
      const metrics = Array.from({ length: 12 }).map((j) => ({
        tsLabel: `${11 - j}h ago`,
        temperature: 30 + Math.round(Math.random() * 10) + (i % 2 === 0 ? 0 : -2),
        voltage: 220 + Math.round(Math.random() * 10) - 5,
        current: +(0.5 + Math.random() * 2).toFixed(2),
        errorRate: +(Math.random() * 3).toFixed(2),
      }));

      return {
        id: `dev-${1000 + i}`,
        name: `Sensor ${i + 1}`,
        location: ['Lab A', 'Warehouse', 'Office'][i % 3],
        status: i % 3 === 0 ? 'Healthy' : i % 3 === 1 ? 'Notice' : 'Warning',
        metrics,
      };
    });

    setDevices(dummy);
  }, []);

  const summary = useMemo(() => {
    const total = devices.length;
    const healthy = devices.filter((d) => d.status === 'Healthy').length;
    const warnings = devices.filter((d) => d.status === 'Warning').length;
    return { total, healthy, warnings };
  }, [devices]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 mt-6 rounded-2xl border border-slate-200/60 bg-gradient-to-r from-white via-blue-50/30 to-white p-6 shadow-[0_4px_12px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
          <Sparkles className="h-3.5 w-3.5" />
          Analysis
        </div>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Analysis Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">This page shows sample analytics data for the Assignment Management website.</p>

        <div className="mt-4 rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 text-sm text-slate-700 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-blue-700">
            <MessageCircleQuestion className="h-4 w-4" />
            Need help understanding this page?
          </div>
          <p className="mt-2 text-slate-600">
            Ask the AI assistant in the bottom-right corner if you want a quick explanation of the current page.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-50/50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase text-blue-600 tracking-wider">Total Items</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{summary.total}</div>
          </div>
          <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-50/50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Healthy</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{summary.healthy}</div>
          </div>
          <div className="rounded-xl border border-red-200/60 bg-gradient-to-br from-red-50 to-red-50/50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase text-red-600 tracking-wider">Warnings</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{summary.warnings}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {devices.map((d) => (
          <div key={d.id} className="group relative rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] hover:border-blue-200/80">
            {/* Subtle gradient hover effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold uppercase text-blue-600 tracking-wider">{d.location}</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{d.name}</div>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    d.status === 'Healthy'
                      ? 'bg-emerald-100 text-emerald-700'
                      : d.status === 'Warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  } shadow-sm`}>
                    {d.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs font-mono text-slate-500 tracking-wider">ID: {d.id}</div>
              
              <div className="mt-4 text-xs font-bold uppercase text-slate-600 tracking-wider">Recent Metrics</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <div className="text-xs text-slate-500">Temperature</div>
                  <div className="mt-1 font-bold text-slate-900">{d.metrics[d.metrics.length - 1].temperature}°C</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <div className="text-xs text-slate-500">Voltage</div>
                  <div className="mt-1 font-bold text-slate-900">{d.metrics[d.metrics.length - 1].voltage}V</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <div className="text-xs text-slate-500">Current</div>
                  <div className="mt-1 font-bold text-slate-900">{d.metrics[d.metrics.length - 1].current}A</div>
                </div>
              </div>

              <div className="mt-4 text-xs font-bold uppercase text-slate-600 tracking-wider">12-Hour Trend</div>
              <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-2">
                {d.metrics.map((m: any, idx: number) => (
                  <div key={idx} className="min-w-[60px] rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
                    <div className="text-xs text-slate-500">{m.tsLabel}</div>
                    <div className="mt-1 font-bold text-sm text-slate-900">{m.temperature}°</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-amber-200/60 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
        <strong>Note:</strong> This is placeholder analytics data for UI demonstration. Real integration will be added later.
      </div>
    </div>
  );
}
