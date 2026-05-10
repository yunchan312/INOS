import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const CallbackPage = lazy(() => import('@/pages/auth/CallbackPage'));
const OnboardingPage = lazy(() => import('@/pages/onboarding/OnboardingPage'));
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const GroupListPage = lazy(() => import('@/pages/group/GroupListPage'));
const GroupDetailPage = lazy(() => import('@/pages/group/GroupDetailPage'));
const GroupCreatePage = lazy(() => import('@/pages/group/GroupCreatePage'));
const GroupJoinPage = lazy(() => import('@/pages/group/GroupJoinPage'));
const ContentSearchPage = lazy(() => import('@/pages/content/ContentSearchPage'));
const RecommendationPage = lazy(() => import('@/pages/content/RecommendationPage'));
const MeetingCreatePage = lazy(() => import('@/pages/meeting/MeetingCreatePage'));
const MeetingDetailPage = lazy(() => import('@/pages/meeting/MeetingDetailPage'));
const DiscussionPage = lazy(() => import('@/pages/meeting/DiscussionPage'));
const ArchiveListPage = lazy(() => import('@/pages/archive/ArchiveListPage'));
const ArchiveDetailPage = lazy(() => import('@/pages/archive/ArchiveDetailPage'));

function RootRedirect() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return <Navigate to={accessToken ? '/home' : '/login'} replace />;
}

const fallback = <LoadingSpinner fullScreen />;

function suspend(element: ReactNode) {
  return <Suspense fallback={fallback}>{element}</Suspense>;
}

function protect(element: ReactNode) {
  return (
    <Suspense fallback={fallback}>
      <ProtectedRoute>{element}</ProtectedRoute>
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },

  { path: '/login', element: suspend(<LoginPage />) },
  { path: '/auth/callback', element: suspend(<CallbackPage />) },

  { path: '/onboarding', element: protect(<OnboardingPage />) },
  { path: '/home', element: protect(<HomePage />) },
  { path: '/groups', element: protect(<GroupListPage />) },
  { path: '/groups/new', element: protect(<GroupCreatePage />) },
  { path: '/groups/join', element: protect(<GroupJoinPage />) },
  { path: '/groups/:groupId', element: protect(<GroupDetailPage />) },
  { path: '/groups/:groupId/contents/search', element: protect(<ContentSearchPage />) },
  { path: '/groups/:groupId/recommendations', element: protect(<RecommendationPage />) },
  { path: '/groups/:groupId/meetings/new', element: protect(<MeetingCreatePage />) },
  { path: '/groups/:groupId/meetings/:meetingId', element: protect(<MeetingDetailPage />) },
  { path: '/groups/:groupId/meetings/:meetingId/discussion', element: protect(<DiscussionPage />) },
  { path: '/groups/:groupId/archives', element: protect(<ArchiveListPage />) },
  { path: '/archives/:archiveId', element: protect(<ArchiveDetailPage />) },

  { path: '*', element: <Navigate to="/" replace /> },
]);
