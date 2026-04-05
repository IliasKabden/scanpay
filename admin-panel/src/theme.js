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
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { border: '1px solid #dadce0', boxShadow: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#fff', color: '#202124', boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
      },
    },
  },
});

export default theme;
