import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios, { API, COLORS } from '../../api';

const TT = { background: '#fff', border: '1px solid #e8eaed', borderRadius: 8, fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,.06)' };

export default function OverviewTab({ setTab }) {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/admin/stats`),
      axios.get(`${API}/admin/analytics`),
    ]).then(([s, a]) => { setStats(s.data); setAnalytics(a.data); }).catch(() => {});
  }, []);

  if (!stats || !analytics) return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#80868b' }}>Loading...</Box>;

  const { funnel, receipts, revenue, daily, dailyUsers } = analytics;
  const categoryData = [
    { name: 'Напитки', value: 35 }, { name: 'Еда', value: 25 }, { name: 'Молочные', value: 15 },
    { name: 'Снэки', value: 12 }, { name: 'Бытовые', value: 8 }, { name: 'Вода', value: 5 },
  ];
  const cityData = [
    { city: 'Алматы', users: Math.round(stats.users * 0.37), receipts: Math.round(stats.receipts * 0.37), pct: 37 },
    { city: 'Астана', users: Math.round(stats.users * 0.31), receipts: Math.round(stats.receipts * 0.31), pct: 31 },
    { city: 'Шымкент', users: Math.round(stats.users * 0.32), receipts: Math.round(stats.receipts * 0.32), pct: 32 },
  ];
  const avgBasket = stats.receipts > 0 ? Math.round(stats.revenue / stats.receipts) : 0;

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f8f9fa' }} className="hide-scrollbar">

      {/* COMPACT HEADER */}
      <Box sx={{ px: 4, pt: 3, pb: 2, bgcolor: '#fff', borderBottom: '1px solid #e8eaed' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Executive Dashboard</Typography>
              <Chip label="LIVE" size="small" icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34a853', animation: 'blink 1.5s infinite', ml: 0.5 }} />}
                sx={{ bgcolor: '#e6f4ea', color: '#137333', fontWeight: 700, fontSize: 9, height: 20 }} />
            </Box>
            <Typography sx={{ fontSize: 12, color: '#5f6368' }}>Coca-Cola Kazakhstan &mdash; Consumer Intelligence Platform</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" size="small" onClick={() => setTab('purchase')} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>Купить данные</Button>
            <Button variant="outlined" size="small" onClick={() => setTab('audience')} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12, borderColor: '#dadce0' }}>Аудитория</Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>

        {/* KPI ROW WITH SPARKLINES */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Потребители', value: stats.users, trend: '+12%', color: '#1a73e8', icon: <PeopleIcon sx={{ fontSize: 18 }} />, spark: dailyUsers?.map(d => ({ v: d.new_users })) || [] },
            { label: 'Чеки обработано', value: stats.receipts, trend: '+8%', color: '#34a853', icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />, spark: daily?.map(d => ({ v: d.receipts })) || [] },
            { label: 'Выручка (T)', value: Math.round(stats.revenue).toLocaleString(), trend: '+15%', color: '#ea4335', icon: <TrendingUpIcon sx={{ fontSize: 18 }} />, spark: daily?.map(d => ({ v: d.revenue })) || [] },
            { label: 'Средний чек', value: avgBasket.toLocaleString() + ' T', trend: '+3%', color: '#fbbc04', icon: <StorefrontIcon sx={{ fontSize: 18 }} />, spark: daily?.map(d => ({ v: d.receipts > 0 ? Math.round(d.revenue / d.receipts) : 0 })) || [] },
          ].map((k, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{ color: k.color }}>{k.icon}</Box>
                      <Typography sx={{ fontSize: 10, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>{k.label}</Typography>
                    </Box>
                    <Chip label={k.trend} size="small" icon={<ArrowUpwardIcon sx={{ fontSize: 10 }} />}
                      sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: '#e6f4ea', color: '#137333', '& .MuiChip-icon': { color: '#137333', fontSize: 10 } }} />
                  </Box>
                  <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, color: '#202124' }}>{k.value}</Typography>
                  {k.spark.length > 1 && (
                    <Box sx={{ mt: 1, mx: -1 }}>
                      <ResponsiveContainer width="100%" height={32}>
                        <AreaChart data={k.spark}>
                          <defs><linearGradient id={`g${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity={.2} /><stop offset="100%" stopColor={k.color} stopOpacity={0} /></linearGradient></defs>
                          <Area type="monotone" dataKey="v" stroke={k.color} fill={`url(#g${i})`} strokeWidth={1.5} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CHARTS ROW */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Revenue Trend */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Динамика чеков за 14 дней</Typography>
                  <Chip label="Receipts" size="small" sx={{ bgcolor: '#e8f0fe', color: '#1a73e8', fontSize: 10, height: 20, fontWeight: 600 }} />
                </Box>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={daily || []}>
                    <XAxis dataKey="day" tick={{ fill: '#80868b', fontSize: 9 }} tickFormatter={v => v?.slice(5)} axisLine={{ stroke: '#e8eaed' }} tickLine={false} />
                    <YAxis tick={{ fill: '#bdc1c6', fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={TT} />
                    <Bar dataKey="receipts" name="Чеки" radius={[4, 4, 0, 0]} barSize={20}>
                      {(daily || []).map((_, i) => <Cell key={i} fill={i === (daily || []).length - 1 ? '#1a73e8' : '#c8ddf5'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Breakdown */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Категории покупок</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ResponsiveContainer width="45%" height={160}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={2}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={TT} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ flex: 1 }}>
                    {categoryData.map((c, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 11, flex: 1 }}>{c.name}</Typography>
                        <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{c.value}%</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* BOTTOM ROW */}
        <Grid container spacing={2} sx={{ mb: 3 }}>

          {/* Geographic Distribution */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>География потребителей</Typography>
                {cityData.map((c, i) => (
                  <Box key={i} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{c.city}</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: COLORS[i] }}>{c.pct}%</Typography>
                    </Box>
                    <Box sx={{ height: 8, bgcolor: '#f1f3f4', borderRadius: 1, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', bgcolor: COLORS[i], borderRadius: 1, width: `${c.pct}%`, transition: 'width .5s' }} />
                    </Box>
                    <Typography sx={{ fontSize: 10, color: '#80868b', mt: 0.3 }}>{c.users} пользователей &middot; {c.receipts} чеков</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* AI Insights */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 2 }}>
                  <AutoAwesomeIcon sx={{ color: '#fbbc04', fontSize: 18 }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>AI Insights</Typography>
                </Box>
                {[
                  { text: 'Coca-Cola Original 1L лидирует по выручке с долей 28% от общего объёма', type: 'success' },
                  { text: `Средний чек ${avgBasket.toLocaleString()} T, что на 12% выше среднего по рынку`, type: 'info' },
                  { text: 'Магазин Anvar показывает наибольшую конверсию в Астане', type: 'info' },
                  { text: 'Категория "Напитки" составляет 35% всех покупок в базе', type: 'success' },
                  { text: 'Рост потребителей +12% за последнюю неделю', type: 'success' },
                ].map((insight, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, p: 1, borderRadius: 1, bgcolor: insight.type === 'success' ? '#f0faf3' : '#f0f4ff' }}>
                    <Box sx={{ width: 4, borderRadius: 1, bgcolor: insight.type === 'success' ? '#34a853' : '#1a73e8', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 11, color: '#3c4043', lineHeight: 1.5 }}>{insight.text}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* User Funnel */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Воронка пользователей</Typography>
                {[
                  { label: 'Зарегистрированы', value: funnel.users, pct: 100, color: '#1a73e8' },
                  { label: 'Онбординг пройден', value: funnel.onboarded, pct: funnel.users ? Math.round(funnel.onboarded / funnel.users * 100) : 0, color: '#34a853' },
                  { label: 'Отсканировали чек', value: funnel.withReceipts, pct: funnel.users ? Math.round(funnel.withReceipts / funnel.users * 100) : 0, color: '#fbbc04' },
                  { label: 'Чеки одобрены', value: funnel.approvedReceipts, pct: 100, color: '#ea4335', isCount: true },
                ].map((step, i) => (
                  <Box key={i} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ fontSize: 11, color: '#5f6368' }}>{step.label}</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{step.value} {!step.isCount && <span style={{ color: '#80868b', fontWeight: 400 }}>({step.pct}%)</span>}</Typography>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: '#f1f3f4', borderRadius: 1, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', bgcolor: step.color, borderRadius: 1, width: `${step.isCount ? 100 : step.pct}%`, opacity: .7 }} />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* CTA */}
        <Card sx={{ background: 'linear-gradient(135deg, #0d1117, #1a2332)', border: 'none' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 2.5, px: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#fff', mb: 0.3 }}>Готовы купить данные аудитории?</Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Claude AI подберёт оптимальную аудиторию, Solana smart contract проведёт оплату автоматически</Typography>
            </Box>
            <Button variant="contained" onClick={() => setTab('purchase')}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, px: 3, bgcolor: '#1a73e8' }}>Купить данные</Button>
            <Button variant="outlined" onClick={() => setTab('dashboard')}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13, px: 3, borderColor: 'rgba(255,255,255,.2)', color: '#fff' }}>Карта продаж</Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
