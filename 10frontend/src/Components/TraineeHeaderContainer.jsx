/* KE */

const TraineeHeaderContainer = ({ currentUser, onLogout }) => {
  return (
    <header className="navbar">
      <div>
        <h1>TEN Foundation</h1>
        <small>
          {currentUser
            ? `Welcome, ${currentUser.name}! Apply for a training program and check your status.`
            : "Create an account or sign in to apply for training."}
        </small>
      </div>

      {currentUser && (
        <button
          type="button"
          className="logout"
          onClick={onLogout}
        >
          Logout
        </button>
      )}
    </header>
  );
};

export default TraineeHeaderContainer;