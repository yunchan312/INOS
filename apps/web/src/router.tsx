import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import RouteErrorPage from '@/pages/error/RouteErrorPage';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const NotFoundPage = lazy(() => import('@/pages/error/NotFoundPage'));
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage'));
const OrgSelectorPage = lazy(() => import('@/pages/orgs/OrgSelectorPage'));
const OrgHomePage = lazy(() => import('@/pages/orgs/OrgHomePage'));
const OrgSettingsPage = lazy(() => import('@/pages/orgs/OrgSettingsPage'));
const CreateMeetingPage = lazy(
  () => import('@/pages/meetings/CreateMeetingPage'),
);
const AvailabilityPage = lazy(
  () => import('@/pages/meetings/AvailabilityPage'),
);
const MeetingPage = lazy(() => import('@/pages/meetings/MeetingPage'));
const AcceptInvitePage = lazy(
  () => import('@/pages/invitations/AcceptInvitePage'),
);
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));
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
      { path: '/orgs', element: suspend(<OrgSelectorPage />) },
      { path: '/orgs/:orgId', element: suspend(<OrgHomePage />) },
      { path: '/orgs/:orgId/settings', element: suspend(<OrgSettingsPage />) },
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
      { path: '/invitations/:token', element: suspend(<AcceptInvitePage />) },
      { path: '/admin', element: suspend(<AdminPage />) },
      { path: '/privacy', element: suspend(<PrivacyPage />) },
      { path: '/terms', element: suspend(<TermsPage />) },
      { path: '*', element: suspend(<NotFoundPage />) },
    ],
  },
]);
