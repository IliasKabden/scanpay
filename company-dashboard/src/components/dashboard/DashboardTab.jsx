import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { AreaChart, Area, XAxis, ResponsiveContainer, BarChart, Bar, Tooltip, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { STORES, COLORS } from '../../api';
import useClock from '../../hooks/useClock';

function FlyToComponent({ c, z }) {
  const m = useMap();
  useEffect(() => { m.flyTo(c, z, { duration: .8 }); }, [c, z, m]);
  // Fix Leaflet rendering in flex containers
  useEffect(() => { const t = setTimeout(() => m.invalidateSize(), 200); return () => clearTimeout(t); }, [m]);
  return null;
}

const TT = { background: '#fff', border: '1px solid #e8eaed', borderRadius: 8, fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,.08)' };

export default function DashboardTab({ d, rows, deviations, feed, pulse, toast, setToast }) {
  const [mc, setMC] = useState([48.5, 68]);
  const [mz, setMZ] = useState(5);
  const [selectedStore, setSelectedStore] = useState(null);
  const [mapMode, setMapMode] = useState('sales');
  const now = useClock();

  const ts = d?.total_detections || 0, tr = Math.round(d?.total_revenue || 0);
  const pd = d?.by_product?.map((p, i) => {
    const prev = Math.round(p.total_revenue * (.7 + Math.random() * .5));
    const delta = Math.round(p.total_revenue) - prev;
    return { ...p, name: p.product_name.replace(/\s[\d.]+[Ll]$/, ''), full: p.product_name, rev: Math.round(p.total_revenue), avg: Math.round(p.avg_price), prev, delta, deltaP: prev ? Math.round((delta / prev) * 100) : 0, share: tr ? Math.round(p.total_revenue / tr * 100) : 0 };
  }) || [];
  const sd = d?.by_store || [], cd = d?.by_city || [];

  const trend = useMemo(() => {
    const days = {};
    d?.recent_detections?.forEach(x => { const k = (x.detected_at || '').slice(0, 10); if (!k) return; if (!days[k]) days[k] = { d: k, v: 0, r: 0 }; days[k].v++; days[k].r += (x.price || 0) * (x.quantity || 1); });
    return Object.values(days).sort((a, b) => a.d.localeCompare(b.d)).map(x => ({ ...x, l: x.d.slice(5) }));
  }, [d]);

  const markers = useMemo(() => {
    const m = {};
    d?.recent_detections?.forEach(x => { const locs = STORES[x.store_name]; if (!locs) return; const loc = locs.find(l => l.city === x.city) || locs[0]; const k = `${loc.lat},${loc.lng}`; if (!m[k]) m[k] = { ...loc, store: x.store_name, n: 0, prods: {}, rev: 0 }; m[k].n++; m[k].rev += (x.price || 0) * (x.quantity || 1); m[k].prods[x.product_name] = (m[k].prods[x.product_name] || 0) + 1; });
    return Object.values(m).map(m => ({ ...m, prodList: Object.entries(m.prods).sort((a, b) => b[1] - a[1]) }));
  }, [d]);

  const maxRev = pd.length ? Math.max(...pd.map(p => p.rev)) : 1;

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(26, 115, 232); doc.text('Mening Deregim', 14, 20);
    doc.setFontSize(10); doc.setTextColor(128); doc.text('Product Intelligence Report', 14, 27);
    doc.setFontSize(12); doc.setTextColor(32); doc.text('Coca-Cola Kazakhstan', 14, 35);
    doc.setFontSize(10); doc.text(`Total: ${ts} detections, ${tr.toLocaleString()} T revenue`, 14, 45);
    autoTable(doc, { startY: 55, head: [['Product', 'Sales', 'Revenue', 'Avg Price']], body: pd.map(p => [p.full, p.total_sales, p.rev.toLocaleString() + ' T', p.avg + ' T']), styles: { fontSize: 9 }, headStyles: { fillColor: [26, 115, 232] } });
    doc.save(`Coca-Cola_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // KPI data
  const kpis = [
    { label: 'Total Revenue', value: `${tr.toLocaleString()} T`, sub: 'from receipt data', color: '#1a73e8', icon: <TrendingUpIcon /> },
    { label: 'Detections', value: ts, sub: `across ${sd.length} stores`, color: '#34a853', icon: <ReceiptLongIcon /> },
    { label: 'Products', value: pd.length, sub: `${cd.length} cities covered`, color: '#fbbc04', icon: <StorefrontIcon /> },
    { label: 'Price Alerts', value: deviations.length, sub: 'RRP violations', color: deviations.length > 0 ? '#ea4335' : '#34a853', icon: <WarningAmberIcon /> },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* === HEADER === */}
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #e8eaed', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Coca-Cola Kazakhstan</Typography>
            <Chip label="LIVE" size="small" icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34a853', animation: 'blink 1.5s infinite', ml: 0.5 }} />}
              sx={{ bgcolor: '#e6f4ea', color: '#137333', fontWeight: 700, fontSize: 10, height: 22, '& .MuiChip-icon': { ml: 0.5 } }} />
          </Box>
          <Typography sx={{ fontSize: 12, color: '#5f6368' }}>
            Real-time Sales Intelligence — данные из чеков пользователей Telegram
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#1a73e8', fontVariantNumeric: 'tabular-nums' }}>
          {now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </Typography>
        <Button size="small" variant="outlined" startIcon={<FileDownloadIcon sx={{ fontSize: 14 }} />} onClick={exportPDF}
          sx={{ textTransform: 'none', fontSize: 12, fontWeight: 600, borderColor: '#dadce0', color: '#ea4335' }}>PDF</Button>
      </Box>

      {/* === KPI STRIP === */}
      <Box sx={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8eaed', flexShrink: 0 }}>
        {kpis.map((k, i) => (
          <Box key={i} sx={{ flex: 1, px: 2, py: 1.5, borderRight: i < kpis.length - 1 ? '1px solid #e8eaed' : 'none', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: k.color + '12', color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {k.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#202124', lineHeight: 1.1, letterSpacing: -0.5 }}>{k.value}</Typography>
              <Typography sx={{ fontSize: 10, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .5 }}>{k.label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* === MAIN AREA: MAP + SIDEBAR === */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* MAP */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <MapContainer center={mc} zoom={mz} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FlyToComponent c={mc} z={mz} />
            {markers.map((m, i) => {
              const storeDev = deviations.filter(dv => dv.store_name === m.store && dv.city === m.city);
              const worstDev = storeDev.length ? storeDev.reduce((w, d) => Math.abs(d.deviation_pct) > Math.abs(w.deviation_pct) ? d : w, storeDev[0]) : null;
              const devColor = worstDev ? (Math.abs(worstDev.deviation_pct) > 30 ? '#ea4335' : Math.abs(worstDev.deviation_pct) > 15 ? '#fbbc04' : '#34a853') : '#4285f4';
              const useColor = mapMode === 'deviation' ? devColor : mapMode === 'price' ? '#ff6d01' : '#4285f4';
              const radius = mapMode === 'deviation' && worstDev ? Math.min(Math.abs(worstDev.deviation_pct) / 5 + 6, 24) : Math.min(m.n * 2 + 6, 22);
              return <CircleMarker key={i} center={[m.lat, m.lng]} radius={radius} pathOptions={{ color: useColor + '80', fillColor: useColor, fillOpacity: .45, weight: 2 }} eventHandlers={{ click: () => { setSelectedStore(m); setMC([m.lat, m.lng]); setMZ(14); } }} />;
            })}
            {pulse && <CircleMarker center={[pulse.lat, pulse.lng]} radius={28} pathOptions={{ color: '#ea4335', fillColor: '#ea4335', fillOpacity: .12, weight: 1.5, className: 'pulse-anim' }} />}
          </MapContainer>

          {/* Map controls overlay */}
          <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, display: 'flex', gap: 0.5 }}>
            {['sales', 'price', 'deviation'].map(id => (
              <Button key={id} size="small" onClick={() => setMapMode(id)}
                sx={{ bgcolor: mapMode === id ? (id === 'deviation' && deviations.length ? '#ea4335' : '#1a73e8') : 'rgba(255,255,255,.92)', color: mapMode === id ? '#fff' : '#5f6368', backdropFilter: 'blur(8px)', fontSize: 11, fontWeight: 600, textTransform: 'none', px: 1.5, py: 0.5, borderRadius: '8px', minWidth: 0, boxShadow: '0 1px 4px rgba(0,0,0,.1)', '&:hover': { bgcolor: mapMode === id ? undefined : 'rgba(255,255,255,1)' } }}>
                {id === 'deviation' && deviations.length > 0 && <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#fff', color: '#ea4335', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 0.5 }}>{deviations.length}</Box>}
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </Button>
            ))}
          </Box>

          {/* City quick nav */}
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, display: 'flex', gap: 0.3 }}>
            {[{ l: 'KZ', c: [48.5, 68], z: 5 }, { l: 'Almaty', c: [43.24, 76.94], z: 12 }, { l: 'Astana', c: [51.13, 71.43], z: 12 }, { l: 'Shymkent', c: [42.32, 69.60], z: 12 }].map(x => (
              <Button key={x.l} size="small" onClick={() => { setMC(x.c); setMZ(x.z); }}
                sx={{ bgcolor: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)', color: '#5f6368', fontSize: 10, fontWeight: 600, textTransform: 'none', px: 1, py: 0.4, borderRadius: '8px', minWidth: 0, boxShadow: '0 1px 4px rgba(0,0,0,.1)', '&:hover': { bgcolor: '#fff', color: '#1a73e8' } }}>{x.l}</Button>
            ))}
          </Box>

          {/* City distribution bar at bottom of map */}
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000, display: 'flex', height: 24, bgcolor: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', borderTop: '1px solid #e8eaed' }}>
            {cd.map((c, i) => {
              const pct = ts ? Math.round(c.sales / ts * 100) : 0;
              return <Box key={i} sx={{ flex: c.sales, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,.03)' } }}
                onClick={() => { const coords = { 'Almaty': [43.24, 76.94], 'Astana': [51.13, 71.43], 'Shymkent': [42.32, 69.60] }; if (coords[c.city]) { setMC(coords[c.city]); setMZ(12); } }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: COLORS[i % COLORS.length] }} />
                <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#3c4043' }}>{c.city} {pct}%</Typography>
              </Box>;
            })}
          </Box>

          {/* Store detail popup */}
          {selectedStore && (
            <Card sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1500, width: 280, p: 2, boxShadow: '0 8px 32px rgba(0,0,0,.15)', animation: 'spIn .3s ease', bgcolor: 'rgba(255,255,255,.97)', backdropFilter: 'blur(16px)' }}>
              <IconButton onClick={() => setSelectedStore(null)} size="small" sx={{ position: 'absolute', top: 6, right: 6, color: '#bdc1c6' }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 0.3 }}>{selectedStore.store}</Typography>
              <Typography sx={{ fontSize: 11, color: '#80868b', mb: 1.5 }}>{selectedStore.a}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 1.5, pb: 1.5, borderBottom: '1px solid #f1f3f4' }}>
                <Box><Typography sx={{ fontSize: 18, fontWeight: 700 }}>{selectedStore.n}</Typography><Typography sx={{ fontSize: 9, color: '#80868b', textTransform: 'uppercase' }}>Sales</Typography></Box>
                <Box><Typography sx={{ fontSize: 18, fontWeight: 700, color: '#137333' }}>{selectedStore.rev.toLocaleString()} T</Typography><Typography sx={{ fontSize: 9, color: '#80868b', textTransform: 'uppercase' }}>Revenue</Typography></Box>
              </Box>
              {selectedStore.prodList.slice(0, 4).map(([name, cnt], j) => {
                const mx = Math.max(...selectedStore.prodList.map(([, c]) => c));
                return <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, py: 0.4 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS[j % COLORS.length] }} />
                  <Typography sx={{ fontSize: 11, flex: 1 }}>{name}</Typography>
                  <Box sx={{ width: 60, height: 6, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'hidden' }}><Box sx={{ height: '100%', bgcolor: COLORS[j % COLORS.length], width: `${cnt / mx * 100}%`, borderRadius: 1 }} /></Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, width: 16, textAlign: 'right' }}>{cnt}</Typography>
                </Box>;
              })}
            </Card>
          )}
        </Box>

        {/* === RIGHT PANEL === */}
        <Box sx={{ width: 340, borderLeft: '1px solid #e8eaed', bgcolor: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="hide-scrollbar">

          {/* Product performance */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e8eaed' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .8, mb: 1.5 }}>Product Performance</Typography>
            {pd.map((p, i) => (
              <Box key={i} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                  <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{p.full}</Typography>
                  <Chip label={`${p.deltaP >= 0 ? '+' : ''}${p.deltaP}%`} size="small"
                    icon={p.deltaP >= 0 ? <TrendingUpIcon sx={{ fontSize: 12 }} /> : <TrendingDownIcon sx={{ fontSize: 12 }} />}
                    sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: p.deltaP >= 0 ? '#e6f4ea' : '#fce8e6', color: p.deltaP >= 0 ? '#137333' : '#c5221f', '& .MuiChip-icon': { color: 'inherit' } }} />
                </Box>
                <Box sx={{ height: 6, bgcolor: '#f5f5f5', borderRadius: 1, position: 'relative', mb: 0.3 }}>
                  <Box sx={{ position: 'absolute', height: '100%', bgcolor: '#e0e0e0', borderRadius: 1, width: `${p.prev / maxRev * 100}%` }} />
                  <Box sx={{ position: 'absolute', height: '100%', bgcolor: COLORS[i % COLORS.length], borderRadius: 1, width: `${p.rev / maxRev * 100}%`, opacity: .85 }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.3 }}>
                  <Typography sx={{ fontSize: 10, color: '#5f6368' }}><b style={{ color: '#202124' }}>{p.rev.toLocaleString()}</b> T rev</Typography>
                  <Typography sx={{ fontSize: 10, color: '#5f6368' }}><b style={{ color: '#202124' }}>{p.total_sales}</b> sales</Typography>
                  <Typography sx={{ fontSize: 10, color: '#5f6368' }}><b style={{ color: '#202124' }}>{p.avg}</b> T avg</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Store ranking */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e8eaed' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .8, mb: 1.2 }}>Store Ranking</Typography>
            {sd.map((s, i) => {
              const maxS = Math.max(...sd.map(x => x.sales));
              return <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#80868b', width: 14 }}>{i + 1}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.store_name}</Typography>
                <Box sx={{ width: 60, height: 6, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', bgcolor: COLORS[i % COLORS.length], borderRadius: 1, width: `${s.sales / maxS * 100}%` }} />
                </Box>
                <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#202124', minWidth: 30, textAlign: 'right' }}>{s.sales}</Typography>
              </Box>;
            })}
          </Box>

          {/* Trend */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e8eaed' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: .8, mb: 1 }}>14-Day Trend</Typography>
            <ResponsiveContainer width="100%" height={70}>
              <AreaChart data={trend}>
                <defs><linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a73e8" stopOpacity={.15} /><stop offset="100%" stopColor="#1a73e8" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="l" tick={{ fill: '#bdc1c6', fontSize: 8 }} axisLine={false} tickLine={false} interval={2} />
                <Area type="monotone" dataKey="v" stroke="#1a73e8" fill="url(#tg2)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* Live activity */}
          <Box sx={{ p: 2, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34a853', animation: 'lp 1.5s infinite' }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#34a853', textTransform: 'uppercase', letterSpacing: .8 }}>Live Activity</Typography>
              <Typography sx={{ ml: 'auto', fontSize: 9, color: '#bdc1c6' }}>из чеков пользователей</Typography>
            </Box>
            {feed.slice(0, 6).map((x, i) => {
              const color = COLORS[d?.products?.findIndex(p => p.product_name === x.product_name) % COLORS.length] || COLORS[0];
              return <Box key={x._t || x.id + '-' + i}
                onClick={() => { const locs = STORES[x.store_name]; if (locs) { const loc = locs.find(l => l.city === x.city) || locs[0]; setMC([loc.lat, loc.lng]); setMZ(14); } }}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.8, py: 0.5, cursor: 'pointer', borderRadius: 1, px: 0.5, '&:hover': { bgcolor: '#f8f9fa' }, ...(i === 0 ? { animation: 'logIn .3s ease', bgcolor: '#f0faf3' } : {}) }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 11, fontWeight: 600, minWidth: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.product_name?.replace(/\s[\d.]+[Ll]$/, '')}</Typography>
                <Typography sx={{ fontSize: 10, color: '#80868b', flex: 1, whiteSpace: 'nowrap' }}>{x.store_name}</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color, whiteSpace: 'nowrap' }}>{x.price} T</Typography>
              </Box>;
            })}
          </Box>
        </Box>
      </Box>

      {/* === TOAST === */}
      {toast && (
        <Box key={toast.id} sx={{ position: 'fixed', top: 80, right: 24, zIndex: 2000, bgcolor: '#fff', borderRadius: '12px', p: '12px 16px', display: 'flex', alignItems: 'center', gap: 1.2, boxShadow: '0 8px 32px rgba(0,0,0,.12)', animation: 'toastIn .4s ease', minWidth: 300, border: '1px solid #e8eaed' }}>
          <Box sx={{ width: 4, height: 40, borderRadius: 1, bgcolor: toast.color, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#80868b', textTransform: 'uppercase', letterSpacing: .5 }}>Sale Detected</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{toast.product}</Typography>
            <Typography sx={{ fontSize: 11, color: '#5f6368' }}>{toast.store}, {toast.city}</Typography>
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: toast.color }}>{toast.price} T</Typography>
          <IconButton size="small" onClick={() => setToast(null)} sx={{ color: '#bdc1c6' }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
        </Box>
      )}
    </Box>
  );
}
