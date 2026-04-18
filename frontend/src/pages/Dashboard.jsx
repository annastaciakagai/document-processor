import { useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pollRefs = useRef({}); // tracks polling intervals per doc

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/documents/upload", formData);
      const newDoc = res.data;

      // Add to list immediately with "pending" status
      setDocuments((prev) => [newDoc, ...prev]);
      setFile(null);

      // Start polling this doc every 2 seconds until done
      startPolling(newDoc.id);
    } catch (err) {
      setUploadError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const startPolling = (docId) => {
    // Don't start a second interval if one already exists
    if (pollRefs.current[docId]) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/documents/${docId}`);
        const updated = res.data;

        setDocuments((prev) =>
          prev.map((d) => (d.id === docId ? updated : d))
        );

        // Stop polling once processing is complete
        if (updated.status === "done") {
          clearInterval(pollRefs.current[docId]);
          delete pollRefs.current[docId];
        }
      } catch {
        clearInterval(pollRefs.current[docId]);
        delete pollRefs.current[docId];
      }
    }, 2000);

    pollRefs.current[docId] = interval;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const statusColor = (status) => {
    if (status === "done") return "#16a34a";
    if (status === "processing") return "#d97706";
    return "#6b7280"; // pending
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Document Processor</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.content}>
        {/* Upload card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Upload a document</h2>
          <p style={styles.cardSub}>
            Upload a .txt file and we'll analyse it in the background
          </p>

          <form onSubmit={handleUpload} style={styles.form}>
            <input
              type="file"
              accept=".txt,.pdf,.md"
              onChange={(e) => setFile(e.target.files[0])}
              style={styles.fileInput}
            />
            {uploadError && <p style={styles.error}>{uploadError}</p>}
            <button
              type="submit"
              disabled={uploading || !file}
              style={{
                ...styles.button,
                opacity: uploading || !file ? 0.6 : 1,
              }}
            >
              {uploading ? "Uploading..." : "Upload & Process"}
            </button>
          </form>
        </div>

        {/* Results */}
        {documents.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Your documents</h2>
            <div style={styles.docList}>
              {documents.map((doc) => (
                <div key={doc.id} style={styles.docItem}>
                  <div style={styles.docTop}>
                    <span style={styles.docName}>{doc.filename}</span>
                    <span
                      style={{
                        ...styles.badge,
                        color: statusColor(doc.status),
                        background: statusColor(doc.status) + "18",
                      }}
                    >
                      {doc.status}
                    </span>
                  </div>
                  {doc.result && (
                    <p style={styles.result}>{doc.result}</p>
                  )}
                  {doc.status !== "done" && (
                    <p style={styles.processing}>Processing your file...</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "sans-serif" },
  header: { background: "#fff", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb" },
  headerTitle: { fontSize: "1.2rem", fontWeight: 600, margin: 0 },
  logoutBtn: { padding: "0.4rem 1rem", background: "transparent", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" },
  content: { maxWidth: "640px", margin: "2rem auto", padding: "0 1rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
  card: { background: "#fff", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  cardTitle: { fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.25rem" },
  cardSub: { fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.25rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  fileInput: { fontSize: "0.9rem" },
  button: { padding: "0.75rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "1rem", cursor: "pointer" },
  error: { color: "#dc2626", fontSize: "0.875rem" },
  docList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  docItem: { padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "6px" },
  docTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" },
  docName: { fontWeight: 500, fontSize: "0.95rem" },
  badge: { fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px" },
  result: { fontSize: "0.875rem", color: "#374151", margin: 0 },
  processing: { fontSize: "0.8rem", color: "#9ca3af", margin: 0, fontStyle: "italic" },
};