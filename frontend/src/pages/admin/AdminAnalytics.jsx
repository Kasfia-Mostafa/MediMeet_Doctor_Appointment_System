import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { HiOutlineChartBar, HiOutlineCurrencyBangladeshi, HiOutlineCalendar, HiOutlineTrendingUp } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['var(--primary)', 'var(--secondary)', 'var(--success)', '#FF8042', '#8884d8'];

const mockMonthlyData = [
  { name: 'Jan', revenue: 45000, appointments: 120 },
  { name: 'Feb', revenue: 52000, appointments: 145 },
  { name: 'Mar', revenue: 48000, appointments: 130 },
  { name: 'Apr', revenue: 61000, appointments: 175 },
  { name: 'May', revenue: 59000, appointments: 160 },
  { name: 'Jun', revenue: 75000, appointments: 210 },
];

export default function AdminAnalytics() {
  const [stats, setStats] = useState({ revenue: 0, appointments: 0, doctors: 0, byStatus: [], bySpec: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header"><h2>Analytics & Reports</h2><p>Financial and operational insights</p></div>

      <div className="grid grid-3 mb-xl">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><HiOutlineCurrencyBangladeshi /></div>
          <div><div className="stat-value">৳{stats.revenue}</div><div className="stat-label">Total Revenue</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary"><HiOutlineCalendar /></div>
          <div><div className="stat-value">{stats.appointments}</div><div className="stat-label">Total Appointments</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success"><HiOutlineTrendingUp /></div>
          <div><div className="stat-value">{stats.appointments > 0 ? ((stats.appointments - (stats.byStatus?.find(s => s._id==='cancelled')?.count || 0)) / stats.appointments * 100).toFixed(0) : 0}%</div><div className="stat-label">Completion Rate</div></div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h4>Appointments by Status</h4></div>
          {stats.byStatus?.length > 0 ? (
            <div className="flex flex-col gap-md">
              {stats.byStatus.map(s => (
                <div key={s._id} className="flex flex-col">
                  <div className="flex justify-between mb-sm">
                    <span style={{ textTransform: 'capitalize', fontWeight: 500, fontSize: '14px' }}>{s._id}</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{s.count}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--surface-container-high)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${stats.appointments > 0 ? (s.count / stats.appointments) * 100 : 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-container) 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.6s ease-out'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--text-muted)' }}>No appointment data available</p>}
        </div>

        <div className="card">
          <div className="card-header"><h4>Doctors by Specialization</h4></div>
          {stats.bySpec?.length > 0 ? (
            <div className="flex flex-col gap-md">
              {stats.bySpec.slice(0, 5).map((s, idx) => {
                const maxCount = stats.bySpec[0]?.count || 1;
                return (
                  <div key={s._id} className="flex flex-col">
                    <div className="flex justify-between mb-sm">
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>{s._id}</span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{s.count}</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--surface-container-high)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(s.count / maxCount) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--secondary) 0%, var(--secondary-container) 100%)',
                        borderRadius: '4px',
                        transition: 'width 0.6s ease-out',
                        opacity: 1 - (idx * 0.07)
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p style={{ color: 'var(--text-muted)' }}>No specialization data available</p>}
        </div>
      </div>

      <div className="grid grid-2 mt-xl">
        <div className="card">
          <div className="card-header"><h4>Revenue Overview (Last 6 Months)</h4></div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={mockMonthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h4>Appointment Trends (Last 6 Months)</h4></div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={mockMonthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  cursor={{ fill: 'var(--surface-container)' }}
                />
                <Bar dataKey="appointments" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {stats.byStatus?.length > 0 && (
        <div className="card mt-xl">
          <div className="card-header"><h4>Appointment Status Distribution</h4></div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.byStatus}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={80}
                  paddingAngle={5}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', textTransform: 'capitalize' }}
                />
                <Legend style={{ textTransform: 'capitalize' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
