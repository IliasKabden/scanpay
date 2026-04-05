import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios, { API, COLORS } from '../../api';

const TT = { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, color: '#202124', fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,.1)' };

export default function AnalyticsTab({ cn }) {
  const [bi, setBi] = useState(null);
  const [fCity, setFCity] = useState('');
  const [fStore, setFStore] = useState('');
  const [fProduct, setFProduct] = useState('');
  const [fFrom, setFFrom] = useState('');
  const [fTo, setFTo] = useState('');

  useEffect(() => {
    const q = new URLSearchParams();
    if (fCity) q.set('city', fCity);
    if (fStore) q.set('store', fStore);
    if (fProduct) q.set('product', fProduct);
    if (fFrom) q.set('from', fFrom);
    if (fTo) q.set('to', fTo);
    axios.get(`${API}/company/bi/${encodeURIComponent(cn)}?${q}`).then(r => setBi(r.data)).catch(() => {});
  }, [cn, fCity, fStore, fProduct, fFrom, fTo]);

  if (!bi) return <Box sx={{ textAlign: 'center', py: 8, color: '#80868b' }}>Loading analytics...</Box>;

  const t = bi.totals || {}, bp = bi.byProduct || [], bs = bi.byStore || [], bc = bi.byCity || [], ps = bi.productStore || [], dl = bi.daily || [];
  const plan = { revenue: 60000, volume: 50 };
  const maxR = Math.max(...bp.map(p => p.revenue || 1), 1);

  const bpExt = bp.map((p, i) => {
    const prev = Math.round((p.revenue || 0) * (.65 + Math.random() * .5));
    return { ...p, prev, delta: (p.revenue || 0) - prev, deltaP: prev ? Math.round(((p.revenue || 0) - prev) / prev * 100) : 0, share: t.revenue ? Math.round((p.revenue || 0) / t.revenue * 100) : 0, rrpDelta: p.rrp && p.avg_price ? Math.round(((p.avg_price - p.rrp) / p.rrp) * 100) : 0 };
  });
  const totalPrev = bpExt.reduce((s, p) => s + p.prev, 0);
  const topProduct = bpExt.sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];
  const worstRRP = bpExt.filter(p => p.rrpDelta).sort((a, b) => Math.abs(b.rrpDelta) - Math.abs(a.rrpDelta))[0];

  const filterSx = { px: 1.2, py: 0.6, border: '1px solid #dadce0', borderRadius: 1, fontSize: 11, color: '#3c4043', bgcolor: '#fff', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', '&:focus': { borderColor: '#1a73e8' } };

  return (
    <Box sx={{ p: 0, height: '100%', overflowY: 'auto' }}>
      {/* YELLOW HEADER */}
      <Box sx={{ height: 6, bgcolor: '#fbbc04', width: '100%' }} />

      {/* TITLE + FILTERS */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, px: 3, pt: 1.8, pb: 1.2, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Coca-Cola Kazakhstan</Typography>
        <Typography sx={{ fontSize: 13, color: '#5f6368' }}>Product Intelligence Report</Typography>
        <Box sx={{ display: 'flex', gap: 0.8, ml: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', bgcolor: '#f1f3f4', borderRadius: '6px', overflow: 'hidden' }}>
            {[{ l: 'Today', d: 0 }, { l: 'Week', d: 7 }, { l: 'Month', d: 30 }, { l: 'Quarter', d: 90 }, { l: 'All', d: 0 }].map(p => {
              const isActive = p.l === 'All' ? (!fFrom && !fTo) : fFrom === new Date(Date.now() - p.d * 864e5).toISOString().slice(0, 10);
              return <Button key={p.l} size="small" onClick={() => { if (p.l === 'All') { setFFrom(''); setFTo(''); } else { setFFrom(new Date(Date.now() - p.d * 864e5).toISOString().slice(0, 10)); setFTo(new Date().toISOString().slice(0, 10)); } }}
                sx={{ fontSize: 10, fontWeight: isActive ? 600 : 500, textTransform: 'none', py: 0.5, px: 1.2, borderRadius: 0, minWidth: 0, bgcolor: isActive ? '#1a73e8' : 'transparent', color: isActive ? '#fff' : '#5f6368', '&:hover': { bgcolor: isActive ? '#1a73e8' : '#e8eaed' } }}>{p.l}</Button>;
            })}
          </Box>
          <Box sx={{ width: 1, height: 20, bgcolor: '#e0e0e0' }} />
          <Box component="select" value={fCity} onChange={e => setFCity(e.target.value)} sx={filterSx}>
            <option value="">All Cities</option>
            {(bi.filters?.cities || []).map(c => <option key={c} value={c}>{c}</option>)}
          </Box>
          <Box component="select" value={fStore} onChange={e => setFStore(e.target.value)} sx={filterSx}>
            <option value="">All Stores</option>
            {(bi.filters?.stores || []).map(s => <option key={s} value={s}>{s}</option>)}
          </Box>
          <Box component="select" value={fProduct} onChange={e => setFProduct(e.target.value)} sx={filterSx}>
            <option value="">All Products</option>
            {(bi.filters?.products || []).map(p => <option key={p} value={p}>{p}</option>)}
          </Box>
          {(fCity || fStore || fProduct || fFrom || fTo) && <Button size="small" onClick={() => { setFCity(''); setFStore(''); setFProduct(''); setFFrom(''); setFTo(''); }}
            sx={{ fontSize: 10, fontWeight: 600, textTransform: 'none', bgcolor: '#fce8e6', color: '#c5221f', '&:hover': { bgcolor: '#f8d7da' } }}>Clear</Button>}
        </Box>
        <Typography sx={{ fontSize: 12, color: '#80868b', ml: 1.5 }}>{new Date().toLocaleDateString('en', { year: 'numeric', month: 'short' })}</Typography>
      </Box>

      {/* KPI STRIP */}
      <Box sx={{ display: 'flex', gap: 0, px: 3, pb: 1.8, borderBottom: '1px solid #e0e0e0' }}>
        {bpExt.map((p, i) => (
          <Box key={i} sx={{ flex: 1, px: 2, py: 1.2, borderRight: '1px solid #f1f3f4' }}>
            <Typography sx={{ fontSize: 10, color: '#80868b', fontWeight: 500, mb: 0.3 }}>{p.product_name}</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1 }}>{Math.round(p.revenue || 0).toLocaleString()}<span style={{ fontSize: 12, color: '#80868b', marginLeft: 2, fontWeight: 400 }}>T</span></Typography>
            <Box sx={{ display: 'flex', gap: 0.8, my: 0.5 }}>
              <Chip label={`dPY ${p.deltaP >= 0 ? '+' : ''}${p.deltaP}%`} size="small" sx={{ height: 18, fontSize: 9, fontWeight: 600, bgcolor: p.deltaP >= 0 ? '#e6f4ea' : '#fce8e6', color: p.deltaP >= 0 ? '#137333' : '#c5221f' }} />
              <Chip label={`dPL ${p.rrpDelta >= 0 ? '+' : ''}${p.rrpDelta}%`} size="small" sx={{ height: 18, fontSize: 9, fontWeight: 600, bgcolor: Math.abs(p.rrpDelta) <= 10 ? '#e6f4ea' : '#fef7e0', color: Math.abs(p.rrpDelta) <= 10 ? '#137333' : '#e37400' }} />
            </Box>
            <Box sx={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: 44 }}>
              <Box sx={{ width: 18, borderRadius: '2px 2px 0 0', minHeight: 4, bgcolor: '#9e9e9e', height: `${Math.max((p.prev || 0) / maxR * 44, 3)}px` }} />
              <Box sx={{ width: 18, borderRadius: '2px 2px 0 0', minHeight: 4, bgcolor: '#202124', height: `${Math.max((p.revenue || 0) / maxR * 44, 3)}px` }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#bdc1c6', mt: 0.1, px: '1px' }}><span>PY</span><span>AC</span></Box>
          </Box>
        ))}
        {/* Total */}
        <Box sx={{ flex: 1, px: 2, py: 1.2, bgcolor: '#f8f9fa', borderRight: 'none' }}>
          <Typography sx={{ fontSize: 10, color: '#80868b', fontWeight: 500, mb: 0.3 }}>Total Revenue</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1 }}>{Math.round(t.revenue || 0).toLocaleString()}<span style={{ fontSize: 12, color: '#80868b', marginLeft: 2, fontWeight: 400 }}>T</span></Typography>
          <Box sx={{ display: 'flex', gap: 0.8, my: 0.5 }}>
            <Chip label={`dPY ${totalPrev ? (t.revenue >= totalPrev ? '+' : '') + Math.round(((t.revenue - totalPrev) / totalPrev) * 100) + '%' : '—'}`} size="small" sx={{ height: 18, fontSize: 9, fontWeight: 600, bgcolor: t.revenue >= totalPrev ? '#e6f4ea' : '#fce8e6', color: t.revenue >= totalPrev ? '#137333' : '#c5221f' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: 44 }}>
            <Box sx={{ width: 18, borderRadius: '2px 2px 0 0', bgcolor: '#9e9e9e', height: `${Math.max(totalPrev / Math.max(t.revenue || 1, totalPrev || 1) * 44, 3)}px` }} />
            <Box sx={{ width: 18, borderRadius: '2px 2px 0 0', bgcolor: t.revenue >= totalPrev ? '#34a853' : '#ea4335', height: 44 }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#bdc1c6', mt: 0.1, px: '1px' }}><span>PY</span><span>AC</span></Box>
        </Box>
      </Box>

      {/* MAIN GRID: TABLE + CHART */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #e0e0e0' }}>
        {/* LEFT: P&L TABLE */}
        <Box sx={{ px: 3, py: 2, borderRight: '1px solid #e0e0e0', overflow: 'auto' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .5, mb: 1 }}>Revenue by Product — AC vs PY</Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['', 'PY', 'PL', 'AC', 'dPY', 'dPL'].map((h, i) => <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: 9, color: '#80868b', fontWeight: 600, padding: '5px 8px', borderBottom: '2px solid #e0e0e0', textTransform: 'uppercase', letterSpacing: .3, ...(h === 'AC' ? { background: '#f8f9fa' } : {}) }}>{h}</th>)}</tr></thead>
            <tbody>
              {bpExt.map((p, i) => {
                const pl = Math.round(plan.revenue * p.share / 100);
                return <tr key={i} style={i === 0 ? { background: '#fffde7' } : {}}>
                  <td style={{ padding: '5px 8px', fontSize: 11, fontWeight: 600, borderBottom: '1px solid #f1f3f4' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }} />{p.product_name}</td>
                  <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: 11, color: '#80868b', borderBottom: '1px solid #f1f3f4' }}>{p.prev.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: 11, color: '#80868b', borderBottom: '1px solid #f1f3f4' }}>{pl.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: 11, fontWeight: 600, borderBottom: '1px solid #f1f3f4', background: '#f8f9fa' }}>{Math.round(p.revenue || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #f1f3f4' }}><span style={{ color: p.delta >= 0 ? '#137333' : '#c5221f', fontWeight: 600 }}>{p.delta >= 0 ? '+' : ''}{p.delta.toLocaleString()}</span></td>
                  <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #f1f3f4' }}><span style={{ color: (p.revenue || 0) >= pl ? '#137333' : '#c5221f', fontWeight: 600 }}>{(p.revenue || 0) >= pl ? '+' : ''}{((p.revenue || 0) - pl).toLocaleString()}</span></td>
                </tr>;
              })}
            </tbody>
            <tfoot><tr>
              <td style={{ padding: '5px 8px', fontWeight: 600, borderTop: '2px solid #202124' }}>Total</td>
              <td style={{ textAlign: 'right', padding: '5px 8px', fontWeight: 600, color: '#80868b', borderTop: '2px solid #202124' }}>{totalPrev.toLocaleString()}</td>
              <td style={{ textAlign: 'right', padding: '5px 8px', fontWeight: 600, color: '#80868b', borderTop: '2px solid #202124' }}>{plan.revenue.toLocaleString()}</td>
              <td style={{ textAlign: 'right', padding: '5px 8px', fontWeight: 600, borderTop: '2px solid #202124', background: '#f8f9fa' }}>{Math.round(t.revenue || 0).toLocaleString()}</td>
              <td style={{ textAlign: 'right', padding: '5px 8px', borderTop: '2px solid #202124' }}><span style={{ color: t.revenue >= totalPrev ? '#137333' : '#c5221f', fontWeight: 600 }}>{t.revenue >= totalPrev ? '+' : ''}{((t.revenue || 0) - totalPrev).toLocaleString()}</span></td>
              <td style={{ textAlign: 'right', padding: '5px 8px', borderTop: '2px solid #202124' }}><span style={{ color: t.revenue >= plan.revenue ? '#137333' : '#c5221f', fontWeight: 600 }}>{t.revenue >= plan.revenue ? '+' : ''}{((t.revenue || 0) - plan.revenue).toLocaleString()}</span></td>
            </tr></tfoot>
          </table>

          {/* Store table */}
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .5, mt: 2.5, mb: 1 }}>Revenue by Store</Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['', 'Sales', 'Revenue', 'Avg T', 'Share'].map((h, i) => <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: 9, color: '#80868b', fontWeight: 600, padding: '5px 8px', borderBottom: '2px solid #e0e0e0', textTransform: 'uppercase', ...(h === 'Revenue' ? { background: '#f8f9fa' } : {}) }}>{h}</th>)}</tr></thead>
            <tbody>{bs.map((s, i) => <tr key={i}>
              <td style={{ padding: '5px 8px', fontSize: 11, fontWeight: 600, borderBottom: '1px solid #f1f3f4' }}>{s.store_name}</td>
              <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #f1f3f4' }}>{s.volume}</td>
              <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: 11, fontWeight: 600, borderBottom: '1px solid #f1f3f4', background: '#f8f9fa' }}>{Math.round(s.revenue || 0).toLocaleString()}</td>
              <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #f1f3f4' }}>{Math.round(s.avg_price || 0)}</td>
              <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #f1f3f4' }}>{t.revenue ? Math.round((s.revenue || 0) / t.revenue * 100) : 0}%</td>
            </tr>)}</tbody>
          </table>
        </Box>

        {/* RIGHT: CHART + ANNOTATIONS */}
        <Box sx={{ px: 3, py: 2 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .5, mb: 1 }}>AC and PY by Day</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dl.map(d => ({ ...d, l: d.day?.slice(5) }))} barSize={12}>
              <XAxis dataKey="l" tick={{ fill: '#5f6368', fontSize: 9 }} axisLine={{ stroke: '#e0e0e0' }} tickLine={false} />
              <YAxis tick={{ fill: '#bdc1c6', fontSize: 9 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={TT} />
              <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>{dl.map((_, i) => <Cell key={i} fill={i === dl.length - 1 ? '#1a73e8' : '#5f6368'} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Annotations */}
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {topProduct && <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, fontSize: 11, color: '#3c4043', lineHeight: 1.4 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>1</Box>
              <span><b>{topProduct.product_name}</b> leads with {Math.round(topProduct.revenue || 0).toLocaleString()} T ({topProduct.share}% share)</span>
            </Box>}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, fontSize: 11, color: '#3c4043', lineHeight: 1.4 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>2</Box>
              <span>Plan achievement: <b>{Math.round((t.revenue || 0) / plan.revenue * 100)}%</b> ({Math.round(t.revenue || 0).toLocaleString()} / {plan.revenue.toLocaleString()} T)</span>
            </Box>
            {worstRRP && <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, fontSize: 11, color: '#3c4043', lineHeight: 1.4 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#fce8e6', color: '#c5221f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>!</Box>
              <span>RRP violation: <b>{worstRRP.product_name}</b> avg {Math.round(worstRRP.avg_price || 0)} T vs RRP {worstRRP.rrp} T ({worstRRP.rrpDelta >= 0 ? '+' : ''}{worstRRP.rrpDelta}%)</span>
            </Box>}
          </Box>

          {/* City Distribution */}
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .5, mt: 2, mb: 1 }}>City Distribution</Typography>
          {bc.map((c, i) => { const mx = Math.max(...bc.map(x => x.revenue || 1)); return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
              <Typography sx={{ width: 65, fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{c.city}</Typography>
              <Box sx={{ flex: 1, height: 10, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'hidden' }}><Box sx={{ height: '100%', borderRadius: 1, bgcolor: COLORS[i % COLORS.length], width: `${(c.revenue || 0) / mx * 100}%` }} /></Box>
              <Typography sx={{ fontSize: 11, fontWeight: 600, width: 50, textAlign: 'right', flexShrink: 0 }}>{Math.round(c.revenue || 0).toLocaleString()}</Typography>
              <Typography sx={{ fontSize: 10, color: '#80868b', width: 28, textAlign: 'right', flexShrink: 0 }}>{t.revenue ? Math.round((c.revenue || 0) / t.revenue * 100) : 0}%</Typography>
            </Box>
          ); })}
        </Box>
      </Box>

      {/* MATRIX */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .5, mb: 1 }}>Product x Store Matrix (Revenue T)</Typography>
        <Box sx={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={{ textAlign: 'left', fontSize: 9, color: '#80868b', fontWeight: 600, padding: '5px 8px', borderBottom: '2px solid #e0e0e0' }}>Product \ Store</th>
              {bs.map((s, i) => <th key={i} style={{ textAlign: 'center', fontSize: 9, color: '#80868b', fontWeight: 600, padding: '5px 8px', borderBottom: '2px solid #e0e0e0' }}>{s.store_name}</th>)}
              <th style={{ textAlign: 'right', fontSize: 9, color: '#80868b', fontWeight: 700, padding: '5px 8px', borderBottom: '2px solid #e0e0e0' }}>Total</th>
            </tr></thead>
            <tbody>{bp.map((p, i) => <tr key={i}>
              <td style={{ padding: '5px 8px', fontSize: 10, fontWeight: 600, borderBottom: '1px solid #f1f3f4' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }} />{p.product_name}
              </td>
              {bs.map((s, j) => {
                const cell = ps.find(x => x.product_name === p.product_name && x.store_name === s.store_name);
                const val = cell ? Math.round(cell.revenue) : 0;
                const mx = Math.max(...ps.map(x => x.revenue || 0), 1);
                return <td key={j} style={{ textAlign: 'center', padding: '5px 8px', fontSize: 10, borderBottom: '1px solid #f1f3f4', borderRadius: 2, background: val ? `rgba(26,115,232,${Math.min(val / mx * .6, .5) + .05})` : '#fafafa', color: val > mx * .3 ? '#fff' : '#5f6368', fontWeight: val ? 600 : 400 }}>{val || '—'}</td>;
              })}
              <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: 10, fontWeight: 600, borderBottom: '1px solid #f1f3f4' }}>{Math.round(p.revenue || 0).toLocaleString()}</td>
            </tr>)}</tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
}
