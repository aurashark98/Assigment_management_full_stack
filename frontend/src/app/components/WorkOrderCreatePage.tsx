import { useEffect, useMemo, useState } from 'react';
import { Home, Image as ImageIcon, MapPin, Send, Sparkles, Upload } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:3032';

interface Option {
  id: string;
  name: string;
  code?: string;
  room?: string;
}

interface AuthIdentity {
  userId: string;
  email: string;
  fullName: string;
}

function getAuthIdentity(): AuthIdentity {
  try {
    const rawUser = localStorage.getItem('auth_user');
    const email = localStorage.getItem('auth_user_email') || '';
    if (!rawUser) {
      return { userId: '', email, fullName: '' };
    }

    const parsed = JSON.parse(rawUser) as { id?: string | number; user_id?: string | number; full_name?: string; username?: string };
    return {
      userId: String(parsed.user_id ?? parsed.id ?? ''),
      email,
      fullName: String(parsed.full_name ?? parsed.username ?? ''),
    };
  } catch {
    return {
      userId: '',
      email: localStorage.getItem('auth_user_email') || '',
      fullName: '',
    };
  }
}

function generateReportNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `RPT-${yyyy}${mm}${dd}-${hh}${mi}${ss}${ms}`;
}

async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`API response is not JSON (${response.status}): ${text.slice(0, 180)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse JSON from API (${response.status})`);
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Gagal membaca file foto.'));
    reader.readAsDataURL(file);
  });
}

