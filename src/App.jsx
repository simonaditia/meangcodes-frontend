import React from "react";
import { Route, Routes } from "react-router-dom";
import RequireAdmin from "./components/auth/RequireAdmin";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import CategoryPage from "./pages/CategoryPage";
import CreateArticlePage from "./pages/CreateArticlePage";
import EditArticlePage from "./pages/EditArticlePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import AutomationPage from "./pages/AutomationPage";

export default function App() {
  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/articles/new"
            element={
              <RequireAdmin>
                <CreateArticlePage />
              </RequireAdmin>
            }
          />
          <Route
            path="/articles/:slug/edit"
            element={
              <RequireAdmin>
                <EditArticlePage />
              </RequireAdmin>
            }
          />
          <Route
            path="/automation"
            element={
              <RequireAdmin>
                <AutomationPage />
              </RequireAdmin>
            }
          />
          <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
