import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';

const TABS = [
  { id: 'overview', label: '\u041E\u0431\u0437\u043E\u0440', icon: <HomeIcon fontSize="small" /> },
  { id: 'audience', label: '\u0410\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u044F', icon: <PeopleIcon fontSize="small" /> },
  { id: 'purchase', label: '\u041A\u0443\u043F\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435', icon: <ShoppingCartIcon fontSize="small" /> },
  { id: 'divider' },
  { id: 'pricing', label: '\u0426\u0435\u043D\u044B', icon: <MonetizationOnIcon fontSize="small" /> },
  { id: 'products', label: '\u0422\u043E\u0432\u0430\u0440\u044B', icon: <InventoryIcon fontSize="small" /> },
  { id: 'analytics', label: '\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430', icon: <BarChartIcon fontSize="small" /> },
];

export default function Sidebar({ tab, setTab }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220, flexShrink: 0,
        '& .MuiDrawer-paper': { width: 220, border: 'none', borderRight: '1px solid #e0e0e0', bgcolor: '#fff' },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2, py: 1.8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #1a73e8, #34a853)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 11 }}>MD</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>Mening Deregim</Typography>
            <Typography sx={{ fontSize: 9, color: '#80868b' }}>Data Marketplace</Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1 }}>
        {TABS.map((t) => {
          if (t.id === 'divider') return <Divider key="div" sx={{ my: 1 }} />;
          return (
            <ListItemButton
              key={t.id}
              selected={tab === t.id}
              onClick={() => setTab(t.id)}
              sx={{
                borderRadius: '8px', mb: 0.3, py: 0.7,
                '&.Mui-selected': { bgcolor: '#e8f0fe', color: '#1a73e8', '& .MuiListItemIcon-root': { color: '#1a73e8' } },
                '&:hover': { bgcolor: '#f1f3f4' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>{t.icon}</ListItemIcon>
              <ListItemText primary={t.label} primaryTypographyProps={{ fontSize: 13, fontWeight: tab === t.id ? 600 : 400 }} />
            </ListItemButton>
          );
        })}
      </List>

      {/* Company badge */}
      <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #e8eaed' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#202124' }}>Coca-Cola Kazakhstan</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34a853', animation: 'blink 1.5s infinite' }} />
          <Typography sx={{ fontSize: 9, color: '#80868b' }}>Solana Devnet &middot; Connected</Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
