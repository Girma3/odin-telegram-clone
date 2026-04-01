import { BrowserRouter, Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { users, groups, notifications, privateChats } from "../data.js";

import IntroPage from "./Intro-page";
import ChatSingle from "../features/chat/components/ChatSingle";
import DesktopLayout from "../features/layouts/DeskTopLayout";
import GroupChat from "../features/group/components/GroupChat";

import Discussion from "../features/group/components/Discussion";

const Auth = () => <IntroPage />;

export default function AppLayout() {
  //global modal for profile for user or group
  const [profileState, setProfileState] = useState({
    isOpen: false,
    type: null, // "user" | "group"
    user: null,
    group: null,
    isAdmin: false,
    isSelf: false,
  });

  const handleCloseModal = () => {
    setProfileState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleProfileOpen = ({
    type,
    user,
    isAdmin = false,
    isSelf = false,
    group,
  }) => {
    setProfileState({
      isOpen: true,
      type,
      user,
      isAdmin,
      isSelf,
      user,
      group,
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <DesktopLayout
              users={users}
              groups={groups}
              currentUser={users[0]} //change after auth
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
                currentUser={users[0]}
              />
            }
          />{" "}
          <Route
            path="group/:id"
            element={
              <GroupChat
                groups={groups}
                users={users}
                currentUser={users[0]} //change after auth
                onProfileOpen={handleProfileOpen}
              />
            }
          />
          <Route
            path="/post/discussion/:id"
            element={
              <Discussion
                groups={groups}
                users={users}
                onProfileOpen={handleProfileOpen}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
