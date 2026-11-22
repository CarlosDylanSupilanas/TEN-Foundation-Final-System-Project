/* DARIEL */

const downloadQr = (worker) => {
  const safeName = worker.name
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");

  const link = document.createElement("a");
  link.href = worker.qrCode;
  link.download = `${worker.workerId}-${safeName}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// workers = the (already filtered) list to show, total = all registered workers
const WorkerListContainer = ({ workers, total, query, notice, onDelete }) => {
  const confirmDelete = (worker) => {
    if (window.confirm(`Delete ${worker.name} (${worker.workerId})?`)) {
      onDelete(worker);
    }
  };

  const isSearching = query.trim() !== "";

  return (
    <>
      {notice && <p className="notice">{notice}</p>}

      <div className="list-head">
        <h2>Registered workers</h2>
        <span className="list-count">
          {isSearching ? `${workers.length} of ${total}` : total}
        </span>
      </div>

      {total === 0 ? (
        <p className="empty-list">
          No workers yet. Enter a name and click Generate QR Code.
        </p>
      ) : workers.length === 0 ? (
        <p className="empty-list">
          No worker matches “{query.trim()}”. Try a different name or ID.
        </p>
      ) : (
        <section id="workerList">
          {workers.map((worker) => (
            <article key={worker.workerId} className="workerCard">
              <img
                src={worker.qrCode}
                alt={`QR code for ${worker.name}, ${worker.workerId}`}
                width="160"
                height="160"
              />

              <h2>{worker.name}</h2>
              <p className="worker-id">{worker.workerId}</p>

              {/* Download and Delete Button */}
              <div className="card-actions">
                <button type="button" className="download-btn" onClick={() => downloadQr(worker)}>
                  Download QR
                </button>

                <button type="button" className="delete-btn" onClick={() => confirmDelete(worker)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
};

export default WorkerListContainer;