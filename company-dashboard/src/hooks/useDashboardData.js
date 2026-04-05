import { useState, useCallback } from 'react';
import axios, { API } from '../api';

export default function useDashboardData(companyName) {
  const [d, setD] = useState(null);
  const [rows, setRows] = useState([]);
  const [deviations, setDeviations] = useState([]);

  const load = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/company/dashboard/${encodeURIComponent(companyName)}`);
      setD(r.data);
      setRows(r.data.products || []);
      const dv = await axios.get(`${API}/company/price-deviation/${encodeURIComponent(companyName)}`);
      setDeviations(dv.data.alerts || []);
    } catch (e) { /* silent */ }
  }, [companyName]);

  return { d, rows, setRows, deviations, load };
}
