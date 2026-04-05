import axios from 'axios';

export const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const COLORS = ['#1a73e8', '#ea4335', '#34a853', '#fbbc04', '#ff6d01', '#46bdc6'];

export const STORES = {
  'Magnum': [{ lat: 43.238, lng: 76.945, city: 'Almaty', a: 'Magnum, Abay Ave' }, { lat: 43.255, lng: 76.928, city: 'Almaty', a: 'Magnum, Dostyk' }, { lat: 51.128, lng: 71.430, city: 'Astana', a: 'Magnum, Kabanbay' }, { lat: 42.317, lng: 69.596, city: 'Shymkent', a: 'Magnum, Tauke Khan' }],
  'Small': [{ lat: 43.240, lng: 76.910, city: 'Almaty', a: 'Small, Tole Bi' }, { lat: 51.145, lng: 71.470, city: 'Astana', a: 'Small, Syganak' }],
  'Sulpak': [{ lat: 43.230, lng: 76.958, city: 'Almaty', a: 'Sulpak, Mega Park' }, { lat: 51.110, lng: 71.418, city: 'Astana', a: 'Sulpak, Keruen' }, { lat: 42.325, lng: 69.610, city: 'Shymkent', a: 'Sulpak, Plaza' }],
  'Metro': [{ lat: 43.210, lng: 76.890, city: 'Almaty', a: 'Metro Cash&Carry' }],
  'Galmart': [{ lat: 51.160, lng: 71.450, city: 'Astana', a: 'Galmart, Expo' }, { lat: 43.260, lng: 76.970, city: 'Almaty', a: 'Galmart, Samal' }],
  'Anvar': [{ lat: 51.135, lng: 71.395, city: 'Astana', a: 'Anvar, Mangilik El' }, { lat: 42.310, lng: 69.580, city: 'Shymkent', a: 'Anvar, Baitursynov' }],
};

export default axios;
