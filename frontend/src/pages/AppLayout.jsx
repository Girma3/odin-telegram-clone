import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import { groups, notifications, privateChats } from "../data.js";
import { useAuthContext } from "../features/auth/AuthContext.jsx";
import { UsersProvider } from "../features/private-chat/userContext.jsx";

import IntroPage from "./Intro-page";
import ChatSingle from "../features/private-chat/components/ChatSingle.jsx";
import DesktopLayout from "../features/layouts/DeskTopLayout";
import GroupPage from "../features/group/components/GroupPage";
import Discussion from "../features/group/components/Discussion";
import RequireAuth from "../features/auth/components/RequireAuth";
import MobileLayout from "../features/layouts/MobileLayout.jsx";

const Auth = () => <IntroPage />;

function AppLayout() {
  const [profileState, setProfileState] = useState({
    isOpen: false,
    type: null,
    user: null,
    profile: null,
    username: null,
    group: null,
    hasGroup: false,
    userId: null,
    isAdmin: false,
    isSelf: false,
  });

  /**
   * 📊 Seed Summary:
================
👥 Users: 15
📝 User Profiles: 15
🏢 Groups: 3
📝 Group Profiles: 3
👤 Group Memberships: 15
📄 Posts: 15
💬 Comments: 21
💬 Nested Comments: 6
❤️ Reactions: 18
================
   */
  const { currentUser, isLoading, isSuccess } = useAuthContext();

  if (!currentUser && isSuccess) {
    return <Auth />;
  }
  const handleCloseModal = () => {
    setProfileState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleProfileOpen = (payload) => {
    setProfileState({ isOpen: true, ...payload });
  };
  if (isLoading) return <div>loading...</div>;
  if (!isSuccess) return <div>error...</div>;

  return (
    <UsersProvider>
      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route element={<RequireAuth />}>
          <Route
            path="/"
            element={
              <DesktopLayout
                groups={groups}
                currentUser={currentUser}
                notifications={notifications}
                privateChats={privateChats}
                profileState={profileState}
                onProfileOpen={handleProfileOpen}
                onCloseModal={handleCloseModal}
              />
            }
          >
            <Route
              path="chat/:id"
              element={
                <ChatSingle
                  currentUser={currentUser}
                  onProfileOpen={handleProfileOpen}
                />
              }
            />

            <Route
              path="group/:id"
              element={
                <GroupPage
                  currentUser={currentUser}
                  onProfileOpen={handleProfileOpen}
                />
              }
            />

            <Route
              path="post/discussion/:id"
              element={
                <Discussion
                  currentUser={currentUser}
                  groups={groups}
                  onProfileOpen={handleProfileOpen}
                />
              }
            />
          </Route>
        </Route>
      </Routes>{" "}
    </UsersProvider>
  );
}

export default AppLayout;
