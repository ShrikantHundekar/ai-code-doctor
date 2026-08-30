import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import NewReview from './pages/NewReview';
import ReviewResults from './pages/ReviewResults';
import ReviewHistory from './pages/ReviewHistory';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import DebugCode from './pages/DebugCode';
import ExplainCode from './pages/ExplainCode';
import RefactorCode from './pages/RefactorCode';
import SecurityScan from './pages/SecurityScan';
import CompareReviews from './pages/CompareReviews';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/review/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewReview />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/compare"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewReview />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/debug"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DebugCode />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/explain"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ExplainCode />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/refactor"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RefactorCode />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SecurityScan />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReviewResults />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReviewResults />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReviewHistory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history/compare"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CompareReviews />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
