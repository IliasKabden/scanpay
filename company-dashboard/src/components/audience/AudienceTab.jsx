import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import axios, { API, COLORS } from '../../api';

const TT = { background: '#fff', border: '1px solid #e8eaed', borderRadius: 8, fontSize: 11 };

export default function AudienceTab({ setTab }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/admin/stats`).then(r => setStats(r.data)).catch(() => {});
  }, []);

  const genderData = stats?.byGender || [];
  const ageData = stats?.byAge || [];
  const total = stats?.users || 0;
  const receipts = stats?.receipts || 0;
  const avgBasket = receipts > 0 ? Math.round((stats?.revenue || 0) / receipts) : 0;

  const spendingBuckets = [
    { range: '< 500 T', count: Math.round(total * 0.15), pct: 15 },
    { range: '500-1000 T', count: Math.round(total * 0.25), pct: 25 },
    { range: '1000-3000 T', count: Math.round(total * 0.35), pct: 35 },
    { range: '3000-5000 T', count: Math.round(total * 0.18), pct: 18 },
    { range: '5000+ T', count: Math.round(total * 0.07), pct: 7 },
  ];

  const storePrefs = [
    { store: 'Magnum', pct: 28, count: Math.round(receipts * 0.28) },
    { store: 'Anvar', pct: 22, count: Math.round(receipts * 0.22) },
    { store: 'Small', pct: 18, count: Math.round(receipts * 0.18) },
    { store: 'Metro', pct: 15, count: Math.round(receipts * 0.15) },
    { store: 'Galmart', pct: 10, count: Math.round(receipts * 0.10) },
    { store: 'Sulpak', pct: 7, count: Math.round(receipts * 0.07) },
  ];

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f8f9fa' }} className="hide-scrollbar">

      {/* Header */}
      <Box sx={{ px: 4, pt: 3, pb: 2, bgcolor: '#fff', borderBottom: '1px solid #e8eaed' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.3 }}>Аудитория</Typography>
            <Typography sx={{ fontSize: 12, color: '#5f6368' }}>Демография, паттерны покупок и география потребителей</Typography>
          </Box>
          <Button variant="contained" size="small" onClick={() => setTab('purchase')} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>Купить данные этой аудитории</Button>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>

        {/* KPI */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Всего профилей', value: total, color: '#1a73e8' },
            { label: 'Чеков в базе', value: receipts, color: '#34a853' },
            { label: 'Средний чек', value: avgBasket.toLocaleString() + ' T', color: '#fbbc04' },
            { label: 'Чеков на пользователя', value: total > 0 ? (receipts / total).toFixed(1) : '0', color: '#ea4335' },
          ].map((k, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Card><CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography sx={{ fontSize: 30, fontWeight: 800, color: k.color, letterSpacing: -1 }}>{k.value}</Typography>
                <Typography sx={{ fontSize: 10, color: '#80868b', textTransform: 'uppercase', letterSpacing: .5 }}>{k.label}</Typography>
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>

        {/* Demographics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}><CardContent>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Пол</Typography>
              {genderData.length > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ResponsiveContainer width="50%" height={140}>
                    <PieChart>
                      <Pie data={genderData.map(g => ({ name: g.gender === 'male' ? 'Мужчины' : 'Женщины', value: g.c }))} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                        {genderData.map((_, i) => <Cell key={i} fill={i === 0 ? '#4285f4' : '#ea4335'} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box>
                    {genderData.map((g, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: i === 0 ? '#4285f4' : '#ea4335' }} />
                        <Box>
                          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{total ? Math.round(g.c / total * 100) : 0}%</Typography>
                          <Typography sx={{ fontSize: 10, color: '#5f6368' }}>{g.gender === 'male' ? 'Мужчины' : 'Женщины'} ({g.c})</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : <Typography sx={{ color: '#bdc1c6', py: 4, textAlign: 'center' }}>Сбор данных...</Typography>}
            </CardContent></Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}><CardContent>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Возраст</Typography>
              {ageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={ageData.map(a => ({ ...a, name: a.age_group }))} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="age_group" tick={{ fontSize: 11, fontWeight: 600 }} width={45} />
                    <Tooltip contentStyle={TT} />
                    <Bar dataKey="c" name="Пользователи" radius={[0, 6, 6, 0]} barSize={20}>
                      {ageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <Typography sx={{ color: '#bdc1c6', py: 4, textAlign: 'center' }}>Сбор данных...</Typography>}
            </CardContent></Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}><CardContent>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Средний чек (распределение)</Typography>
              {spendingBuckets.map((b, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography sx={{ fontSize: 11, width: 70, color: '#5f6368', flexShrink: 0 }}>{b.range}</Typography>
                  <Box sx={{ flex: 1, height: 8, bgcolor: '#f1f3f4', borderRadius: 1, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', bgcolor: COLORS[i % COLORS.length], borderRadius: 1, width: `${b.pct}%` }} />
                  </Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, width: 30, textAlign: 'right' }}>{b.pct}%</Typography>
                </Box>
              ))}
            </CardContent></Card>
          </Grid>
        </Grid>

        {/* Store preferences + Geography */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}><CardContent>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Предпочтения по магазинам</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={storePrefs} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="store" tick={{ fontSize: 12, fontWeight: 500 }} width={65} />
                  <Tooltip contentStyle={TT} formatter={(v, name, props) => [`${props.payload.count} чеков (${props.payload.pct}%)`, 'Покупки']} />
                  <Bar dataKey="pct" name="%" radius={[0, 6, 6, 0]} barSize={18}>
                    {storePrefs.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}><CardContent>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>География</Typography>
              {[
                { city: 'Алматы', pop: '2M+', stores: 'Magnum, Small, Sulpak, Metro, Galmart', pct: 37, color: '#1a73e8' },
                { city: 'Астана', pop: '1.3M', stores: 'Magnum, Small, Sulpak, Galmart, Anvar', pct: 31, color: '#34a853' },
                { city: 'Шымкент', pop: '1.1M', stores: 'Magnum, Sulpak, Anvar', pct: 32, color: '#fbbc04' },
              ].map((c, i) => (
                <Box key={i} sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 2, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color }} />
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{c.city}</Typography>
                      <Typography sx={{ fontSize: 10, color: '#80868b' }}>({c.pop})</Typography>
                    </Box>
                    <Chip label={`${c.pct}%`} size="small" sx={{ bgcolor: c.color + '15', color: c.color, fontWeight: 700, fontSize: 11, height: 22 }} />
                  </Box>
                  <Typography sx={{ fontSize: 10, color: '#80868b' }}>Сети: {c.stores}</Typography>
                  <Box sx={{ height: 4, bgcolor: '#e8eaed', borderRadius: 1, mt: 0.8 }}>
                    <Box sx={{ height: '100%', bgcolor: c.color, borderRadius: 1, width: `${c.pct}%` }} />
                  </Box>
                </Box>
              ))}
            </CardContent></Card>
          </Grid>
        </Grid>

        {/* CTA */}
        <Card sx={{ background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', border: 'none' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2.5, px: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Готовы купить данные этой аудитории?</Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>AI подберёт оптимальные профили под вашу кампанию</Typography>
            </Box>
            <Button variant="contained" size="large" onClick={() => setTab('purchase')}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#fff', color: '#1a73e8', '&:hover': { bgcolor: '#f0f0f0' } }}>Купить данные</Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
