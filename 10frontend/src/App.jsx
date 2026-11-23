import "./style.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import WorkerPage from "./pages/WorkerPage";
import Training from "./pages/Training"; // ADDED - KE
import LogbookPage from "./pages/LogbookPage";
import { isAdminSignedIn, isTraineeSignedIn, isLogbookSignedIn } from "./utils/auth";
import InventoryPage from "./pages/InventoryPage"; //Added 2.1.1 Dylan

const RequireAdmin = ({ children }) =>
  isAdminSignedIn() ? children : <Navigate to="/signin" replace />;

const RequireLogbook = ({ children }) =>
  isLogbookSignedIn() ? children : <Navigate to="/signin" replace />;

// AADED KE
// Only a signed-in trainee can see the training page
const RequireTrainee = ({ children }) =>
  isTraineeSignedIn() ? children : <Navigate to="/signin" replace />;


function App() {

  return (
    <Routes>
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />

      <Route
        path="/admin"
        element={
          <RequireAdmin> {/* new - 'admin' - in original its Auth */}
            <WorkerPage />
          </RequireAdmin>
        }
      />

      {/* KE - training */}
      <Route
        path="/training"
        element={
          <RequireTrainee>
            <Training />
          </RequireTrainee>
        }
      />

      <Route
      path="/logbook"
      element={
      <RequireLogbook>
        <LogbookPage />
      </RequireLogbook>
  }
/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    
  )
}

export default App
