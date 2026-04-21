// import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes, type RouteObject } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Products } from '../pages/Products';
import { Suppliers } from '../pages/Suppliers';
import { Purchases } from '../pages/Purchases';
import { Sales } from '../pages/Sales';
import { Inventory } from '../pages/Inventory';
import { Reports } from '../pages/Reports';
// const TicketTemplate = lazy(() => import('../pages/TicketTemplate').then((mod) => ({ default: mod.TicketTemplate })));

function PrivateRoute() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

const routes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'products', element: <Products /> },
          { path: 'suppliers', element: <Suppliers /> },
          { path: 'purchases', element: <Purchases /> },
          { path: 'sales', element: <Sales /> },
          { path: 'inventory', element: <Inventory /> },
          { path: 'reports', element: <Reports /> },
          // {
          //   path: 'ticket-template',
          //   element: (
          //     <Suspense fallback={null}>
          //       <TicketTemplate />
          //     </Suspense>
          //   ),
          // },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];

export function AppRoutes() {
  return useRoutes(routes);
}
