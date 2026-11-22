/* KE */

const STATUS_CLASS = {
  Accepted: "status accepted",
  Rejected: "status rejected",
  "For CI": "status for-ci",
  Pending: "status pending",
};

const STATUS_TEXT = {
  Pending: "Your application is awaiting evaluation.",
  Accepted: "Congratulations! Your application has been accepted.",
  Rejected: "Your application was not approved.",
  "For CI": "Undergoing Character Investigation.",
};

const TraineeListContainer = ({ applications, notice }) => {
  return (
    <section className="section-card">
      <h1>Training Resources</h1>
      <p>Check the current status of your applications.</p>

      {notice && <p className="notice">{notice}</p>}

      {applications.length === 0 ? (
        <p className="empty-list">You have no submitted applications.</p>
      ) : (
        <div id="applicationList">
          {applications.map((app) => (
            <article key={app.id} className="application-card">
              <h3>{app.program}</h3>

              <p>
                <strong>Trainee Name:</strong> {app.traineeName}
              </p>

              <p>
                <strong>Application Status:</strong>
              </p>

              <span className={STATUS_CLASS[app.status] ?? STATUS_CLASS.Pending}>
                {app.status}
              </span>

              <p>{STATUS_TEXT[app.status]}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default TraineeListContainer;