import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios, { API, COLORS } from '../../api';

export default function PricingTab({ d, deviations }) {
  const pd = d?.by_product || [];
  const sd = d?.by_store || [];
  const products = d?.products || [];

  const alerts = deviations || [];
  const compliant = products.filter(p => {
    const devs = alerts.filter(a => a.product_name === p.product_name);
    return devs.length === 0;
  });
  const violating = products.filter(p => {
    return alerts.some(a => a.product_name === p.product_name);
  });

  // Product price analysis
  const priceAnalysis = products.map(p => {
    const prodData = pd.find(x => x.product_name === p.product_name);
    const prodAlerts = alerts.filter(a => a.product_name === p.product_name);
    const avgPrice = prodData?.avg_price || 0;
    const rrp = p.rrp || 0;
    const deviation = rrp > 0 ? Math.round(((avgPrice - rrp) / rrp) * 100) : 0;
    return {
      ...p, avgPrice: Math.round(avgPrice), rrp, deviation,
      sales: prodData?.total_sales || 0, revenue: Math.round(prodData?.total_revenue || 0),
      alerts: prodAlerts.length, status: Math.abs(deviation) <= 10 ? 'ok' : deviation > 0 ? 'high' : 'low',
    };
  });

  // Store compliance
  const storeCompliance = sd.map(s => {
    const storeAlerts = alerts.filter(a => a.store_name === s.store_name);
    const totalProducts = products.length;
    const violCount = new Set(storeAlerts.map(a => a.product_name)).size;
    return {
      ...s, violations: violCount, compliance: totalProducts > 0 ? Math.round((1 - violCount / totalProducts) * 100) : 100,
      worstDeviation: storeAlerts.length > 0 ? storeAlerts.reduce((w, a) => Math.abs(a.deviation_pct) > Math.abs(w.deviation_pct) ? a : w, storeAlerts[0]) : null,
    };
  }).sort((a, b) => a.compliance - b.compliance);

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f8f9fa' }} className="hide-scrollbar">

      {/* Header */}
      <Box sx={{ px: 4, pt: 3, pb: 2, bgcolor: '#fff', borderBottom: '1px solid #e8eaed' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.3 }}>Ценовой мониторинг</Typography>
            <Typography sx={{ fontSize: 12, color: '#5f6368' }}>Контроль соблюдения рекомендованных розничных цен (РРЦ) по торговым точкам</Typography>
          </Box>
          <Chip label={alerts.length > 0 ? `${alerts.length} нарушений` : 'Всё в норме'}
            icon={alerts.length > 0 ? <WarningAmberIcon sx={{ fontSize: 16 }} /> : <CheckCircleIcon sx={{ fontSize: 16 }} />}
            sx={{ bgcolor: alerts.length > 0 ? '#fce8e6' : '#e6f4ea', color: alerts.length > 0 ? '#c5221f' : '#137333', fontWeight: 700, fontSize: 12 }} />
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Товаров отслеживается', value: products.length, color: '#1a73e8', icon: '📦' },
            { label: 'Средний compliance', value: storeCompliance.length > 0 ? Math.round(storeCompliance.reduce((s, x) => s + x.compliance, 0) / storeCompliance.length) + '%' : '—', color: '#34a853', icon: '✅' },
            { label: 'Нарушений цен', value: alerts.length, color: alerts.length > 0 ? '#ea4335' : '#34a853', icon: '⚠️' },
            { label: 'Магазинов в мониторинге', value: sd.length, color: '#fbbc04', icon: '🏪' },
          ].map((k, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Card><CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography sx={{ fontSize: 12, mb: 0.5 }}>{k.icon}</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 800, color: k.color, letterSpacing: -1 }}>{k.value}</Typography>
                <Typography sx={{ fontSize: 10, color: '#80868b', textTransform: 'uppercase', letterSpacing: .5 }}>{k.label}</Typography>
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>

        {/* Product Price Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Анализ цен по товарам</Typography>
            <Box sx={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Товар', 'РРЦ (T)', 'Факт. цена (T)', 'Отклонение', 'Продажи', 'Выручка (T)', 'Статус'].map((h, i) => (
                      <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: 10, color: '#80868b', fontWeight: 600, padding: '8px 12px', borderBottom: '2px solid #e8eaed', textTransform: 'uppercase', letterSpacing: '.3px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {priceAnalysis.map((p, i) => (
                    <tr key={i} style={{ background: p.status !== 'ok' ? '#fffde7' : undefined }}>
                      <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #f1f3f4' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                          {p.product_name}
                        </Box>
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f1f3f4', color: '#5f6368' }}>{p.rrp || '—'}</td>
                      <td style={{ textAlign: 'right', padding: '10px 12px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #f1f3f4' }}>{p.avgPrice || '—'}</td>
                      <td style={{ textAlign: 'right', padding: '10px 12px', fontSize: 13, fontWeight: 700, borderBottom: '1px solid #f1f3f4', color: p.status === 'ok' ? '#137333' : p.status === 'high' ? '#e37400' : '#c5221f' }}>
                        {p.deviation !== 0 ? `${p.deviation > 0 ? '+' : ''}${p.deviation}%` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f1f3f4' }}>{p.sales}</td>
                      <td style={{ textAlign: 'right', padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f1f3f4' }}>{p.revenue.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', padding: '10px 12px', borderBottom: '1px solid #f1f3f4' }}>
                        {p.status === 'ok' ? (
                          <Chip label="В норме" size="small" icon={<CheckCircleIcon sx={{ fontSize: 12 }} />} sx={{ bgcolor: '#e6f4ea', color: '#137333', fontWeight: 600, fontSize: 10, height: 22 }} />
                        ) : (
                          <Chip label={p.status === 'high' ? 'Выше РРЦ' : 'Ниже РРЦ'} size="small"
                            icon={p.status === 'high' ? <TrendingUpIcon sx={{ fontSize: 12 }} /> : <TrendingDownIcon sx={{ fontSize: 12 }} />}
                            sx={{ bgcolor: p.status === 'high' ? '#fef7e0' : '#fce8e6', color: p.status === 'high' ? '#e37400' : '#c5221f', fontWeight: 600, fontSize: 10, height: 22, '& .MuiChip-icon': { color: 'inherit' } }} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>

        {/* Store Compliance + Alerts */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Compliance по магазинам</Typography>
                {storeCompliance.map((s, i) => (
                  <Box key={i} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{s.store_name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {s.violations > 0 && <Chip label={`${s.violations} нарушений`} size="small" sx={{ bgcolor: '#fce8e6', color: '#c5221f', fontSize: 9, height: 18, fontWeight: 600 }} />}
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: s.compliance >= 80 ? '#137333' : s.compliance >= 50 ? '#e37400' : '#c5221f' }}>{s.compliance}%</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: '#f1f3f4', borderRadius: 1, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', borderRadius: 1, bgcolor: s.compliance >= 80 ? '#34a853' : s.compliance >= 50 ? '#fbbc04' : '#ea4335', width: `${s.compliance}%`, transition: 'width .5s' }} />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <WarningAmberIcon sx={{ color: '#ea4335', fontSize: 18 }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Последние нарушения</Typography>
                </Box>
                {alerts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: '#34a853', mb: 1 }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#137333' }}>Все цены в норме</Typography>
                    <Typography sx={{ fontSize: 11, color: '#80868b', mt: 0.5 }}>Нет отклонений от РРЦ более 10%</Typography>
                  </Box>
                ) : (
                  alerts.slice(0, 8).map((a, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid #f5f5f5', '&:last-child': { border: 'none' } }}>
                      <Chip label={`${a.deviation_pct > 0 ? '+' : ''}${a.deviation_pct}%`} size="small"
                        sx={{ minWidth: 50, bgcolor: a.deviation_pct > 0 ? '#fef7e0' : '#fce8e6', color: a.deviation_pct > 0 ? '#e37400' : '#c5221f', fontWeight: 700, fontSize: 11, height: 24 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.product_name}</Typography>
                        <Typography sx={{ fontSize: 10, color: '#80868b' }}>{a.store_name}, {a.city}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{Math.round(a.avg_price)} T</Typography>
                        <Typography sx={{ fontSize: 9, color: '#80868b' }}>РРЦ {a.rrp} T</Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Explanation */}
        <Card sx={{ bgcolor: '#f8f9fa', border: '1px solid #e8eaed' }}>
          <CardContent sx={{ py: 2 }}>
            <Typography sx={{ fontSize: 11, color: '#5f6368', lineHeight: 1.6 }}>
              <b>Как это работает:</b> Система автоматически сравнивает фактические цены из чеков потребителей с рекомендованными розничными ценами (РРЦ) ваших товаров. Если отклонение превышает 10%, создаётся алерт. Данные обновляются в реальном времени по мере поступления новых чеков.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
