import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import theme from './theme';
import './styles/global.css';
import 'leaflet/dist/leaflet.css';
import Sidebar from './components/layout/Sidebar';
import OverviewTab from './components/overview/OverviewTab';
import AudienceTab from './components/audience/AudienceTab';
import PurchaseTab from './components/purchase/PurchaseTab';
import PricingTab from './components/pricing/PricingTab';
import ProductsTab from './components/products/ProductsTab';
import AnalyticsTab from './components/analytics/AnalyticsTab';
import useDashboardData from './hooks/useDashboardData';
import useRealtimeFeed from './hooks/useRealtimeFeed';

const CN = 'Coca-Cola Kazakhstan';

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if ((email === 'demo@cocacola.kz' && pass === 'demo') || (email === 'admin' && pass === 'admin') || email.includes('@')) {
      onLogin();
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: -200, left: '30%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(26,115,232,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -200, right: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(52,168,83,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <Card sx={{ width: 420, bgcolor: '#161b22', border: '1px solid #30363d', boxShadow: '0 16px 64px rgba(0,0,0,.4)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #1a73e8, #34a853)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>MD</Typography>
            </Box>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Mening Deregim</Typography>
            <Typography sx={{ fontSize: 12, color: '#8b949e', mt: 0.5 }}>Data Marketplace for Companies</Typography>
          </Box>

          <TextField fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} size="small" sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: '#0d1117', color: '#fff', '& fieldset': { borderColor: '#30363d' } }, '& .MuiInputLabel-root': { color: '#8b949e' } }}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />
          <TextField fullWidth label="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} size="small" sx={{ mb: 1, '& .MuiOutlinedInput-root': { bgcolor: '#0d1117', color: '#fff', '& fieldset': { borderColor: '#30363d' } }, '& .MuiInputLabel-root': { color: '#8b949e' } }}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />

          {error && <Typography sx={{ fontSize: 12, color: '#ea4335', mb: 1 }}>{error}</Typography>}

          <Button fullWidth variant="contained" size="large" onClick={handleLogin}
            sx={{ mt: 1, textTransform: 'none', fontWeight: 700, fontSize: 15, py: 1.2, bgcolor: '#1a73e8', mb: 2 }}>
            {'Войти'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 11, color: '#484f58', mb: 1 }}>{'Demo доступ: demo@cocacola.kz / demo'}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
              <Chip label="Solana" size="small" sx={{ bgcolor: '#1a73e815', color: '#7db5f5', fontSize: 9, height: 18 }} />
              <Chip label="Claude AI" size="small" sx={{ bgcolor: '#34a85315', color: '#56d364', fontSize: 9, height: 18 }} />
              <Chip label="Blockchain" size="small" sx={{ bgcolor: '#fbbc0415', color: '#fbbc04', fontSize: 9, height: 18 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Typography sx={{ position: 'absolute', bottom: 20, color: '#484f58', fontSize: 11 }}>
        &copy; 2026 Mening Deregim &mdash; Kazakhstan
      </Typography>
    </Box>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState('overview');
  const { d, rows, setRows, deviations, load } = useDashboardData(CN);
  const { feed, pulse, toast, setToast } = useRealtimeFeed(d);

  useEffect(() => { load(); }, [load]);

  if (!loggedIn) return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoginScreen onLogin={() => setLoggedIn(true)} />
    </ThemeProvider>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar tab={tab} setTab={setTab} />
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {tab === 'overview' && <OverviewTab setTab={setTab} />}
          {tab === 'audience' && <AudienceTab setTab={setTab} />}
          {tab === 'purchase' && <PurchaseTab />}
          {tab === 'pricing' && d && (
            <PricingTab d={d} deviations={deviations} />
          )}
          {tab === 'products' && <ProductsTab cn={CN} d={d} rows={rows} setRows={setRows} load={load} />}
          {tab === 'analytics' && d && <AnalyticsTab cn={CN} />}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
