import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, MessageCircleQuestion, RefreshCw, Sparkles } from 'lucide-react';

type IoTReading = {
  id: string | number;
  voltage: number;
  power: number;
  energy: number;
  created_at: string;
};

const IOT_DATA_URL = 'https://z-learn.my.id/api/data';

function toNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeReadings(payload: unknown): IoTReading[] {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] } | null)?.data)
      ? (payload as { data: unknown[] }).data
      : [];

  return rows
    .map((item, index) => {
      const record = item as Record<string, unknown>;
      return {
        id: (record.id ?? record.device_id ?? index + 1) as string | number,
        voltage: toNumber(record.voltage),
        power: toNumber(record.power),
        energy: toNumber(record.energy),
        created_at: String(record.created_at ?? record.time ?? record.timestamp ?? new Date().toISOString()),
      };
    })
    .filter((item) => item.created_at);
}

export function AnalysisPage() {
  const [readings, setReadings] = useState<IoTReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadReadings = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(IOT_DATA_URL);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error((payload as { message?: string })?.message || 'Gagal memuat data IoT.');
        }

        const normalized = normalizeReadings(payload).sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        if (isActive) {
          setReadings(normalized);
        }
      } catch (error) {
        if (isActive) {
          setReadings([]);
          setErrorMessage(error instanceof Error ? error.message : 'Gagal memuat data IoT.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadReadings();

    const intervalId = window.setInterval(loadReadings, 3000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const summary = useMemo(() => {
    const total = readings.length;
    const latest = readings[0] || null;
    const estimatedDaily = latest ? (latest.power * 24) / 1000 : 0;
    const estimatedMonthly = latest ? (estimatedDaily * 30) : 0;
    return {
      total,
      latest,
      estimatedDaily,
      estimatedMonthly,
    };
  }, [readings]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 mt-6 rounded-2xl border border-slate-200/60 bg-gradient-to-r from-white via-blue-50/30 to-white p-6 shadow-[0_4px_12px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
          <Sparkles className="h-3.5 w-3.5" />
          IoT Analysis
        </div>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Analysis Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Realtime data dari endpoint IoT untuk voltage, power, energy, dan timestamp.</p>

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
            <div className="text-xs font-bold uppercase text-blue-600 tracking-wider">Total Readings</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{summary.total}</div>
          </div>
          <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-50/50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Latest Voltage</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {summary.latest ? `${summary.latest.voltage.toFixed(2)} V` : '-'}
            </div>
          </div>
          <div className="rounded-xl border border-red-200/60 bg-gradient-to-br from-red-50 to-red-50/50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase text-red-600 tracking-wider">Latest Power</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {summary.latest ? `${summary.latest.power.toFixed(2)} W` : '-'}
            </div>
          </div>
          <div className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-50/50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase text-amber-600 tracking-wider">Latest Energy</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {summary.latest ? `${summary.latest.energy.toFixed(2)} kWh` : '-'}
            </div>
          </div>
          <div className="rounded-xl border border-sky-200/60 bg-gradient-to-br from-sky-50 to-sky-50/50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase text-sky-600 tracking-wider">Estimated Daily</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {summary.latest ? `${summary.estimatedDaily.toFixed(2)} kWh` : '-'}
            </div>
          </div>
          <div className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-violet-50/50 px-4 py-3 shadow-sm">
            <div className="text-xs font-bold uppercase text-violet-600 tracking-wider">Estimated Monthly</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {summary.latest ? `${summary.estimatedMonthly.toFixed(2)} kWh` : '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent IoT Readings</h3>
            <p className="text-sm text-slate-600">Data ditarik langsung dari API dan diperbarui otomatis setiap 3 detik.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Memuat data...' : 'Live update aktif'}
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">Gagal memuat data IoT</div>
              <div className="mt-1">{errorMessage}</div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-slate-200">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Voltage</th>
                <th className="px-4 py-3">Power</th>
                <th className="px-4 py-3">Energy</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {readings.length > 0 ? (
                readings.map((reading, index) => (
                  <tr key={`${reading.id}-${reading.created_at}-${index}`} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{reading.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{reading.voltage.toFixed(2)} V</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{reading.power.toFixed(2)} W</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{reading.energy.toFixed(2)} kWh</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(reading.created_at).toLocaleString('id-ID')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>
                    {isLoading ? 'Mengambil data dari API...' : 'Tidak ada data yang tersedia.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
