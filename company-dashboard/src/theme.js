import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1a73e8' },
    secondary: { main: '#ea4335' },
    success: { main: '#34a853' },
    warning: { main: '#fbbc04' },
    info: { main: '#46bdc6' },
    background: { default: '#f0f4f9', paper: '#ffffff' },
  },
  typography: {
    fontFamily: "'Google Sans', system-ui, -apple-system, sans-serif",
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: { root: { border: '1px solid #dadce0', boxShadow: 'none' } },
    },
  },
});

export default theme;
