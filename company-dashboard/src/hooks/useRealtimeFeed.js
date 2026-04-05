import { useState, useEffect } from 'react';
import { STORES, COLORS } from '../api';

export default function useRealtimeFeed(d) {
  const [feed, setFeed] = useState([]);
  const [pulse, setPulse] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!d?.recent_detections?.length) return;
    setFeed(d.recent_detections.slice(0, 4));
    let i = 0;
    const iv = setInterval(() => {
      i = (i + 1) % d.recent_detections.length;
      const det = d.recent_detections[i];
      setFeed(p => [{ ...det, _t: Date.now() }, ...p.slice(0, 6)]);
      const locs = STORES[det.store_name];
      if (locs) {
        const loc = locs.find(l => l.city === det.city) || locs[0];
        setPulse({ lat: loc.lat, lng: loc.lng, id: Date.now() });
        setToast({
          product: det.product_name, store: det.store_name, city: det.city,
          price: det.price, qty: det.quantity,
          color: COLORS[d.products?.findIndex(p => p.product_name === det.product_name) % COLORS.length] || COLORS[0],
          id: Date.now(),
        });
      }
    }, 2800);
    return () => clearInterval(iv);
  }, [d]);

  useEffect(() => { if (pulse) { const t = setTimeout(() => setPulse(null), 1800); return () => clearTimeout(t); } }, [pulse]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);

  return { feed, pulse, toast, setToast };
}
