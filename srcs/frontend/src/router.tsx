import { createBrowserRouter } from 'react-router';
import App from './App';
import PublicLayout from './layouts/PublicLayout';
import BookingPage from './pages/BookingPage';
import BookingDonePage from './pages/BookingDonePage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  {
    path: '/b/:slug',
    element: <PublicLayout />,
    children: [
      { index: true, element: <BookingPage /> },
      { path: 'done', element: <BookingDonePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
