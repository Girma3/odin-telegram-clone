import { BrowserRouter, Router, Route, Routes } from "react-router-dom";
import IntroPage from "./Intro-page";
import ChatSingle from "../features/chat/components/ChatSingle";
import DesktopLayout from "../features/layouts/DeskTopLayout";
import GroupChat from "../features/group/components/GroupChat";
import GroupSingle from "../features/group/components/GroupSingle";
import UserChat from "../features/chat/components/UserChat";
import Discussion from "../features/group/components/Discussion";
import ProfileCard from "../features/profile/components/ProfileCard";
import ProfileGroup from "../features/profile/components/ProfileGroup";
import { useState } from "react";
const Auth = () => <IntroPage />;
const users = [
  {
    id: 1,
    name: "King",
    imgUrl: "/images/jet.jpg",
    msg: "WE GONNA TAKE THAT!",
  },
  {
    id: 2,
    name: "Black",
    imgUrl: "/images/jet.jpg",
    msg: "BE HAPPY!",
  },
];
const Groups = [
  {
    id: 11,
    name: "CODERS",
    imgUrl: "/images/jet.jpg",
    msg: "NIGHT SWEATERS",
    members: 10,
    posts: [
      {
        id: 1,
        imgUrl: "/images/jet.jpg",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, excepturi. Voluptatibus, cumque? Commodi sit ab assumenda esse culpa sed laboriosam,",
        user: "King",
        created: "1 min ago",
        author: "King",
        comments: [
          {
            id: 1,
            text: "nice comment 1.",
            user: "user-y",
            created: "5 min ago",
          },
          {
            id: 2,
            user: "user-x",
            text: "cool comment 2.",
            created: "3 min ago",
          },
        ],
      },
      {
        id: 2,
        imgUrl: "/images/jet.jpg",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, excepturi. Voluptatibus, cumque? Commodi sit ab assumenda esse culpa sed laboriosam,",
        user: "Blue",
        created: "2 min ago",
        author: "Blue",
        comments: [],
      },
      {
        id: 3,
        imgUrl: "/images/jet.jpg",
        text: null,
        user: "Dope",
        created: "3 min ago",
        author: "Dope",
        comments: [],
      },
    ],
  },
  {
    id: 21,
    name: "GYM",
    imgUrl: "/images/jet.jpg",
    msg: "Crossfit for life!",
    members: 20,
    posts: [
      {
        id: 1,
        imgUrl: "/images/kong.jpg",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, excepturi. Voluptatibus, cumque? Commodi sit ab assumenda esse culpa sed laboriosam,",
        user: "King",
        created: "10 min ago",
        author: "King",
        comments: [],
      },
      {
        id: 2,
        imgUrl: "/images/leg.jpg",
        text: null,
        user: "Blue",
        created: "20 min ago",
        author: "Blue",
        comments: [
          {
            id: 1,
            text: "nice comment 1.",
            user: "user-y",
            created: "5 min ago",
          },
          {
            id: 2,
            user: "user-x",
            text: "cool comment 2.",
            created: "3 min ago",
          },
        ],
      },
    ],
  },
];
export default function AppLayout() {
  //global modal for profile for user or group
  const [profileState, setProfileState] = useState({
    isOpen: false,
    type: null, // "user" | "group"
    id: null,
    isAdmin: false,
    isSelf: false,
  });
  const handleCloseModal = () => {
    setProfileState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleProfileOpen = ({ type, id, isAdmin = false, isSelf = false }) => {
    setProfileState({
      isOpen: true,
      type,
      id,
      isAdmin,
      isSelf,
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
              groups={Groups}
              profileState={profileState}
              onProfileOpen={handleProfileOpen}
              onCloseModal={handleCloseModal}
            />
          }
        >
          <Route path="chat/:id" element={<ChatSingle users={users} />} />{" "}
          <Route
            path="group/:id"
            element={
              <GroupChat groups={Groups} onProfileOpen={handleProfileOpen} />
            }
          />
          <Route
            path="/post/discussion/:id"
            element={
              <Discussion groups={Groups} onProfileOpen={handleProfileOpen} />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
