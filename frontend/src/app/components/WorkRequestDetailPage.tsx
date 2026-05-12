import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Home, Paperclip, MessageSquare, Clock3 } from 'lucide-react';

const MAIN_API_BASE_URL = 'http://127.0.0.1:3032';

interface RequesterContext {
  user_id: string;
  email: string;
  role: 'REQUESTER' | 'WO_MANAGER' | 'TECHNICIAN' | 'SITE_MANAGER';
}

interface DetailResponse {
  report: Record<string, any>;
  relation: Record<string, any>;
  activity: Array<Record<string, any>>;
  comments: Array<Record<string, any>>;
  attachments: Array<Record<string, any>>;
}

type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'pending_review'
  | 'rejected'
  | 'approved'
  | 'rejected_by_wom';

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
    throw new Error(`API response is not JSON (${response.status}): ${snippet}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse JSON from API (${response.status})`);
  }
}

// API helper and header builder (same approach as UserWorkOrderDashboard)
async function apiFetch(url: string, options: RequestInit = {}) {
  const authApi = (window as any).auth;
  if (authApi && typeof authApi.fetch === 'function') {
    return authApi.fetch(url, options);
  }

  return fetch(url, options);
}

function getAuthRole(): string {
  try {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return 'REQUESTER';
    const parsed = JSON.parse(raw) as { role?: string };
    return String(parsed.role || 'REQUESTER').toUpperCase();
  } catch {
    return 'REQUESTER';
  }
}

function buildRequesterHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-role': getAuthRole(),
  };

  const userId = getAuthUserId();
  if (userId) headers['x-user-id'] = userId;

  return headers;
}

export function WorkRequestDetailPage({
  reportId,
  onNavigate,
}: {
  reportId: string;
  onNavigate: (path: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [context, setContext] = useState<RequesterContext | null>(null);
  const [detail, setDetail] = useState<DetailResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const actorId = getAuthUserId();
        const actorEmail = getAuthEmail();
        if (!actorId && !actorEmail) {
          throw new Error('Session not found. Please sign in again.');
        }

        const headers = buildRequesterHeaders();

        // Fetch requester list using same approach as dashboard (maintenance-report/read)
        const listResponse = await apiFetch(`${MAIN_API_BASE_URL}/api/facility-helpdesk/maintenance-report/read`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            where: actorId ? [{ key: 'reporter_id', value: actorId }] : [{ key: 'reporter_id', value: actorEmail }],
            limit: 1000,
            sort_columns: [{ column: 'updated_at', direction: 'DESC' }],
          }),
        });

        const detailResponse = await apiFetch(`${MAIN_API_BASE_URL}/api/work-request/${reportId}/detail`, { headers });

        const listResult = await parseJsonResponse(listResponse);
        const detailResult = await parseJsonResponse(detailResponse);

        if (!listResponse.ok) {
          throw new Error(listResult.message || 'Failed to load requester data');
        }
        if (!detailResponse.ok || !detailResult.data) {
          throw new Error(detailResult.message || 'Failed to load work request detail');
        }

        const actor: RequesterContext = {
          user_id: actorId,
          email: actorEmail,
          role: 'REQUESTER',
        };

        const fetchedDetail = detailResult.data as DetailResponse;
        if (actor.user_id && String(fetchedDetail.report.reporter_id) !== String(actor.user_id)) {
          throw new Error('You do not have access to this work request.');
        }

        setContext(actor);
        setDetail(fetchedDetail);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load detail';
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [reportId]);

  if (loading) {
    return (
      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Loading work request detail...</p>
        </div>
      </section>
    );
  }

  if (errorMessage || !detail || !context) {
    return (
      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">{errorMessage || 'Data is unavailable.'}</p>
          <button
            type="button"
            onClick={() => onNavigate('/dashboard')}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </section>
    );
  }

  const report = detail.report;
  const relation = detail.relation || {};
  const status = (report.status || 'draft') as RequestStatus;
  const statusMeta = STATUS_META[status] || STATUS_META.draft;
  const approvalMeta = APPROVAL_META[status] || APPROVAL_META.draft;

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/60 bg-gradient-to-r from-white via-blue-50/40 to-white px-6 py-7 shadow-[0_8px_24px_rgba(37,99,235,0.08)] sm:px-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Work Request Detail</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{report.title}</h1>
              <p className="mt-1 text-sm text-slate-500">#{report.report_number}</p>
              <p className="mt-2 text-sm text-slate-600">Location: {report.location_floor || '-'} • {report.location_room || '-'} • {report.location_detail || '-'}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${approvalMeta.className}`}>
                {approvalMeta.label}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
              >
                <Home className="h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Request Info</h2>
              <div className="mt-3 grid gap-3 text-sm text-slate-700">
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold text-slate-900">Description:</span>{' '}
                  {report.description || '-'}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-white/60 p-3 border border-slate-200/60">
                    <div className="text-xs text-slate-500">Asset</div>
                    <div className="mt-1 font-semibold text-slate-900">{relation.facility_name || report.facility_id}</div>
                  </div>
                  <div className="rounded-lg bg-white/60 p-3 border border-slate-200/60">
                    <div className="text-xs text-slate-500">Issue Category</div>
                    <div className="mt-1 font-semibold text-slate-900">{relation.category_name || report.category_id}</div>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-white/60 p-3 border border-slate-200/60">
                    <div className="text-xs text-slate-500">Assigned Technician</div>
                    <div className="mt-1 font-semibold text-slate-900">{relation.assigned_to_name || '-'}</div>
                  </div>
                  <div className="rounded-lg bg-white/60 p-3 border border-slate-200/60">
                    <div className="text-xs text-slate-500">Last Updated</div>
                    <div className="mt-1 font-semibold text-slate-900">{report.updated_at ? new Date(report.updated_at).toLocaleString() : '-'}</div>
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-slate-900">Approval WO Manager:</span> {approvalMeta.label}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Timeline</h2>
              </div>

              {detail.activity.length === 0 ? (
                <p className="text-sm text-slate-500">No activity yet.</p>
              ) : (
                <ol className="space-y-3">
                  {detail.activity.map((activity) => (
                    <li key={activity.activity_id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-sm font-semibold text-slate-900">{activity.activity_type}</p>
                      <p className="text-xs text-slate-600">
                        {activity.status_from || '-'} → {activity.status_to || '-'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {activity.actor_name || 'System'} •{' '}
                        {activity.activity_at ? new Date(activity.activity_at).toLocaleString() : '-'}
                      </p>
                      {activity.activity_note && <p className="mt-1 text-xs text-slate-600">{activity.activity_note}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Comments</h2>
              </div>

              {detail.comments.length === 0 ? (
                <p className="text-sm text-slate-500">No comments available.</p>
              ) : (
                <ul className="space-y-3">
                  {detail.comments.map((comment) => (
                    <li key={comment.comment_id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-sm text-slate-800">{comment.comment_text}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {comment.author_name || 'Unknown'} •{' '}
                        {comment.created_at ? new Date(comment.created_at).toLocaleString() : '-'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Attachments</h2>
              </div>

              {detail.attachments.length === 0 ? (
                <p className="text-sm text-slate-500">No attachments available.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.attachments.map((attachment) => (
                    <li key={attachment.attachment_id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                      >
                        {attachment.file_name}
                      </a>
                      <p className="mt-1 text-xs text-slate-500">
                        {attachment.attachment_type} •{' '}
                        {attachment.created_at ? new Date(attachment.created_at).toLocaleString() : '-'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
