import { useEffect, useMemo, useState } from 'react';
import { Home, Send, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:3032';

interface Option {
  id: string;
  name: string;
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Failed to read the photo file.'));
    reader.readAsDataURL(file);
  });
}

export function WorkOrderCreatePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [categories, setCategories] = useState<Option[]>([]);
  const [facilities, setFacilities] = useState<Option[]>([]);
  const [title, setTitle] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [description, setDescription] = useState('');
  const [locationFloor, setLocationFloor] = useState('');
  const [locationRoom, setLocationRoom] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [categoryResponse, facilityResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/facility-helpdesk/issue-category/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ per_page: 200 }),
          }),
          fetch(`${API_BASE_URL}/api/facility-helpdesk/facility-asset/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ per_page: 200 }),
          }),
        ]);

        const categoryData = await categoryResponse.json();
        const facilityData = await facilityResponse.json();

        if (categoryResponse.ok && categoryData.data) {
          setCategories(
            categoryData.data.map((row: any) => ({
              id: row.category_id ?? row.id ?? '',
              name: row.category_name ?? row.name ?? 'Unknown',
            })),
          );
        }

        if (facilityResponse.ok && facilityData.data) {
          const mappedFacilities = facilityData.data.map((row: any) => ({
            id: row.facility_id ?? row.id ?? '',
            name: row.facility_name ?? row.name ?? 'Unknown',
          }));
          setFacilities(mappedFacilities);
          setFacilityId((current) => current || mappedFacilities[0]?.id || '');
        }
      } catch {
        // ignore master data errors; submit will surface missing data if needed
      }
    };

    load();
  }, []);

  const getAuthIdentity = () => {
    try {
      const saved = localStorage.getItem('auth_user');
      const email = localStorage.getItem('auth_user_email') || '';
      if (!saved) return { userId: null, email };
      const parsed = JSON.parse(saved);
      return {
        userId: parsed?.id || parsed?.user_id || null,
        email,
      };
    } catch {
      return { userId: null, email: localStorage.getItem('auth_user_email') || '' };
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { userId: actorId, email: actorEmail } = getAuthIdentity();
    if (!actorId && !actorEmail) {
      setError('Silakan login terlebih dahulu.');
      return;
    }

    if (!facilityId || !categoryId || !title.trim() || !description.trim()) {
      setError('Damage title, category, asset, and detailed description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const photoBeforeUrl = photoFile ? await fileToDataUrl(photoFile) : '';
      const response = await fetch(`${API_BASE_URL}/api/maintenance_report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(actorId ? { 'X-User-Id': String(actorId) } : {}),
        },
        body: JSON.stringify({
          ...(actorId ? { actor_id: String(actorId) } : { actor_email: actorEmail }),
          facility_id: facilityId,
          category_id: categoryId,
          title: title.trim(),
          description: description.trim(),
          urgency,
          location_floor: locationFloor.trim(),
          location_room: locationRoom.trim(),
          location_detail: locationDetail.trim(),
          photo_before_url: photoBeforeUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to create the work order.');
        return;
      }

      onNavigate('/dashboard');
    } catch {
      setError('Server is unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const photoLabel = useMemo(() => {
    if (photoFile) return photoFile.name;
    return 'Click to upload a photo';
  }, [photoFile]);

  return (
    <section className="px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] border border-slate-200/40 bg-gradient-to-r from-white via-blue-50/40 to-white p-8 shadow-[0_40px_120px_rgba(15,23,42,0.08)] sm:p-12">
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-200/40 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                New Work Order
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Create a Damage Report</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-2xl">Fill in the damage details and send them to the WO Manager for approval.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
            >
              <Home className="h-4 w-4" />
              Back
            </button>

          </div>

          {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleCreate} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                Damage Title <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-6 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                placeholder="Example: Leaking AC dripping onto the floor..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  Category <span className="text-red-500">*</span>
                </span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  Urgency Level <span className="text-red-500">*</span>
                </span>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                >
                  <option value="low">Low (3-7 Days)</option>
                  <option value="medium">Normal (1-2 Days)</option>
                  <option value="high">High (ASAP)</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                Detailed Description <span className="text-red-500">*</span>
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-40 w-full rounded-[26px] border border-slate-200 bg-slate-50 px-6 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                placeholder="Describe the damage in detail..."
              />
            </label>

              <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Floor Location</span>
                <input
                  type="text"
                  value={locationFloor}
                  onChange={(e) => setLocationFloor(e.target.value)}
                  className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                  placeholder="Contoh: 3"
                />
              </label>

              <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-900">Room Name</span>
                <input
                  type="text"
                  value={locationRoom}
                  onChange={(e) => setLocationRoom(e.target.value)}
                  className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                  placeholder="Contoh: R. Meeting"
                />
              </label>

              <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-900">Position Detail</span>
                <input
                  type="text"
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  className="w-full rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 shadow-sm"
                  placeholder="Pojok kanan..."
                />
              </label>
            </div>

            <div className="hidden">
              <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)}>
                <option value="">Select asset</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
                <span className="mb-2 block text-sm font-semibold text-slate-900">Problem Photo (Optional)</span>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/80 to-white px-8 py-12 text-center transition hover:border-blue-300 hover:bg-blue-50 shadow-sm">
                <Upload className="h-12 w-12 text-blue-600" />
                <span className="mt-4 text-lg font-semibold text-slate-900">{photoLabel}</span>
                <span className="mt-1 text-sm text-slate-500">Format: JPG, PNG, GIF. Maximum 5MB</span>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700">
                  <ImageIcon className="h-4 w-4" />
                  Upload photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPhotoFile(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setPhotoPreview(typeof reader.result === 'string' ? reader.result : '');
                      reader.readAsDataURL(file);
                    } else {
                      setPhotoPreview('');
                    }
                  }}
                />
              </label>

              {photoPreview && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <img src={photoPreview} alt="Problem photo preview" className="h-44 w-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-4 pt-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => onNavigate('/dashboard')}
                className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 px-6 py-3 text-base font-bold text-white shadow-[0_14px_40px_rgba(37,99,235,0.18)] hover:shadow-[0_18px_48px_rgba(37,99,235,0.22)] disabled:opacity-60 sm:w-auto"
              >
                <Send className="h-5 w-5" />
                {isSubmitting ? 'Saving...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default WorkOrderCreatePage;
