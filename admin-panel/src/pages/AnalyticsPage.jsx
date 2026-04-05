import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import api from '../api';

const TT = { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 11 };

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <Box><Grid container spacing={2}>{[...Array(6)].map((_, i) => <Grid size={{ xs: 6, md: 4, lg: 2 }} key={i}><Skeleton variant="rounded" height={90} /></Grid>)}</Grid></Box>;

  const { funnel, receipts, revenue, alerts, daily, dailyUsers } = data;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Analytics & Funnel</Typography>

      {/* Alerts */}
      {(alerts.pendingModeration > 0 || alerts.pendingWithdrawals > 0) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {alerts.pendingModeration > 0 && <Chip label={`${alerts.pendingModeration} items in moderation queue`} color="warning" />}
          {alerts.pendingWithdrawals > 0 && <Chip label={`${alerts.pendingWithdrawals} pending withdrawals`} color="error" />}
        </Box>
      )}

      {/* User Funnel */}
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .5 }}>User Funnel</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Registered', value: funnel.users, color: '#4285f4' },
          { label: 'Onboarded', value: funnel.onboarded, color: '#1a73e8', pct: funnel.users ? Math.round(funnel.onboarded / funnel.users * 100) : 0 },
          { label: 'Scanned Receipt', value: funnel.withReceipts, color: '#34a853', pct: funnel.users ? Math.round(funnel.withReceipts / funnel.users * 100) : 0 },
          { label: 'Total Receipts', value: funnel.totalReceipts, color: '#fbbc04' },
          { label: 'Approved', value: funnel.approvedReceipts, color: '#34a853' },
        ].map((kpi, i) => (
          <Grid size={{ xs: 6, md: 2.4 }} key={i}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography sx={{ fontSize: 28, fontWeight: 700, color: kpi.color }}>{kpi.value}</Typography>
                <Typography sx={{ fontSize: 10, color: '#80868b', textTransform: 'uppercase', letterSpacing: .5 }}>{kpi.label}</Typography>
                {kpi.pct !== undefined && <Typography sx={{ fontSize: 10, color: '#80868b' }}>{kpi.pct}% conversion</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Receipt Status Breakdown */}
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .5 }}>Receipt Status</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: receipts.total, color: '#4285f4' },
          { label: 'Approved', value: receipts.approved, color: '#34a853' },
          { label: 'Pending Review', value: receipts.pending, color: '#fbbc04' },
          { label: 'Rejected', value: receipts.rejected, color: '#ea4335' },
        ].map((kpi, i) => (
          <Grid size={{ xs: 6, md: 3 }} key={i}>
            <KPICard label={kpi.label} value={kpi.value} color={kpi.color} />
          </Grid>
        ))}
      </Grid>

      {/* Revenue */}
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .5 }}>Revenue</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}><KPICard label="Total Receipt Revenue" value={`${Math.round(revenue.totalRevenue).toLocaleString()} T`} color="#1a73e8" /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><KPICard label="Data Purchase Revenue" value={`${revenue.totalPaid.toLocaleString()} T`} color="#34a853" /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><KPICard label="Paid Out (Withdrawals)" value={`${Math.round(revenue.completedWithdrawals).toLocaleString()} T`} color="#ea4335" /></Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5 }}>Daily Receipts (14 days)</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={daily}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#80868b' }} tickFormatter={v => v?.slice(5)} />
                  <YAxis tick={{ fontSize: 9, fill: '#bdc1c6' }} width={30} />
                  <Tooltip contentStyle={TT} />
                  <Bar dataKey="receipts" fill="#1a73e8" radius={[3, 3, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5 }}>Daily Revenue (14 days)</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={daily}>
                  <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34a853" stopOpacity={.2} /><stop offset="100%" stopColor="#34a853" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#80868b' }} tickFormatter={v => v?.slice(5)} />
                  <YAxis tick={{ fontSize: 9, fill: '#bdc1c6' }} width={40} />
                  <Tooltip contentStyle={TT} />
                  <Area type="monotone" dataKey="revenue" stroke="#34a853" fill="url(#rg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
