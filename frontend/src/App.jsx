import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainLayout from './container/MainLayout';
import AuthLayout from './container/AuthLayout';
import AdminLayout from './container/AdminLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;