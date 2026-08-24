import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import RouteErrorPage from '@/pages/error/RouteErrorPage';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const NotFoundPage = lazy(() => import('@/pages/error/NotFoundPage'));
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage'));
const OrgSelectorPage = lazy(() => import('@/pages/orgs/OrgSelectorPage'));
const OrgHomePage = lazy(() => import('@/pages/orgs/OrgHomePage'));
const OrgSettingsPage = lazy(() => import('@/pages/orgs/OrgSettingsPage'));
const OrgPostFormPage = lazy(() => import('@/pages/orgs/OrgPostFormPage'));
const OrgPostDetailPage = lazy(() => import('@/pages/orgs/OrgPostDetailPage'));
const CreateMeetingPage = lazy(
  () => import('@/pages/meetings/CreateMeetingPage'),
);
const AvailabilityPage = lazy(
  () => import('@/pages/meetings/AvailabilityPage'),
);
const MeetingPage = lazy(() => import('@/pages/meetings/MeetingPage'));
const PresentPage = lazy(() => import('@/pages/meetings/PresentPage'));
const AcceptInvitePage = lazy(
  () => import('@/pages/invitations/AcceptInvitePage'),
);
const InviteLinkPage = lazy(
  () => import('@/pages/invitations/InviteLinkPage'),
);
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));
const MyLibraryPage = lazy(() => import('@/pages/library/MyLibraryPage'));
const OrgLibraryPage = lazy(() => import('@/pages/library/OrgLibraryPage'));
const SharedLibraryPage = lazy(
  () => import('@/pages/library/SharedLibraryPage'),
);
const RecapPage = lazy(() => import('@/pages/library/RecapPage'));
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));

const fallback = (
  <div className="min-h-dvh flex items-center justify-center bg-base-100">
    <span className="loading loading-dots loading-md" />
  </div>
);

const suspend = (el: ReactNode) => <Suspense fallback={fallback}>{el}</Suspense>;

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: suspend(<HomePage />) },
      { path: '/auth/callback', element: suspend(<AuthCallbackPage />) },
      { path: '/library', element: suspend(<MyLibraryPage />) },
      { path: '/library/recap', element: suspend(<RecapPage />) },
      { path: '/s/:shareId', element: suspend(<SharedLibraryPage />) },
      { path: '/orgs', element: suspend(<OrgSelectorPage />) },
      { path: '/orgs/:orgId', element: suspend(<OrgHomePage />) },
      { path: '/orgs/:orgId/settings', element: suspend(<OrgSettingsPage />) },
      { path: '/orgs/:orgId/posts/new', element: suspend(<OrgPostFormPage />) },
      {
        path: '/orgs/:orgId/posts/:postId',
        element: suspend(<OrgPostDetailPage />),
      },
      {
        path: '/orgs/:orgId/posts/:postId/edit',
        element: suspend(<OrgPostFormPage />),
      },
      { path: '/orgs/:orgId/library', element: suspend(<OrgLibraryPage />) },
      {
        path: '/orgs/:orgId/meetings/new',
        element: suspend(<CreateMeetingPage />),
      },
      {
        path: '/orgs/:orgId/meetings/:meetingId',
        element: suspend(<MeetingPage />),
      },
      {
        path: '/orgs/:orgId/meetings/:meetingId/availability',
        element: suspend(<AvailabilityPage />),
      },
      {
        path: '/orgs/:orgId/meetings/:meetingId/present',
        element: suspend(<PresentPage />),
      },
      { path: '/invitations/:token', element: suspend(<AcceptInvitePage />) },
      { path: '/invite/:token', element: suspend(<InviteLinkPage />) },
      { path: '/login', element: suspend(<LoginPage />) },
      { path: '/admin', element: suspend(<AdminPage />) },
      { path: '/privacy', element: suspend(<PrivacyPage />) },
      { path: '/terms', element: suspend(<TermsPage />) },
      { path: '*', element: suspend(<NotFoundPage />) },
    ],
  },
]);