export function WorkOrderCreatePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [categories, setCategories] = useState<Option[]>([]);
  const [facilities, setFacilities] = useState<Option[]>([]);
  const [reporterId, setReporterId] = useState('');
  const [title, setTitle] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [description, setDescription] = useState('');
  const [locationFloor, setLocationFloor] = useState('');
  const [locationRoom, setLocationRoom] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoadingMasterData(true);

      try {
        const identity = getAuthIdentity();
        if (!identity.email && !identity.userId && !identity.fullName) {
          setError('Silakan login terlebih dahulu.');
          return;
        }

        const [categoryResponse, facilityResponse, userResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/facility-helpdesk/issue-category/datatables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draw: 1, start: 0, length: 500 }),
          }),
          fetch(`${API_BASE_URL}/api/facility-helpdesk/facility-asset/datatables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draw: 1, start: 0, length: 1000 }),
          }),
          fetch(`${API_BASE_URL}/api/facility-helpdesk/app-user/datatables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draw: 1, start: 0, length: 500 }),
          }),
        ]);

        const [categoryData, facilityData, userData] = await Promise.all([
          parseJsonResponse(categoryResponse),
          parseJsonResponse(facilityResponse),
          parseJsonResponse(userResponse),
        ]);

        if (categoryResponse.ok) {
          const mappedCategories = (categoryData.data || []).map((row: any) => ({
            id: String(row.category_id ?? row.id ?? ''),
            name: String(row.category_name ?? row.name ?? 'Unknown'),
            code: String(row.category_code ?? row.code ?? ''),
          }));
          setCategories(mappedCategories);
          setCategoryId((current) => current || mappedCategories[0]?.id || '');
        }

        if (facilityResponse.ok) {
          const mappedFacilities = (facilityData.data || [])
            .map((row: any) => ({
              id: String(row.facility_id ?? row.id ?? ''),
              name: String(row.facility_name ?? row.name ?? 'Unknown'),
              code: String(row.facility_code ?? row.barcode ?? ''),
              room: String(row.room_name ?? ''),
            }))
            .sort((left: Option, right: Option) => left.name.localeCompare(right.name));
          setFacilities(mappedFacilities);
          setFacilityId((current) => current || mappedFacilities[0]?.id || '');
        }

        if (!userResponse.ok) {
          throw new Error(userData.message || 'Gagal memuat data user');
        }

        const users = userData.data || [];
        const identityEmail = identity.email.toLowerCase().trim();
        const identityName = identity.fullName.toLowerCase().trim();
        const identityUserId = identity.userId.trim();

        const matchedUser = users.find((user: any) => {
          const email = String(user.email || '').toLowerCase().trim();
          const fullName = String(user.full_name || '').toLowerCase().trim();
          const userId = String(user.user_id || '').trim();

          return (
            (identityUserId && userId === identityUserId) ||
            (identityEmail && email === identityEmail) ||
            (identityName && fullName === identityName)
          );
        });

        if (!matchedUser?.user_id) {
          throw new Error('Data requester tidak ditemukan di master user.');
        }

        setReporterId(String(matchedUser.user_id));
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Gagal memuat data master.';
        setError(message);
      } finally {
        setIsLoadingMasterData(false);
      }
    };

    load();
  }, []);

  const photoLabel = useMemo(() => {
    if (photoFile) return photoFile.name;
    return 'Klik untuk unggah foto';
  }, [photoFile]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!reporterId) {
      setError('Data requester belum siap. Silakan login ulang.');
      return;
    }

    if (!facilityId || !categoryId || !title.trim() || !description.trim()) {
      setError('Judul, kategori, aset, dan deskripsi wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const photoBeforeUrl = photoFile ? await fileToDataUrl(photoFile) : '';
      const response = await fetch(`${API_BASE_URL}/api/facility-helpdesk/maintenance-report/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': reporterId,
          'X-User-Role': 'REQUESTER',
        },
        body: JSON.stringify({
          report_number: generateReportNumber(),
          reporter_id: reporterId,
          category_id: categoryId,
          facility_id: facilityId,
          title: title.trim(),
          location_floor: locationFloor.trim() || null,
          location_room: locationRoom.trim() || null,
          location_detail: locationDetail.trim() || null,
          description: description.trim(),
          urgency,
          status: 'submitted',
          photo_before_url: photoBeforeUrl || null,
        }),
      });

      const result = await parseJsonResponse(response);

      if (!response.ok) {
        const firstError = Array.isArray(result.errors) && result.errors.length > 0 ? result.errors[0] : null;
        const detail = firstError ? `${firstError.field ? `${firstError.field}: ` : ''}${firstError.message || ''}` : '';
        throw new Error(detail || result.message || 'Gagal membuat work request.');
      }

      setTitle('');
      setFacilityId('');
      setCategoryId('');
      setUrgency('medium');
      setDescription('');
      setLocationFloor('');
      setLocationRoom('');
      setLocationDetail('');
      setPhotoFile(null);
      setPhotoPreview('');

      onNavigate('/dashboard');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Server tidak tersedia.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] border border-slate-200/40 bg-gradient-to-r from-white via-sky-50/35 to-white p-8 shadow-[0_40px_120px_rgba(15,23,42,0.08)] sm:p-12">
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-200/40 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                Requester Work Order
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Buat Work Request</h1>
                <p className="mt-2 max-w-2xl text-lg text-slate-600">
                  Isi data kerusakan, pilih aset, lalu kirim sebagai draft work request seperti di halaman requester lama.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
            >
              <Home className="h-4 w-4" />
              Kembali
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoadingMasterData && !error ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Memuat data kategori, aset, dan requester...
            </div>
          ) : null}

          <form onSubmit={handleCreate} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                Judul Kerusakan <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-6 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                placeholder="Contoh: AC Mati Total"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  Kategori <span className="text-red-500">*</span>
                </span>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  Tingkat Urgensi <span className="text-red-500">*</span>
                </span>
                <select
                  value={urgency}
                  onChange={(event) => setUrgency(event.target.value as 'low' | 'medium' | 'high')}
                  className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                >
                  <option value="low">Normal</option>
                  <option value="medium">Penting</option>
                  <option value="high">Darurat (Segera)</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                Deskripsi Detail <span className="text-red-500">*</span>
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-40 w-full rounded-[26px] border border-slate-200 bg-slate-50 px-6 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                placeholder="Jelaskan kondisi kerusakan secara detail..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Lokasi Lantai</span>
                <input
                  type="text"
                  value={locationFloor}
                  onChange={(event) => setLocationFloor(event.target.value)}
                  className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                  placeholder="Contoh: 3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Lokasi Ruangan</span>
                <input
                  type="text"
                  value={locationRoom}
                  onChange={(event) => setLocationRoom(event.target.value)}
                  className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                  placeholder="Contoh: Ruang Meeting"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Detail Lokasi</span>
                <input
                  type="text"
                  value={locationDetail}
                  onChange={(event) => setLocationDetail(event.target.value)}
                  className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                  placeholder="Contoh: Sisi Timur"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                Aset Fasilitas <span className="text-red-500">*</span>
              </span>
              <select
                value={facilityId}
                onChange={(event) => setFacilityId(event.target.value)}
                className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
              >
                <option value="">Pilih aset</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                    {facility.code ? ` (${facility.code})` : ''}
                    {facility.room ? ` - ${facility.room}` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                Data aset diambil dari master yang sama seperti halaman requester legacy.
              </p>
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-900">Foto Masalah (Opsional)</span>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/80 to-white px-8 py-12 text-center transition hover:border-blue-300 hover:bg-blue-50 shadow-sm">
                <Upload className="h-12 w-12 text-blue-600" />
                <span className="mt-4 text-lg font-semibold text-slate-900">{photoLabel}</span>
                <span className="mt-1 text-sm text-slate-500">Format: JPG, PNG, GIF. Maksimal 5MB</span>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700">
                  <ImageIcon className="h-4 w-4" />
                  Unggah foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setPhotoFile(file);

                    if (!file) {
                      setPhotoPreview('');
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => setPhotoPreview(typeof reader.result === 'string' ? reader.result : '');
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              {photoPreview && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <img src={photoPreview} alt="Preview foto masalah" className="h-44 w-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-4 pt-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => onNavigate('/dashboard')}
                className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingMasterData}
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 px-6 py-3 text-base font-bold text-white shadow-[0_14px_40px_rgba(37,99,235,0.18)] hover:shadow-[0_18px_48px_rgba(37,99,235,0.22)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Send className="h-5 w-5" />
                {isSubmitting ? 'Menyimpan...' : 'Kirim Work Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default WorkOrderCreatePage;
