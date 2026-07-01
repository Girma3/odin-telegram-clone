import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient } from "@tanstack/react-query";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import "./style.css";
import { AuthProvider } from "./features/auth/AuthContext.jsx";
import { UsersProvider } from "./features/private-chat/userContext.jsx";
import { OnlineUsersProvider } from "./features/websocket/OnlineUsersProvider.jsx";

import AppLayout from "./pages/AppLayout";
import IntroPage from "./pages/IntroPage";

import ChatSingle from "./features/private-chat/components/ChatSingle.jsx";
import GroupPage from "./features/group/components/GroupPage";
import Discussion from "./features/group/components/Discussion";
import { useMemo } from "react";
import RootAuthBoundary from "./features/auth/components/RootAuthBoundary.jsx";

const router = createBrowserRouter([
  {
    element: <RootAuthBoundary />,
    children: [
      {
        path: "/auth",
        element: <IntroPage />,
      },
      {
        // No more RequireAuth wrapper needed
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/chat/home" replace /> },
          { path: "chat/:id", element: <ChatSingle /> },
          { path: "group/:id", element: <GroupPage /> },
          { path: "post/discussion/:id", element: <Discussion /> },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/auth" replace />,
      },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

export default function App() {
  const localStoragePersister = useMemo(
    () =>
      createAsyncStoragePersister({
        storage: {
          getItem: async (key) => window.localStorage.getItem(key),
          setItem: async (key, value) =>
            window.localStorage.setItem(key, value),
          removeItem: async (key) => window.localStorage.removeItem(key),
        },
      }),
    [],
  );
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}
    >
      <AuthProvider>
        <UsersProvider>
          <OnlineUsersProvider>
            <RouterProvider router={router} />
          </OnlineUsersProvider>
        </UsersProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
