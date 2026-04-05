import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import axios, { API, COLORS } from '../../api';

const CATEGORIES = ['drinks', 'water', 'food', 'snacks', 'dairy', 'household', 'other'];

export default function ProductsTab({ cn, d, rows, setRows, load }) {
  const [nr, setNR] = useState([{ product_name: '', brand: '', category: 'drinks', keywords: '', barcode: '', rrp: '' }]);
  const [ec, setEC] = useState(null);

  function cellChange(ri, field, val) { setRows(prev => prev.map((r, i) => i === ri ? { ...r, [field]: val, _dirty: true } : r)); }
  async function cellBlur(ri) {
    const r = rows[ri]; if (!r || !r._dirty) return;
    const kw = (() => { try { const v = r.keywords; return typeof v === 'string' && v.startsWith('[') ? JSON.parse(v) : v; } catch { return r.keywords; } })();
    const kwArr = Array.isArray(kw) ? kw : String(kw || '').split(',').map(k => k.trim()).filter(Boolean);
    try { await axios.put(`${API}/company/products/${r.id}`, { product_name: r.product_name, brand: r.brand, category: r.category, keywords: kwArr, barcode: r.barcode || '', rrp: parseFloat(r.rrp) || 0 }); } catch (e) { console.error('Save failed', e); }
    setRows(prev => prev.map((x, i) => i === ri ? { ...x, _dirty: false } : x));
  }
  function updNR(i, f, v) { setNR(p => p.map((r, j) => j === i ? { ...r, [f]: v } : r)); }
  async function saveNR(i) { const row = nr[i]; if (!row.product_name) return; await axios.post(`${API}/company/products`, { company_name: cn, product_name: row.product_name, brand: row.brand, category: row.category, keywords: row.keywords?.split(',').map(k => k.trim()).filter(Boolean) || [row.product_name.toLowerCase()], barcode: row.barcode || '', rrp: parseFloat(row.rrp) || 0 }); setNR(p => p.filter((_, j) => j !== i)); if (nr.length <= 1) setNR([{ product_name: '', brand: '', category: 'drinks', keywords: '', barcode: '', rrp: '' }]); load(); }
  async function delP(id) { await axios.delete(`${API}/company/products/${id}`); load(); }

  const ts = d?.total_detections || 0, tr = Math.round(d?.total_revenue || 0);
  const parseKw = (r) => { try { const v = r.keywords; return typeof v === 'string' && v.startsWith('[') ? JSON.parse(v).join(', ') : v || ''; } catch { return r.keywords || ''; } };

  const thSx = { bgcolor: '#f8f9fa', borderBottom: '2px solid #dadce0', borderRight: '1px solid #e2e5e9', textAlign: 'center', fontSize: 11, fontWeight: 500, color: '#5f6368', height: 32, p: 0 };
  const cellSx = { borderBottom: '1px solid #e8eaed', borderRight: '1px solid #e8eaed', p: 0, height: 28, fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap' };
  const inputSx = { width: '100%', height: 28, padding: '0 6px', border: 'none', background: 'transparent', fontSize: 11, color: '#202124', outline: 'none', fontFamily: 'inherit' };

  return (
    <Box sx={{ p: '20px 24px', height: '100%', overflowY: 'auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 24, height: 24, borderRadius: '4px', bgcolor: '#0f9d58', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>#</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Product Catalog</Typography>
            <Typography sx={{ fontSize: 12, color: '#80868b' }}>{rows.length} products tracked &middot; Add your SKUs to detect them in consumer receipts</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<AddIcon />}
            onClick={() => setNR(p => [...p, { product_name: '', brand: '', category: 'drinks', keywords: '', barcode: '', rrp: '' }])}
            sx={{ textTransform: 'none', fontSize: 12, fontWeight: 600, borderColor: '#dadce0', color: '#3c4043' }}>
            Add Product
          </Button>
          <Button variant="contained" size="small" startIcon={<SaveIcon />}
            onClick={() => nr.forEach((_, i) => saveNR(i))}
            sx={{ textTransform: 'none', fontSize: 12, fontWeight: 600 }}>
            Save All
          </Button>
        </Box>
      </Box>

      {/* INFO BANNER */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, bgcolor: '#e8f0fe', border: '1px solid #a8c7fa', borderRadius: 1, p: '12px 16px', mb: 2, fontSize: 12, lineHeight: 1.5 }}>
        <InfoOutlinedIcon sx={{ color: '#1a73e8', fontSize: 18, mt: 0.2 }} />
        <Typography sx={{ fontSize: 12 }}><b style={{ color: '#1a73e8' }}>How it works:</b> Add your products with keywords that match receipt text. When users scan receipts containing your products, the system automatically detects and tracks sales.</Typography>
      </Box>

      {/* SPREADSHEET */}
      <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Formula bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #dadce0', height: 24, fontSize: 11 }}>
          <Box sx={{ width: 50, textAlign: 'center', borderRight: '1px solid #dadce0', bgcolor: '#f8f9fa', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}>
            {ec ? `${String.fromCharCode(65 + (ec.c || 0))}${(ec.r || 0) + 1}` : 'A1'}
          </Box>
          <Box sx={{ width: 22, textAlign: 'center', color: '#5f6368', fontStyle: 'italic', borderRight: '1px solid #dadce0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>fx</Box>
          <Box sx={{ flex: 1, px: 0.8, height: '100%', display: 'flex', alignItems: 'center' }}>{ec?.v || ''}</Box>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: 36, ...thSxObj }}></th>
                {[['A', 'Product Name', 180], ['B', 'Brand', 100], ['C', 'Category', 90], ['D', 'Barcode', 110], ['E', 'RRP T', 80], ['F', 'Keywords', 220], ['G', 'Sales', 50], ['H', 'Revenue', 80], ['I', 'Avg Price', 65]].map(([col, sub, w]) => (
                  <th key={col} style={{ width: w, background: '#f8f9fa', borderBottom: '2px solid #dadce0', borderRight: '1px solid #e2e5e9', textAlign: 'center', fontSize: 11, fontWeight: 500, color: '#5f6368', height: 32 }}>
                    {col}<div style={{ fontSize: 8, color: '#80868b', textTransform: 'uppercase', letterSpacing: .5 }}>{sub}</div>
                  </th>
                ))}
                <th style={{ width: 36 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => {
                const p = d?.by_product?.find(x => x.product_name === r.product_name);
                const kw = parseKw(r);
                const active = (c) => ec?.r === ri && ec?.c === c;
                return (
                  <tr key={r.id} style={{ height: 28, background: r._dirty ? '#fffde7' : undefined }}>
                    <td style={{ width: 36, background: '#f8f9fa', borderBottom: '1px solid #e8eaed', borderRight: '1px solid #dadce0', textAlign: 'center', fontSize: 10, color: r._dirty ? '#1a73e8' : '#80868b', fontWeight: r._dirty ? 600 : 400 }}>{ri + 1}</td>
                    <td style={{ ...cellSxObj, outline: active(0) ? '2px solid #1a73e8' : undefined, background: active(0) ? '#e8f0fe' : undefined }}>
                      <input style={inputSx} value={r.product_name || ''} onChange={e => cellChange(ri, 'product_name', e.target.value)} onFocus={() => setEC({ r: ri, c: 0, v: r.product_name })} onBlur={() => cellBlur(ri)} />
                    </td>
                    <td style={{ ...cellSxObj, outline: active(1) ? '2px solid #1a73e8' : undefined, background: active(1) ? '#e8f0fe' : undefined }}>
                      <input style={inputSx} value={r.brand || ''} onChange={e => cellChange(ri, 'brand', e.target.value)} onFocus={() => setEC({ r: ri, c: 1, v: r.brand })} onBlur={() => cellBlur(ri)} />
                    </td>
                    <td style={{ ...cellSxObj, outline: active(2) ? '2px solid #1a73e8' : undefined }}>
                      <select style={{ ...inputSx, padding: '0 3px' }} value={r.category || 'drinks'} onChange={e => { cellChange(ri, 'category', e.target.value); setTimeout(() => cellBlur(ri), 100); }} onFocus={() => setEC({ r: ri, c: 2, v: r.category })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </td>
                    <td style={{ ...cellSxObj, outline: active(3) ? '2px solid #1a73e8' : undefined }}>
                      <input style={{ ...inputSx, fontFamily: 'monospace', fontSize: 10, color: '#80868b' }} value={r.barcode || ''} placeholder="EAN-13" onChange={e => cellChange(ri, 'barcode', e.target.value)} onFocus={() => setEC({ r: ri, c: 3, v: r.barcode })} onBlur={() => cellBlur(ri)} />
                    </td>
                    <td style={{ ...cellSxObj, outline: active(4) ? '2px solid #1a73e8' : undefined }}>
                      <input style={{ ...inputSx, textAlign: 'right' }} type="number" value={r.rrp || ''} placeholder="T" onChange={e => cellChange(ri, 'rrp', e.target.value)} onFocus={() => setEC({ r: ri, c: 4, v: r.rrp })} onBlur={() => cellBlur(ri)} />
                    </td>
                    <td style={{ ...cellSxObj, outline: active(5) ? '2px solid #1a73e8' : undefined }}>
                      <input style={{ ...inputSx, fontSize: 10, color: '#5f6368' }} value={kw} placeholder="keywords" onChange={e => cellChange(ri, 'keywords', e.target.value)} onFocus={() => setEC({ r: ri, c: 5, v: kw })} onBlur={() => cellBlur(ri)} />
                    </td>
                    <td style={{ ...cellSxObj, textAlign: 'right', background: '#fafafa', color: '#5f6368', padding: '0 5px' }}>{p?.total_sales || 0}</td>
                    <td style={{ ...cellSxObj, textAlign: 'right', background: '#fafafa', color: '#137333', fontWeight: 500, padding: '0 5px' }}>{p ? Math.round(p.total_revenue).toLocaleString() + ' T' : '0 T'}</td>
                    <td style={{ ...cellSxObj, textAlign: 'right', background: '#fafafa', color: '#5f6368', padding: '0 5px' }}>{p ? Math.round(p.avg_price) + ' T' : '—'}</td>
                    <td style={{ ...cellSxObj, textAlign: 'center', borderRight: 'none', width: 36 }}>
                      <button onClick={() => delP(r.id)} style={{ background: 'none', border: 'none', color: '#bdc1c6', cursor: 'pointer', fontSize: 16 }}>&times;</button>
                    </td>
                  </tr>
                );
              })}
              {nr.map((r, i) => (
                <tr key={`n${i}`} style={{ height: 28, background: '#fef7e0' }}>
                  <td style={{ width: 36, background: '#e8f0fe', borderBottom: '1px solid #e8eaed', borderRight: '1px solid #dadce0', textAlign: 'center', fontSize: 10, color: '#1a73e8', fontWeight: 600 }}>{rows.length + i + 1}</td>
                  <td style={cellSxObj}><input style={inputSx} placeholder="e.g. Coca-Cola Zero 0.5L" value={r.product_name} onChange={e => updNR(i, 'product_name', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveNR(i); }} /></td>
                  <td style={cellSxObj}><input style={inputSx} placeholder="Coca-Cola" value={r.brand} onChange={e => updNR(i, 'brand', e.target.value)} /></td>
                  <td style={cellSxObj}><select style={{ ...inputSx, padding: '0 3px' }} value={r.category} onChange={e => updNR(i, 'category', e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></td>
                  <td style={cellSxObj}><input style={inputSx} placeholder="4870001234567" value={r.barcode || ''} onChange={e => updNR(i, 'barcode', e.target.value)} /></td>
                  <td style={cellSxObj}><input style={{ ...inputSx, textAlign: 'right' }} placeholder="450" value={r.rrp || ''} onChange={e => updNR(i, 'rrp', e.target.value)} type="number" /></td>
                  <td style={cellSxObj}><input style={{ ...inputSx, fontSize: 10, color: '#5f6368' }} placeholder="keywords (RU/KZ)" value={r.keywords} onChange={e => updNR(i, 'keywords', e.target.value)} /></td>
                  <td style={{ ...cellSxObj, color: '#e0e0e0' }} /><td style={{ ...cellSxObj, color: '#e0e0e0' }} /><td style={{ ...cellSxObj, color: '#e0e0e0' }} />
                  <td style={{ ...cellSxObj, textAlign: 'center', borderRight: 'none' }}>
                    {r.product_name && <button onClick={() => saveNR(i)} style={{ background: '#e6f4ea', border: 'none', color: '#137333', cursor: 'pointer', borderRadius: 3, padding: '2px 6px', fontSize: 12 }}>&#10003;</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8f9fa', borderTop: '1px solid #dadce0', height: 26, px: 0.5, flexShrink: 0 }}>
          <Box sx={{ px: 1.5, fontSize: 10, fontWeight: 600, color: '#1a73e8', borderBottom: '2px solid #1a73e8', height: 26, display: 'flex', alignItems: 'center', bgcolor: '#fff' }}>Products</Box>
          <Box sx={{ px: 1.5, fontSize: 10, color: '#5f6368', height: 26, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>Barcodes</Box>
          <Box sx={{ ml: 'auto', fontSize: 9, color: '#80868b', pr: 1 }}>
            SUM(G): {d?.by_product?.reduce((s, p) => s + p.total_sales, 0) || 0} | SUM(H): {tr.toLocaleString()} T | COUNT: {rows.length}
          </Box>
        </Box>
      </Card>

      {/* RECEIPT GUIDE */}
      <Box sx={{ mt: 2.5 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5 }}>Receipt Matching Guide for Kazakhstan</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
          {[
            ['Keywords', '#1a73e8', 'Add all possible variations of product name as it appears on receipts. Use Russian, Kazakh, and abbreviated forms.', 'Example:', 'Coca Cola Zero, cola zero, KK 0'],
            ['Barcode (EAN-13)', '#34a853', 'If available, add the EAN-13 barcode. Kazakhstan OFD receipts often include barcodes for precise matching.', 'Format:', '4870001234567 (13 digits)'],
            ['RRP (T)', '#ea4335', 'Recommended Retail Price helps detect price deviations across stores. Track if retailers follow your pricing policy.', 'Usage:', 'Compare actual avg price vs RRP'],
          ].map(([title, color, text, label, example], i) => (
            <Card key={i} sx={{ p: '16px 18px' }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: color + '12', color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.2, fontSize: 18 }}>
                {i === 0 ? '#' : i === 1 ? '|' : 'T'}
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.8 }}>{title}</Typography>
              <Typography sx={{ fontSize: 11, color: '#5f6368', lineHeight: 1.5, mb: 1 }}>{text}</Typography>
              <Box sx={{ fontSize: 11, bgcolor: '#f8f9fa', borderRadius: 1, p: '8px 10px' }}>
                <b style={{ color: '#5f6368' }}>{label}</b> <code style={{ color: '#1a73e8', fontSize: 10 }}>{example}</code>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

const thSxObj = { background: '#f8f9fa', borderBottom: '2px solid #dadce0', borderRight: '1px solid #e2e5e9', textAlign: 'center', fontSize: 11, fontWeight: 500, color: '#5f6368', height: 32 };
const cellSxObj = { borderBottom: '1px solid #e8eaed', borderRight: '1px solid #e8eaed', padding: 0, height: 28, fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap' };
