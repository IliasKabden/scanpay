import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ReceiptsPage from './pages/ReceiptsPage';
import CompaniesPage from './pages/CompaniesPage';
import WalletPage from './pages/WalletPage';
import ModerationPage from './pages/ModerationPage';
import WithdrawalsPage from './pages/WithdrawalsPage';
import AuditLogPage from './pages/AuditLogPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/receipts" element={<ReceiptsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/moderation" element={<ModerationPage />} />
          <Route path="/withdrawals" element={<WithdrawalsPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
