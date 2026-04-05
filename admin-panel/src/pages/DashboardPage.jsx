import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import KPICard from '../components/KPICard';
import api from '../api';

const COLORS = ['#4285f4', '#ea4335', '#34a853', '#fbbc04', '#ff6d01', '#46bdc6'];

const KPI_CONFIG = [
  { key: 'users', label: 'Users', color: '#4285f4' },
  { key: 'receipts', label: 'Receipts', color: '#34a853' },
  { key: 'revenue', label: 'Revenue', color: '#ea4335', format: (v) => v.toLocaleString() + ' T' },
  { key: 'companies', label: 'Companies', color: '#fbbc04' },
  { key: 'products', label: 'Products', color: '#ff6d01' },
  { key: 'detections', label: 'Detections', color: '#46bdc6' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/solana/wallet').catch(() => ({ data: { address: '-', balance: '0', network: 'devnet' } })),
    ]).then(([s, w]) => {
      setStats(s.data);
      setWallet(w.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Box>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid size={{ xs: 6, md: 4, lg: 2 }} key={i}>
              <Skeleton variant="rounded" height={90} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Banner */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)', border: 'none' }}>
        <CardContent sx={{ py: 2.5, px: 3 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#fff', mb: 0.5 }}>
            Mening Deregim — Admin Panel
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,.85)', mb: 1, maxWidth: 600 }}>
            Маркетплейс данных на блокчейне Solana. Пользователи сканируют чеки в Telegram, AI обрабатывает данные, компании покупают анонимизированную аналитику с автоматической оплатой через смарт-контракт.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label="Solana Blockchain" size="small" sx={{ bgcolor: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 10 }} />
            <Chip label="Claude AI" size="small" sx={{ bgcolor: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 10 }} />
            <Chip label="Telegram Mini App" size="small" sx={{ bgcolor: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 10 }} />
            <Chip label="Kazakhstan" size="small" sx={{ bgcolor: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 10 }} />
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Dashboard</Typography>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {KPI_CONFIG.map((kpi) => (
          <Grid size={{ xs: 6, md: 4, lg: 2 }} key={kpi.key}>
            <KPICard
              label={kpi.label}
              value={kpi.format ? kpi.format(stats[kpi.key]) : stats[kpi.key]}
              color={kpi.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Wallet Info */}
      {wallet && (
        <Card sx={{ mb: 3, bgcolor: '#eff6ff', border: '1px solid #a8c7fa' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography sx={{ fontWeight: 700, color: '#1a73e8', fontSize: 14 }}>Solana Wallet</Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: '#5f6368', wordBreak: 'break-all' }}>{wallet.address}</Typography>
            <Typography sx={{ fontWeight: 700, color: '#1a73e8', fontSize: 14 }}>{wallet.balance} SOL</Typography>
            <Chip label={wallet.network} size="small" sx={{ bgcolor: '#e8f0fe', color: '#1a73e8', fontSize: 11, height: 22 }} />
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5 }}>Gender Distribution</Typography>
              {stats.byGender?.length > 0 ? (
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={stats.byGender} layout="vertical" margin={{ left: 50, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="gender" tick={{ fontSize: 12 }} width={50} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e0e0e0' }} />
                    <Bar dataKey="c" name="Count" radius={[0, 4, 4, 0]} barSize={20}>
                      {stats.byGender.map((entry, i) => (
                        <Cell key={i} fill={entry.gender === 'male' ? '#4285f4' : '#ea4335'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ color: '#bdc1c6', py: 3, textAlign: 'center' }}>No data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5 }}>Age Groups</Typography>
              {stats.byAge?.length > 0 ? (
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={stats.byAge} layout="vertical" margin={{ left: 50, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="age_group" tick={{ fontSize: 12 }} width={50} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e0e0e0' }} />
                    <Bar dataKey="c" name="Count" radius={[0, 4, 4, 0]} barSize={16}>
                      {stats.byAge.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ color: '#bdc1c6', py: 3, textAlign: 'center' }}>No data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
