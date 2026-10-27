import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';

import MainLayout from './container/MainLayout';
import AuthLayout from './container/AuthLayout';
import AdminLayout from './container/AdminLayout';

import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';

import LandingPage from './pages/main/LandingPage';
import DashboardPage from './pages/main/DashboardPage';

import TeamsPage from './pages/teams/TeamsPage';
import TeamDetailPage from './pages/teams/TeamDetailPage';

// 마이페이지
import MyPage from './pages/mypage/MyPage';

// JWT 만료 시간 확인
// 실제 접근 권한은 백엔드 Spring Security에서도 검증합니다.
function hasValidToken() {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return false;
    }

    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const decoded = JSON.parse(atob(base64));

    return (
      typeof decoded.exp === 'number' &&
      decoded.exp * 1000 > Date.now()
    );
  } catch {
    return false;
  }
}

// 첫 화면
// 로그인 O → 대시보드
// 로그인 X → 랜딩 페이지
function HomeRoute() {
  return hasValidToken() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <LandingPage />
  );
}

// 로그인한 사용자만 접근 가능
function ProtectedRoute() {
  return hasValidToken() ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/login" replace />
  );
}

// 로그인하지 않은 사용자만 접근 가능
function GuestRoute() {
  return hasValidToken() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Outlet />
  );
}

const router = createBrowserRouter([
  // 랜딩 페이지
  {
    path: '/',
    element: <HomeRoute />,
  },

  // 로그인 필요 페이지
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // 대시보드
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },

          // 내 팀
          {
            path: '/teams',
            element: <TeamsPage />,
          },

          // 팀 상세
          {
            path: '/teams/:teamId',
            element: <TeamDetailPage />,
          },

          // 마이페이지
          {
            path: '/mypage',
            element: <MyPage />,
          },
        ],
      },

      // 관리자 페이지
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [],
      },
    ],
  },

  // 로그인 및 회원가입
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'signup',
            element: <SignUpPage />,
          },
        ],
      },
    ],
  },

  // 존재하지 않는 주소
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;