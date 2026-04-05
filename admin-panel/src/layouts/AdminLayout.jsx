import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GavelIcon from '@mui/icons-material/Gavel';
import PaymentsIcon from '@mui/icons-material/Payments';
import HistoryIcon from '@mui/icons-material/History';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
  { label: 'Moderation', path: '/moderation', icon: <GavelIcon /> },
  { label: 'Users', path: '/users', icon: <PeopleIcon /> },
  { label: 'Receipts', path: '/receipts', icon: <ReceiptLongIcon /> },
  { label: 'Companies', path: '/companies', icon: <BusinessIcon /> },
  { label: 'Withdrawals', path: '/withdrawals', icon: <PaymentsIcon /> },
  { label: 'Wallet', path: '/wallet', icon: <AccountBalanceWalletIcon /> },
  { label: 'Audit Log', path: '/audit', icon: <HistoryIcon /> },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #1a73e8, #34a853)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>MD</Typography>
          </Box>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600, fontSize: 18 }}>
            Mening Deregim
          </Typography>
          <Typography sx={{ ml: 1, color: '#80868b', fontSize: 14 }}>Admin</Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid #e0e0e0', background: '#fff' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 1 }}>
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1, borderRadius: '8px', mb: 0.5,
                  '&.Mui-selected': { bgcolor: '#e8f0fe', color: '#1a73e8', '& .MuiListItemIcon-root': { color: '#1a73e8' } },
                  '&:hover': { bgcolor: '#f1f3f4' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: location.pathname === item.path ? 600 : 400 }} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography sx={{ fontSize: 10, color: '#80868b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Solana Devnet</Typography>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34a853', display: 'inline-block', mr: 0.5, mt: 0.5 }} />
            <Typography component="span" sx={{ fontSize: 11, color: '#5f6368' }}>Connected</Typography>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f0f4f9', minHeight: '100vh' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
