import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { GuestRoute } from "./app/GuestRoute";
import { NotFoundPage } from "./app/NotFoundPage";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { FeedPage } from "./features/posts/pages/FeedPage";
import { PostDetailPage } from "./features/posts/pages/PostDetailPage";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
