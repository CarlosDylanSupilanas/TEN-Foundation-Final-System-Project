/* KE */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TraineeHeaderContainer from "../Components/TraineeHeaderContainer";
import TraineeFormContainer from "../Components/TraineeFormContainer";
import TraineeListContainer from "../Components/TraineeListContainer";
import { fetchMyApplications, submitApplication } from "../api/traineeApi";
import { clearUserToken, getUser } from "../utils/auth";
import "../design.css";

const Training = () => {
  const navigate = useNavigate();
  const user = getUser();
  const currentUser = { name: user?.name || "Trainee" };

  const [applications, setApplications] = useState([]);
  const [notice, setNotice] = useState("");

  // Load this trainee's applications once
  useEffect(() => {
    fetchMyApplications()
      .then((result) => setApplications(Array.isArray(result) ? result : []))
      .catch((e) => setNotice(e.message));
  }, []);

  // Throws an Error with a readable message if submitting fails
  const handleApply = async (program) => {
    if (applications.some((a) => a.program === program)) {
      throw new Error(`You already applied for the ${program}.`);
    }

    const result = await submitApplication(program);
    const created = result.application || result;
    setApplications((prev) => [
      {
        id: created.id ?? Date.now(),
        program,
        traineeName: created.traineeName || currentUser.name,
        status: created.status || "Pending",
      },
      ...prev,
    ]);
    setNotice("");
  };

  const handleLogout = () => {
    clearUserToken();
    navigate("/signin", { replace: true });
  };

  return (
    <div className="trainee">
      <TraineeHeaderContainer currentUser={currentUser} onLogout={handleLogout} />

      <main className="container">
        <TraineeFormContainer mode="apply" onSubmit={handleApply} />
        <TraineeListContainer applications={applications} notice={notice} />
      </main>
    </div>
  );
};

export default Training;