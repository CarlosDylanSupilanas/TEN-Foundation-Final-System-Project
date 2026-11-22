import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";

import Training from "./pages/Training"; // ADDED - KE
import { isTraineeSignedIn } from "./utils/auth";

// AADED KE
// Only a signed-in trainee can see the training page
const RequireTrainee = ({ children }) =>
  isTraineeSignedIn() ? children : <Navigate to="/signin" replace />;


function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />

      {/* KE - training */}
      <Route
        path="/training"
        element={
          <RequireTrainee>
            <Training />
          </RequireTrainee>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    
  )
}

export default App
