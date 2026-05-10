import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Eye, Home, Pencil, Send, Trash2, Wrench } from 'lucide-react';

const MAIN_API_BASE_URL = 'http://127.0.0.1:3032';

type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'pending_review'
  | 'rejected'
  | 'approved'
  | 'rejected_by_wom';

interface RequesterContext {
  user_id: string;
  email: string;
  role: 'REQUESTER' | 'WO_MANAGER' | 'TECHNICIAN' | 'SITE_MANAGER';
}

interface WorkRequestItem {
  report_id: string;
  report_number: string;
  title: string;
  description?: string;
  status: RequestStatus;
  assigned_to_id?: string | null;
  assigned_to_name?: string | null;
  facility_id: string;
  facility_name?: string | null;
  category_id: string;
  category_name?: string | null;
  location_floor?: string | null;
  location_room?: string | null;
  location_detail?: string | null;
  photo_before_url?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

interface FacilityAssetItem {
  facility_id: string;
  facility_name: string;
}

interface IssueCategoryItem {
  category_id: string;
  category_name: string;
}

interface WorkRequestFormState {
  title: string;
  description: string;
  facility_id: string;
  category_id: string;
  urgency: 'low' | 'medium' | 'high';
  location_floor: string;
  location_room: string;
  location_detail: string;
  photo_before_url: string | null;
  photoFile: File | null;
}

const INITIAL_FORM: WorkRequestFormState = {
  title: '',
  description: '',
  facility_id: '',
  category_id: '',
  urgency: 'medium',
  location_floor: '',
  location_room: '',
  location_detail: '',
  photo_before_url: null,
  photoFile: null,
};

const STATUS_META: Record<RequestStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  assigned: { label: 'Assigned', className: 'bg-violet-100 text-violet-700 border-violet-200' },
  in_progress: { label: 'In Progress', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  pending_review: { label: 'Pending Review', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected_by_wom: {
    label: 'Rejected by WO Manager',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
};

const APPROVAL_META: Record<RequestStatus, { label: string; className: string }> = {
  draft: {
    label: 'Not sent to WO Manager yet',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  submitted: {
    label: 'Waiting for WO Manager approval',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  assigned: {
    label: 'Approved by WO Manager',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  in_progress: {
    label: 'Sudah disetujui WO Manager',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  pending_review: {
    label: 'Sudah disetujui WO Manager',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: 'Rejected after processing',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  approved: {
    label: 'Final approved',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  rejected_by_wom: {
    label: 'Rejected by WO Manager',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
};

function getAuthEmail(): string {
  return localStorage.getItem('auth_user_email') || '';
}

function getAuthUserId(): string {
  try {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { id?: string | number; user_id?: string | number };
    return String(parsed.user_id ?? parsed.id ?? '');
  } catch {
    return '';
  }
}

async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!contentType.toLowerCase().includes('application/json')) {
    const snippet = text.slice(0, 180);
    throw new Error(`API response bukan JSON (${response.status}): ${snippet}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse JSON from API (${response.status})`);
  }
}

export function UserWorkOrderDashboard({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const [context, setContext] = useState<RequesterContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [requests, setRequests] = useState<WorkRequestItem[]>([]);
  const [facilityAssets, setFacilityAssets] = useState<FacilityAssetItem[]>([]);
  const [issueCategories, setIssueCategories] = useState<IssueCategoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<WorkRequestFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDraft, setEditingDraft] = useState<WorkRequestItem | null>(null);

  const sortedRequests = useMemo(
    () => [...requests].sort((a, b) => new Date(b.updated_at || b.created_at || '').getTime() - new Date(a.updated_at || a.created_at || '').getTime()),
    [requests],
  );

  const fetchContext = async (): Promise<RequesterContext | null> => {
    const actorId = getAuthUserId();
    const actorEmail = getAuthEmail();

    if (!actorId && !actorEmail) {
      setErrorMessage('Session tidak ditemukan. Silakan login ulang.');
      return null;
    }

    const actor: RequesterContext = {
      user_id: actorId,
      email: actorEmail,
      role: 'REQUESTER',
    };

    setContext(actor);
    return actor;
  };

  const fetchMasterData = async () => {
    const [assetResponse, categoryResponse] = await Promise.all([
      fetch(`${MAIN_API_BASE_URL}/api/facility-helpdesk/facility-asset/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ per_page: 500 }),
      }),
      fetch(`${MAIN_API_BASE_URL}/api/facility-helpdesk/issue-category/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ per_page: 500 }),
      }),
    ]);

    const assetResult = await parseJsonResponse(assetResponse);
    const categoryResult = await parseJsonResponse(categoryResponse);

    setFacilityAssets(assetResult.data || []);
    setIssueCategories(categoryResult.data || []);
  };

  const fetchRequests = async () => {
    const actorId = getAuthUserId();
    const actorEmail = getAuthEmail();

    if (!actorId && !actorEmail) {
      setRequests([]);
      return;
    }

    const query = actorId
      ? `actor_id=${encodeURIComponent(actorId)}`
      : `actor_email=${encodeURIComponent(actorEmail)}`;

    const response = await fetch(
      `${MAIN_API_BASE_URL}/api/work-requests/my?${query}`,
    );
    const result = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load work request list');
    }

    setRequests(result.data || []);
  };

  const initializeDashboard = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const actor = await fetchContext();
      if (!actor) return;
      await Promise.all([fetchMasterData(), fetchRequests()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, []);

  const resetForm = () => {
    setFormState(INITIAL_FORM);
    setEditingDraft(null);
  };


  const openEditModal = async (item: WorkRequestItem) => {
    setEditingDraft(item);
    setFormState({
      title: item.title || '',
      description: item.description || '',
      facility_id: item.facility_id || '',
      category_id: item.category_id || '',
      urgency: 'medium',
      location_floor: item.location_floor || '',
      location_room: item.location_room || '',
      location_detail: item.location_detail || '',
      photo_before_url: item.photo_before_url || null,
      photoFile: null,
    });
    setIsModalOpen(true);

    try {
      const detailResponse = await fetch(`${MAIN_API_BASE_URL}/api/work-request/${item.report_id}/detail`);
      const detailResult = await parseJsonResponse(detailResponse);

      if (!detailResponse.ok) {
        return;
      }

      const report = detailResult?.data?.report;
      if (!report) {
        return;
      }

      setFormState((prev) => ({
        ...prev,
        title: report.title || prev.title,
        description: report.description || prev.description,
        facility_id: report.facility_id || prev.facility_id,
        category_id: report.category_id || prev.category_id,
        location_floor: report.location_floor || '',
        location_room: report.location_room || '',
        location_detail: report.location_detail || '',
        photo_before_url: report.photo_before_url || prev.photo_before_url,
      }));
    } catch {
      // Keep modal usable with list data if detail fetch fails.
    }
  };

  const createOrUpdateDraft = async (): Promise<WorkRequestItem | null> => {
    if (!context?.user_id && !context?.email) return null;

    const actorField = context.user_id
      ? { actor_id: context.user_id }
      : { actor_email: context.email };

    const payload = {
      ...actorField,
      title: formState.title.trim(),
      description: formState.description.trim(),
      facility_id: formState.facility_id,
      category_id: formState.category_id,
      urgency: formState.urgency,
      location_floor: formState.location_floor.trim(),
      location_room: formState.location_room.trim(),
      location_detail: formState.location_detail.trim(),
      photo_before_url: formState.photo_before_url,
    };

    const isEdit = !!editingDraft;
    const endpoint = isEdit
      ? `${MAIN_API_BASE_URL}/api/maintenance_report/${editingDraft?.report_id}`
      : `${MAIN_API_BASE_URL}/api/maintenance_report`;

    const response = await fetch(endpoint, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(result.message || 'Failed to save draft');
    }

    return result.data as WorkRequestItem;
  };

  const handleSaveDraft = async () => {
    if (!formState.title || !formState.facility_id || !formState.category_id) {
      setErrorMessage('Damage title, asset, and category are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await createOrUpdateDraft();
      setIsModalOpen(false);
      resetForm();
      await fetchRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save draft';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFromModal = async () => {
    if (!formState.title || !formState.facility_id || !formState.category_id) {
      setErrorMessage('Damage title, asset, and category are required.');
      return;
    }

    if (!window.confirm('Submit this damage report now? Once submitted, it cannot be edited.')) {
      return;
    }

    if (!context?.user_id && !context?.email) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const draft = await createOrUpdateDraft();
      if (!draft?.report_id) throw new Error('Draft tidak valid untuk disubmit');

      const actorBody = context.user_id
        ? { actor_id: context.user_id }
        : { actor_email: context.email };

      const response = await fetch(`${MAIN_API_BASE_URL}/api/work-requests/${draft.report_id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...actorBody, note: 'Submitted by requester' }),
      });
      const result = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit report');
      }

      setIsModalOpen(false);
      resetForm();
      await fetchRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit report';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDraft = async (item: WorkRequestItem) => {
    if (!context?.user_id && !context?.email) return;
    if (!window.confirm('Delete this work request draft?')) return;

    try {
      const actorQuery = context.user_id
        ? `actor_id=${encodeURIComponent(context.user_id)}`
        : `actor_email=${encodeURIComponent(context.email)}`;

      const response = await fetch(
        `${MAIN_API_BASE_URL}/api/maintenance_report/${item.report_id}?${actorQuery}`,
        { method: 'DELETE' },
      );
      const result = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete draft');
      }

      await fetchRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete draft';
      setErrorMessage(message);
    }
  };

  const handleSubmitDraft = async (item: WorkRequestItem) => {
    if (!context?.user_id && !context?.email) return;
    if (!window.confirm('Submit this damage report now?')) return;

    try {
      const actorBody = context.user_id
        ? { actor_id: context.user_id }
        : { actor_email: context.email };

      const response = await fetch(`${MAIN_API_BASE_URL}/api/work-requests/${item.report_id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...actorBody, note: 'Submitted by requester' }),
      });
      const result = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit report');
      }

      await fetchRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit draft';
      setErrorMessage(message);
    }
  };

  if (loading) {
    return (
      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white via-blue-50/50 to-white px-6 py-8 shadow-[0_8px_24px_rgba(37,99,235,0.12)] sm:px-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onNavigate('/')}
                className="group inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.15)]"
              >
                <Home className="h-4 w-4" />
                Back
              </motion.button>
              <div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
              >
                Requester Dashboard
              </motion.p>
              <motion.h1 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-1 text-3xl font-bold tracking-tight text-slate-900"
              >
                My Damage Reports
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-1 text-sm text-slate-600 font-medium"
              >
                Create, track, and monitor your damage reports with ease.
              </motion.p>

            </div>

            </div>
          </div>
        </motion.div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
        )}

        {sortedRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <ClipboardList className="mx-auto h-9 w-9 text-slate-400" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">No reports yet</h2>
            <p className="mt-1 text-sm text-slate-500">Use the Work Order menu in the navbar to create a new report.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedRequests.map((item) => {
              const statusMeta = STATUS_META[item.status] || STATUS_META.draft;
              const approvalMeta = APPROVAL_META[item.status] || APPROVAL_META.draft;
              const updated = item.updated_at || item.created_at;

              return (
                <motion.article
                  key={item.report_id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="group relative rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(37,99,235,0.15)] hover:border-blue-300/80"
                >
                  {/* Subtle gradient hover effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/8 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between relative">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-all duration-200 ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </motion.span>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-all duration-200 ${approvalMeta.className}`}
                        >
                          {approvalMeta.label}
                        </motion.span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 tracking-wide">WR #{item.report_number}</p>
                      <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 mt-4">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40">
                          <span className="font-bold text-slate-800 min-w-fit">Asset:</span>
                          <span className="text-slate-700 font-medium">{item.facility_name || item.facility_id}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40">
                          <span className="font-bold text-slate-800 min-w-fit">Category:</span>
                          <span className="text-slate-700 font-medium">{item.category_name || item.category_id}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40">
                          <span className="font-bold text-slate-800 min-w-fit">Technician:</span>
                          <span className="text-slate-700 font-medium">{item.assigned_to_name || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40">
                          <span className="font-bold text-slate-800 min-w-fit">Update:</span>
                          <span className="text-slate-700 font-medium text-xs">{updated ? new Date(updated).toLocaleString() : '-'}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 italic mt-2">
                        This approval status shows whether the report is waiting in the WO Manager queue, has been approved,
                        or has been rejected.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2 pt-4 lg:pt-0">
                      {item.status === 'draft' ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_16px_rgba(15,23,42,0.12)]"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => handleDeleteDraft(item)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 hover:border-red-400 transition-all duration-200 shadow-[0_4px_12px_rgba(220,38,38,0.08)] hover:shadow-[0_8px_16px_rgba(220,38,38,0.12)]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => handleSubmitDraft(item)}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white hover:shadow-[0_12px_28px_rgba(37,99,235,0.3)] transition-all duration-200 shadow-[0_8px_20px_rgba(37,99,235,0.2)]"
                          >
                            <Send className="h-4 w-4" />
                            Submit
                          </motion.button>
                        </>
                      ) : item.status === 'submitted' ? (
                        <motion.button
                          whileHover={{ scale: 1.08, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => onNavigate(`/work-requests/${item.report_id}`)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 shadow-[0_4px_12px_rgba(37,99,235,0.08)] hover:shadow-[0_8px_16px_rgba(37,99,235,0.12)]"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.08, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => onNavigate(`/work-requests/${item.report_id}`)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_16px_rgba(15,23,42,0.12)]"
                        >
                          <Wrench className="h-4 w-4" />
                          Details
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm" style={{ overflowY: 'auto' }}>
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.14)] my-8 flex flex-col max-h-[90vh]">
            <div className="sticky top-0 border-b border-slate-200/40 bg-gradient-to-r from-white via-blue-50/30 to-white px-6 py-4 flex items-start justify-between gap-4 z-10">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingDraft ? 'Edit Damage Report' : 'Create Damage Report'}
                </h2>
                <p className="text-sm text-slate-500">Complete the damage details before saving.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
                title="Close modal"
              >
                ✕
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Judul Kerusakan */}
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Judul Kerusakan <span className="text-red-500">*</span></span>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Contoh: AC Bocor menetes ke lantai..."
                />
              </label>

              {/* Category & Urgency Level */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-900">Category <span className="text-red-500">*</span></span>
                  <select
                    value={formState.category_id}
                    onChange={(event) => setFormState((prev) => ({ ...prev, category_id: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {issueCategories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-900">Tingkat Urgensi <span className="text-red-500">*</span></span>
                  <select
                    value={formState.urgency}
                    onChange={(event) => setFormState((prev) => ({ ...prev, urgency: event.target.value as any }))}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="low">Low (3-7 Hari)</option>
                    <option value="medium">Normal (1-2 Hari)</option>
                    <option value="high">High (ASAP)</option>
                  </select>
                </label>
              </div>

              {/* Deskripsi Detail */}
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Deskripsi Detail <span className="text-red-500">*</span></span>
                <textarea
                  value={formState.description}
                  onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Jelaskan secara detail mengenai kerusakan yang terjadi..."
                />
              </label>

              {/* Floor, Room Name, Position Detail */}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-900">Floor Location</span>
                  <input
                    type="text"
                    value={formState.location_floor}
                    onChange={(event) => setFormState((prev) => ({ ...prev, location_floor: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Contoh: 3"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-900">Nama Ruangan</span>
                  <input
                    type="text"
                    value={formState.location_room}
                    onChange={(event) => setFormState((prev) => ({ ...prev, location_room: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Contoh: R. Meeting"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-900">Detail Posisi</span>
                  <input
                    type="text"
                    value={formState.location_detail}
                    onChange={(event) => setFormState((prev) => ({ ...prev, location_detail: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Pojok kanan..."
                  />
                </label>
              </div>

              {/* Asset */}
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Asset <span className="text-red-500">*</span></span>
                <select
                  value={formState.facility_id}
                  onChange={(event) => setFormState((prev) => ({ ...prev, facility_id: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select asset</option>
                  {facilityAssets.map((asset) => (
                    <option key={asset.facility_id} value={asset.facility_id}>
                      {asset.facility_name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Problem Photo */}
              <div>
                <span className="mb-3 block text-sm font-semibold text-slate-900">Problem Photo (Optional)</span>
                
                {/* Show the existing photo if present */}
                {formState.photo_before_url && !formState.photoFile && (
                  <div className="mb-4 rounded-lg overflow-hidden border-2 border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700 mb-2">Existing Photo (already uploaded):</p>
                    <img 
                      src={formState.photo_before_url} 
                      alt="Existing" 
                      className="w-full max-h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Upload area */}
                {!formState.photoFile ? (
                  <div className="relative border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/70 p-6 text-center hover:bg-blue-100 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <svg className="h-14 w-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-sm font-semibold text-slate-900">Click to upload a new photo</p>
                        <p className="text-xs text-slate-500">Format: JPG, PNG, GIF. Maximum 5MB</p>
                      </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file && file.size <= 5 * 1024 * 1024) {
                          setFormState((prev) => ({ ...prev, photoFile: file }));
                        } else if (file) {
                          setErrorMessage('File is too large. Maximum 5MB.');
                        }
                      }}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="absolute inset-0 cursor-pointer rounded-2xl hover:bg-blue-200/30 transition-colors" />
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden border-2 border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-bold text-emerald-700 mb-2">New Photo ({formState.photoFile.name}):</p>
                      <img 
                        src={URL.createObjectURL(formState.photoFile)} 
                        alt="Preview" 
                        className="w-full max-h-48 object-cover rounded-lg"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setFormState((prev) => ({ ...prev, photoFile: null }))}
                        className="mt-3 w-full rounded-full border border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        Replace Photo
                      </motion.button>
                    </div>
                )}
              </div>
            </div>

                <div className="sticky bottom-0 border-t border-slate-200/40 bg-gradient-to-r from-white via-slate-50 to-white px-6 py-4 flex flex-wrap items-center justify-end gap-3 z-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-2.5 text-sm font-semibold text-white hover:shadow-lg disabled:opacity-60 transition-all shadow-md"
              >
                Save Draft
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleSubmitFromModal}
                disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:shadow-[0_12px_28px_rgba(37,99,235,0.28)] disabled:opacity-60 transition-all shadow-md"
              >
                Submit Report
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
