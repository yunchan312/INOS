import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const CallbackPage = lazy(() => import('@/pages/auth/CallbackPage'));
const OnboardingPage = lazy(() => import('@/pages/onboarding/OnboardingPage'));
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const ContentDetailPage = lazy(() => import('@/pages/content/ContentDetailPage'));
const ContentSearchPage = lazy(() => import('@/pages/content/ContentSearchPage'));
const RecommendationPage = lazy(() => import('@/pages/content/RecommendationPage'));
const GroupListPage = lazy(() => import('@/pages/group/GroupListPage'));
const GroupDetailPage = lazy(() => import('@/pages/group/GroupDetailPage'));
const GroupCreatePage = lazy(() => import('@/pages/group/GroupCreatePage'));
const GroupJoinPage = lazy(() => import('@/pages/group/GroupJoinPage'));
const MeetingCreatePage = lazy(() => import('@/pages/meeting/MeetingCreatePage'));
const MeetingDetailPage = lazy(() => import('@/pages/meeting/MeetingDetailPage'));
const PersonalPage = lazy(() => import('@/pages/personal/PersonalPage'));
const DiscussionStreamPage = lazy(() => import('@/pages/discussion/DiscussionStreamPage'));
const DiscussionViewPage = lazy(() => import('@/pages/discussion/DiscussionViewPage'));
const ArchiveListPage = lazy(() => import('@/pages/archive/ArchiveListPage'));
const ArchiveDetailPage = lazy(() => import('@/pages/archive/ArchiveDetailPage'));

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
  { path: '/', element: suspend(<HomePage />) },
  { path: '/login', element: suspend(<LoginPage />) },
  { path: '/auth/callback', element: suspend(<CallbackPage />) },
  { path: '/onboarding', element: protect(<OnboardingPage />) },

  { path: '/contents/:contentId', element: suspend(<ContentDetailPage />) },

  { path: '/group', element: protect(<GroupListPage />) },
  { path: '/group/new', element: protect(<GroupCreatePage />) },
  { path: '/group/join', element: protect(<GroupJoinPage />) },
  { path: '/group/:groupId', element: protect(<GroupDetailPage />) },
  { path: '/group/:groupId/contents/search', element: protect(<ContentSearchPage />) },
  { path: '/group/:groupId/recommendations', element: protect(<RecommendationPage />) },
  { path: '/group/:groupId/meetings/new', element: protect(<MeetingCreatePage />) },
  { path: '/group/:groupId/meetings/:meetingId', element: protect(<MeetingDetailPage />) },
  { path: '/group/:groupId/archives', element: protect(<ArchiveListPage />) },
  { path: '/archives/:archiveId', element: protect(<ArchiveDetailPage />) },

  { path: '/personal', element: protect(<PersonalPage />) },
  { path: '/discussion/stream/:meetingId', element: protect(<DiscussionStreamPage />) },
  { path: '/discussion/:discussionId', element: protect(<DiscussionViewPage />) },

  { path: '*', element: <Navigate to="/" replace /> },
]);
