import { type ComponentType, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Menu,
  Users2,
  Wrench,
  X,
} from 'lucide-react';

type MenuKey = 'dashboard' | 'reports' | 'facilities' | 'users';

interface SummaryItem {
  title: string;
  value: string;
  delta: string;
  tone: 'blue' | 'yellow' | 'green' | 'red';
}

interface ReportItem {
  id: string;
  asset: string;
  location: string;
  date: string;
  status: 'New' | 'In Progress' | 'Done' | 'On Hold';
}

const menuItems: Array<{ key: MenuKey; label: string; icon: ComponentType<{ className?: string }>; sectionId: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, sectionId: 'dashboard' },
  { key: 'reports', label: 'Damage Reports', icon: ClipboardList, sectionId: 'reports' },
  { key: 'facilities', label: 'Facilities', icon: Building2, sectionId: 'facilities' },
  { key: 'users', label: 'Users & Technicians', icon: Users2, sectionId: 'users-tech' },
];

const summaryCards: SummaryItem[] = [
  { title: 'Total Reports', value: '142', delta: '+12 this month', tone: 'blue' },
  { title: 'In Progress', value: '36', delta: '8 high priority', tone: 'yellow' },
  { title: 'Done', value: '101', delta: '+18% from last month', tone: 'green' },
  { title: 'Critical', value: '5', delta: 'Needs follow-up', tone: 'red' },
];

const reportRows: ReportItem[] = [
  { id: 'RPT-1209', asset: 'Central AC 8F', location: 'Building A', date: '17 Apr 2026', status: 'In Progress' },
  { id: 'RPT-1208', asset: 'Service Lift 2', location: 'Building B', date: '17 Apr 2026', status: 'New' },
  { id: 'RPT-1207', asset: 'Main Water Pump', location: 'Building C', date: '16 Apr 2026', status: 'Done' },
  { id: 'RPT-1206', asset: 'Basement Electrical Panel', location: 'Building A', date: '16 Apr 2026', status: 'On Hold' },
  { id: 'RPT-1205', asset: 'East Corridor CCTV', location: 'Building D', date: '15 Apr 2026', status: 'Done' },
];

const statusClassMap: Record<ReportItem['status'], string> = {
  New: 'dashboard-status dashboard-status-yellow',
  'In Progress': 'dashboard-status dashboard-status-blue',
  Done: 'dashboard-status dashboard-status-green',
  'On Hold': 'dashboard-status dashboard-status-red',
};

const toneClassMap: Record<SummaryItem['tone'], string> = {
  blue: 'dashboard-summary-tone-blue',
  yellow: 'dashboard-summary-tone-yellow',
  green: 'dashboard-summary-tone-green',
  red: 'dashboard-summary-tone-red',
};

export function EnterpriseDashboard() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const facilityStats = useMemo(
    () => [
      { label: 'Active Assets', value: '1,294 units', icon: Building2 },
      { label: 'Service Tasks Today', value: '26 tasks', icon: Clock3 },
      { label: 'Technicians On Duty', value: '18 staff', icon: Wrench },
      { label: 'Critical Incidents', value: '3 reports', icon: AlertTriangle },
    ],
    [],
  );

  const navigateSection = (menu: (typeof menuItems)[number]) => {
    setActiveMenu(menu.key);
    setIsSidebarOpen(false);
    document.getElementById(menu.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="dashboard-shell">
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="dashboard-mobile-toggle"
        aria-label="Open sidebar menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-head">
          <div className="dashboard-logo">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <p className="dashboard-brand">MaintenanceAI</p>
            <p className="dashboard-subtitle">Enterprise Dashboard</p>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="dashboard-sidebar-close"
            aria-label="Close sidebar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="dashboard-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigateSection(item)}
                className={`dashboard-nav-item ${isActive ? 'dashboard-nav-item-active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {isSidebarOpen && <div className="dashboard-backdrop" onClick={() => setIsSidebarOpen(false)} />}

      <div className="dashboard-main">
        <section id="dashboard" className="dashboard-header-card">
          <div>
            <h1 className="dashboard-title">Operations Dashboard</h1>
            <p className="dashboard-description">
              Maintenance performance summary for tracking reports, assets, and technician productivity.
            </p>
          </div>
          <button type="button" className="dashboard-primary-btn">
            Create New Report
          </button>
        </section>

        <section className="dashboard-summary-grid">
          {summaryCards.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: index * 0.04 }}
              className={`dashboard-card dashboard-summary ${toneClassMap[item.tone]}`}
            >
              <p className="dashboard-summary-title">{item.title}</p>
              <p className="dashboard-summary-value">{item.value}</p>
              <p className="dashboard-summary-delta">{item.delta}</p>
            </motion.article>
          ))}
        </section>

        <section className="dashboard-content-grid">
          <article id="reports" className="dashboard-card dashboard-table-card">
            <div className="dashboard-card-head">
              <h2 className="dashboard-section-title">Recent Reports</h2>
              <span className="dashboard-head-meta">Last 5 reports</span>
            </div>

            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Asset</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.asset}</td>
                      <td>{row.location}</td>
                      <td>{row.date}</td>
                      <td>
                        <span className={statusClassMap[row.status]}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="dashboard-side-column">
            <article id="facilities" className="dashboard-card">
              <div className="dashboard-card-head">
                <h2 className="dashboard-section-title">Facility Statistics</h2>
                <span className="dashboard-head-meta">Realtime</span>
              </div>
              <div className="dashboard-kpi-list">
                {facilityStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="dashboard-kpi-item">
                      <div className="dashboard-kpi-icon">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="dashboard-kpi-label">{item.label}</p>
                        <p className="dashboard-kpi-value">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article id="users-tech" className="dashboard-card">
              <div className="dashboard-card-head">
                <h2 className="dashboard-section-title">Users & Technicians</h2>
              </div>
              <div className="dashboard-users-grid">
                <div className="dashboard-mini-stat">
                  <p>Active Admins</p>
                  <strong>6</strong>
                </div>
                <div className="dashboard-mini-stat">
                  <p>Reporting Users</p>
                  <strong>248</strong>
                </div>
                <div className="dashboard-mini-stat">
                  <p>Senior Technicians</p>
                  <strong>9</strong>
                </div>
                <div className="dashboard-mini-stat">
                  <p>Junior Technicians</p>
                  <strong>14</strong>
                </div>
              </div>
              <div className="dashboard-note">
                <CheckCircle2 className="h-4 w-4" />
                <span>93% of tickets were resolved within SLA this week.</span>
              </div>
            </article>
          </aside>
        </section>
      </div>
    </div>
  );
}
