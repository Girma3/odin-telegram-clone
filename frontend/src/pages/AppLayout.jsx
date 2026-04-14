import { Route, Routes } from "react-router-dom";
import { useState } from "react";

import { users, groups, notifications, privateChats } from "../data.js";

import IntroPage from "./Intro-page";
import ChatSingle from "../features/chat/components/ChatSingle.jsx";
import DesktopLayout from "../features/layouts/DeskTopLayout";
import GroupChat from "../features/group/components/GroupChat";
import Discussion from "../features/group/components/Discussion";
import RequireAuth from "../features/auth/components/RequireAuth";
import MobileLayout from "../features/layouts/MobileLayout.jsx";
import { useAuthContext } from "../features/auth/AuthContext.jsx";

const Auth = () => <IntroPage />;

function AppLayout() {
  const [profileState, setProfileState] = useState({
    isOpen: false,
    type: null,
    user: null,
    group: null,
    hasGroup: false,
    userId: null,
    isAdmin: false,
    isSelf: false,
  });

  const { currentUser, isLoading, isSuccess } = useAuthContext();
  const handleCloseModal = () => {
    setProfileState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleProfileOpen = (payload) => {
    setProfileState({ isOpen: true, ...payload });
  };
  if (isLoading) return <div>loading...</div>;
  if (!isSuccess) return <div>error...</div>;
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route element={<RequireAuth />}>
        <Route
          path="/"
          element={
            <DesktopLayout
              users={users}
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
                users={users}
                privateChats={privateChats}
                currentUser={currentUser}
              />
            }
          />

          <Route
            path="group/:id"
            element={
              <GroupChat
                currentUser={currentUser}
                onProfileOpen={handleProfileOpen}
              />
            }
          />

          <Route
            path="post/discussion/:id"
            element={
              <Discussion
                groups={groups}
                users={users}
                onProfileOpen={handleProfileOpen}
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppLayout;
