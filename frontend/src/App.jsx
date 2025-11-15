import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotificationsPage from "./pages/NotificationsPage";
import OnboardingPage from "./pages/OnboardingPage";

import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";

import useAuthUser from "./hooks/useAuthUser.js";
import LandingPage from "./pages/LandingPage.jsx";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

import FriendsPage from "./pages/FriendsPage.jsx";
import ConnectPage from "./pages/ConnectPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatListPage from "./pages/ChatListPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import FriendProfilePage from "./pages/FriendProfilePage.jsx";
import GamesPage from "./pages/GamesPage.jsx";
import GamePlay from "./pages/GamePlay.jsx";

import AuthPage from "./pages/Authpage.jsx";

function App() {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  const currentPath = window.location.pathname;

  const showLoader = isLoading && currentPath !== "/auth";

  return (
    <div className="h-screen" data-theme={theme}>
      {showLoader ? (
        <PageLoader />
      ) : (
        <>
          <Routes>
            {/* ✅ Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* ✅ Auth Page */}
            <Route
              path="/auth"
              element={
                !isAuthenticated ? <AuthPage /> : <Navigate to="/home" />
              }
            />

            {/* ✅ Forgot & Reset Password */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* ✅ Onboarding */}
            <Route
              path="/onboarding"
              element={
                isAuthenticated ? <OnboardingPage /> : <Navigate to="/auth" />
              }
            />

            {/* ✅ Home */}
            <Route
              path="/home"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <HomePage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />

            {/* ✅ Friends */}
            <Route
              path="/friends"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <FriendsPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />

            {/* ✅ Connect */}
            <Route
              path="/connect"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <ConnectPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />

            {/* ✅ Profile */}
            <Route
              path="/profile"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <ProfilePage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />

            <Route
              path="/friend/:id"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <FriendProfilePage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />

            {/* ✅ Notifications */}
            <Route
              path="/notifications"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <NotificationsPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />

            {/* ✅ Chat */}
            <Route
              path="/chat"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <ChatListPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />

            <Route
              path="/chat/:id"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <ChatListPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />

            {/* ✅ Call */}
            <Route
              path="/call/:id"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <CallPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />

            {/* ✅ Games */}

            <Route
              path="/games"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <GamesPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />

            <Route
              path="//games/:gameId"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <GamePlay />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/auth" : "/onboarding"} />
                )
              }
            />
          </Routes>

          <Toaster />
        </>
      )}
    </div>
  );
}

export default App;
