import { useState, useEffect, useRef, useCallback } from "react";

const API = "https://api.nicertatscru.com";

// ─── Filename Sanitizer ───
function sanitizeFilename(name) {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  const base = name.slice(0, name.lastIndexOf("."));
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9\-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") + ext
  );
}

// ─── Title from Filename ───
function titleFromFilename(name) {
  const base = name.slice(0, name.lastIndexOf("."));
  return base
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Shared Styles ───
const colors = {
  bg: "#0a0a0a",
  surface: "#141414",
  border: "#222",
  borderHover: "#333",
  accent: "#FF2D55",
  accentHover: "#e0254b",
  text: "#fff",
  textMuted: "#888",
  danger: "#ff4444",
  dangerHover: "#cc3333",
  success: "#22c55e",
};

const fonts = {
  heading: "'Permanent Marker', cursive",
  label: "'Bebas Neue', sans-serif",
  body: "'DM Sans', sans-serif",
  ui: "'Oswald', sans-serif",
};

// ─── Login Screen ───
const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Wrong password");
        setLoading(false);
        return;
      }
      const { token } = await res.json();
      onLogin(token);
    } catch {
      setError("Connection failed. Is the API running?");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.body,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          padding: 40,
          width: "100%",
          maxWidth: 380,
          margin: "0 20px",
        }}
      >
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 28,
            color: colors.accent,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          NICER ADMIN
        </div>
        <div
          style={{
            fontFamily: fonts.ui,
            fontSize: 12,
            letterSpacing: 3,
            color: colors.textMuted,
            textAlign: "center",
            textTransform: "uppercase",
            marginBottom: 32,
          }}
        >
          Gallery Management
        </div>

        <input
          ref={inputRef}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            color: colors.text,
            fontSize: 16,
            fontFamily: fonts.body,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 16,
          }}
        />

        {error && (
          <div
            style={{
              color: colors.danger,
              fontSize: 14,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%",
            padding: "14px 0",
            background: loading || !password ? colors.border : colors.accent,
            color: colors.text,
            border: "none",
            borderRadius: 8,
            fontFamily: fonts.ui,
            fontSize: 16,
            letterSpacing: 2,
            cursor: loading || !password ? "default" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading ? "LOGGING IN..." : "ENTER"}
        </button>

        <div
          style={{
            marginTop: 24,
            textAlign: "center",
          }}
        >
          <a
            href="#home"
            style={{
              color: colors.textMuted,
              fontSize: 13,
              textDecoration: "none",
              fontFamily: fonts.body,
            }}
          >
            ← Back to site
          </a>
        </div>
      </form>
    </div>
  );
};

// ─── Upload Zone ───
const UploadZone = ({ token, collectionId, onUploadComplete }) => {
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState([]); // { file, status, progress, key }
  const fileInputRef = useRef(null);

  const processFiles = useCallback(
    async (files) => {
      if (!collectionId) return;
      const items = Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => ({
          file: f,
          sanitized: sanitizeFilename(f.name),
          status: "pending",
          progress: 0,
        }));

      if (!items.length) return;
      setUploads(items);

      for (let i = 0; i < items.length; i++) {
        setUploads((prev) =>
          prev.map((u, j) => (j === i ? { ...u, status: "uploading", progress: 10 } : u))
        );

        try {
          // Get presigned URL
          const presignRes = await fetch(`${API}/api/upload/presign`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              collection: collectionId,
              filename: items[i].sanitized,
              contentType: items[i].file.type,
            }),
          });

          if (!presignRes.ok) throw new Error("Presign failed");
          const { uploadUrl, publicUrl } = await presignRes.json();

          setUploads((prev) =>
            prev.map((u, j) => (j === i ? { ...u, progress: 40 } : u))
          );

          // Upload directly to R2
          const putRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": items[i].file.type },
            body: items[i].file,
          });

          if (!putRes.ok) throw new Error("Upload failed");

          setUploads((prev) =>
            prev.map((u, j) => (j === i ? { ...u, progress: 80 } : u))
          );

          // Notify parent to update manifest
          await onUploadComplete({
            src: publicUrl,
            title: titleFromFilename(items[i].file.name),
          });

          setUploads((prev) =>
            prev.map((u, j) => (j === i ? { ...u, status: "done", progress: 100 } : u))
          );
        } catch {
          setUploads((prev) =>
            prev.map((u, j) => (j === i ? { ...u, status: "error", progress: 0 } : u))
          );
        }
      }

      // Clear uploads after a delay
      setTimeout(() => setUploads([]), 3000);
    },
    [collectionId, token, onUploadComplete]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? colors.accent : colors.border}`,
          borderRadius: 12,
          padding: "32px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "rgba(255,45,85,0.05)" : "transparent",
          transition: "all 0.2s",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 28,
            marginBottom: 8,
          }}
        >
          +
        </div>
        <div
          style={{
            fontFamily: fonts.ui,
            fontSize: 14,
            letterSpacing: 1,
            color: colors.textMuted,
          }}
        >
          Drag photos here or click to browse
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => processFiles(e.target.files)}
          style={{ display: "none" }}
        />
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {uploads.map((u, i) => (
            <div
              key={i}
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                fontFamily: fonts.body,
                color: u.status === "error" ? colors.danger : u.status === "done" ? colors.success : colors.text,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {u.status === "uploading" && (
                <div
                  style={{
                    width: 40,
                    height: 4,
                    background: colors.border,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${u.progress}%`,
                      height: "100%",
                      background: colors.accent,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              )}
              {u.status === "done" && "✓"}
              {u.status === "error" && "✗"}
              <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {u.sanitized}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Image Thumbnail Card ───
const ImageCard = ({ image, onDelete, onTitleChange }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(image.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const saveTitle = () => {
    setEditing(false);
    if (title !== image.title) onTitleChange(title);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setConfirmDelete(false);
      }}
      style={{
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        background: colors.surface,
        border: `1px solid ${colors.border}`,
      }}
    >
      <img
        src={image.src}
        alt={image.title}
        style={{
          width: "100%",
          height: 160,
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Delete button */}
      {hovered && (
        <button
          onClick={() => {
            if (confirmDelete) onDelete();
            else setConfirmDelete(true);
          }}
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: confirmDelete ? "auto" : 28,
            height: 28,
            padding: confirmDelete ? "0 10px" : 0,
            background: confirmDelete ? colors.danger : "rgba(0,0,0,0.7)",
            color: "#fff",
            border: "none",
            borderRadius: confirmDelete ? 6 : "50%",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: fonts.body,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {confirmDelete ? "Delete?" : "✕"}
        </button>
      )}

      {/* Title area */}
      <div style={{ padding: "10px 12px" }}>
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            style={{
              width: "100%",
              background: colors.bg,
              border: `1px solid ${colors.accent}`,
              borderRadius: 4,
              color: colors.text,
              fontSize: 13,
              fontFamily: fonts.body,
              padding: "4px 8px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        ) : (
          <div
            onClick={() => setEditing(true)}
            title="Click to edit title"
            style={{
              fontSize: 13,
              fontFamily: fonts.body,
              color: colors.text,
              cursor: "text",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {image.title}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───
const Dashboard = ({ token, onLogout }) => {
  const [manifest, setManifest] = useState({ collections: [] });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCollName, setNewCollName] = useState("");
  const [showNewColl, setShowNewColl] = useState(false);
  const [mobileTab, setMobileTab] = useState("collections");
  const newCollInputRef = useRef(null);

  // Fetch manifest
  const fetchManifest = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/manifest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setManifest(data);
      if (!selectedId && data.collections.length > 0) {
        setSelectedId(data.collections[0].id);
      }
    } catch {
      // Empty state on failure
    } finally {
      setLoading(false);
    }
  }, [token, selectedId]);

  useEffect(() => {
    fetchManifest();
  }, [fetchManifest]);

  // Save manifest to API
  const saveManifest = async (updated) => {
    setSaving(true);
    setManifest(updated);
    try {
      await fetch(`${API}/api/manifest`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
    } catch {
      // Silently fail — the local state is still correct
    } finally {
      setSaving(false);
    }
  };

  // Add collection
  const addCollection = () => {
    const name = newCollName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    if (manifest.collections.some((c) => c.id === id)) return;
    const updated = {
      ...manifest,
      collections: [...manifest.collections, { id, name, images: [] }],
    };
    saveManifest(updated);
    setSelectedId(id);
    setNewCollName("");
    setShowNewColl(false);
  };

  // Delete collection
  const deleteCollection = async (collId) => {
    const coll = manifest.collections.find((c) => c.id === collId);
    if (!coll) return;

    // Delete all R2 images in this collection
    for (const img of coll.images) {
      if (img.src.includes("images.nicertatscru.com")) {
        const key = img.src.replace("https://images.nicertatscru.com/", "");
        try {
          await fetch(`${API}/api/image`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ key }),
          });
        } catch {
          // Continue deleting others
        }
      }
    }

    const updated = {
      ...manifest,
      collections: manifest.collections.filter((c) => c.id !== collId),
    };
    if (selectedId === collId) {
      setSelectedId(updated.collections[0]?.id || null);
    }
    saveManifest(updated);
  };

  // Handle image upload complete
  const handleUploadComplete = useCallback(
    async (newImage) => {
      setManifest((prev) => {
        const updated = {
          ...prev,
          collections: prev.collections.map((c) =>
            c.id === selectedId ? { ...c, images: [...c.images, newImage] } : c
          ),
        };
        // Save async — fire and forget since we update local state immediately
        fetch(`${API}/api/manifest`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updated),
        });
        return updated;
      });
    },
    [selectedId, token]
  );

  // Delete image
  const deleteImage = async (collId, imgIndex) => {
    const coll = manifest.collections.find((c) => c.id === collId);
    const img = coll?.images[imgIndex];
    if (!img) return;

    // Delete from R2 if it's a remote image
    if (img.src.includes("images.nicertatscru.com")) {
      const key = img.src.replace("https://images.nicertatscru.com/", "");
      try {
        await fetch(`${API}/api/image`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ key }),
        });
      } catch {
        // Continue with manifest update
      }
    }

    const updated = {
      ...manifest,
      collections: manifest.collections.map((c) =>
        c.id === collId
          ? { ...c, images: c.images.filter((_, i) => i !== imgIndex) }
          : c
      ),
    };
    saveManifest(updated);
  };

  // Update image title
  const updateImageTitle = (collId, imgIndex, newTitle) => {
    const updated = {
      ...manifest,
      collections: manifest.collections.map((c) =>
        c.id === collId
          ? {
              ...c,
              images: c.images.map((img, i) =>
                i === imgIndex ? { ...img, title: newTitle } : img
              ),
            }
          : c
      ),
    };
    saveManifest(updated);
  };

  const selectedColl = manifest.collections.find((c) => c.id === selectedId);
  const totalImages = manifest.collections.reduce((sum, c) => sum + c.images.length, 0);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fonts.body,
          color: colors.textMuted,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily: fonts.body,
        color: colors.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ fontFamily: fonts.heading, fontSize: 22, color: colors.accent }}>
          NICER ADMIN
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {saving && (
            <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.ui }}>
              SAVING...
            </span>
          )}
          <a
            href="#home"
            style={{
              color: colors.textMuted,
              fontSize: 13,
              textDecoration: "none",
              fontFamily: fonts.body,
            }}
          >
            Back to Site
          </a>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.textMuted,
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: fonts.ui,
              fontSize: 13,
              letterSpacing: 1,
            }}
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Mobile tabs */}
      <div
        style={{
          display: "none",
          borderBottom: `1px solid ${colors.border}`,
          padding: "0 16px",
        }}
        className="admin-mobile-tabs"
      >
        {["collections", "images"].map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "transparent",
              border: "none",
              borderBottom: mobileTab === tab ? `2px solid ${colors.accent}` : "2px solid transparent",
              color: mobileTab === tab ? colors.accent : colors.textMuted,
              fontFamily: fonts.ui,
              fontSize: 14,
              letterSpacing: 1,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <aside
          className="admin-sidebar"
          style={{
            width: 260,
            borderRight: `1px solid ${colors.border}`,
            padding: 16,
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: fonts.ui,
              fontSize: 11,
              letterSpacing: 2,
              color: colors.textMuted,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Collections
          </div>

          {manifest.collections.map((coll) => (
            <div
              key={coll.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                background: selectedId === coll.id ? "rgba(255,45,85,0.1)" : "transparent",
                border: selectedId === coll.id ? `1px solid rgba(255,45,85,0.3)` : "1px solid transparent",
                marginBottom: 4,
                transition: "all 0.15s",
              }}
              onClick={() => {
                setSelectedId(coll.id);
                setMobileTab("images");
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: selectedId === coll.id ? colors.text : colors.textMuted }}>
                  {coll.name}
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                  {coll.images.length} image{coll.images.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${coll.name}" and all its images?`)) {
                    deleteCollection(coll.id);
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: colors.textMuted,
                  cursor: "pointer",
                  fontSize: 16,
                  padding: "2px 6px",
                  borderRadius: 4,
                  opacity: 0.5,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = 1)}
                onMouseLeave={(e) => (e.target.style.opacity = 0.5)}
              >
                ✕
              </button>
            </div>
          ))}

          {/* New collection */}
          {showNewColl ? (
            <div style={{ marginTop: 8 }}>
              <input
                ref={newCollInputRef}
                value={newCollName}
                onChange={(e) => setNewCollName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCollection();
                  if (e.key === "Escape") {
                    setShowNewColl(false);
                    setNewCollName("");
                  }
                }}
                placeholder="Collection name"
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: colors.bg,
                  border: `1px solid ${colors.accent}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 14,
                  fontFamily: fonts.body,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={addCollection}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: colors.accent,
                    color: colors.text,
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: fonts.ui,
                    fontSize: 12,
                    letterSpacing: 1,
                  }}
                >
                  ADD
                </button>
                <button
                  onClick={() => {
                    setShowNewColl(false);
                    setNewCollName("");
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: "transparent",
                    border: `1px solid ${colors.border}`,
                    color: colors.textMuted,
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: fonts.ui,
                    fontSize: 12,
                    letterSpacing: 1,
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewColl(true)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "transparent",
                border: `1px dashed ${colors.border}`,
                borderRadius: 8,
                color: colors.textMuted,
                cursor: "pointer",
                fontFamily: fonts.ui,
                fontSize: 13,
                letterSpacing: 1,
                marginTop: 8,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.borderColor = colors.accent)}
              onMouseLeave={(e) => (e.target.style.borderColor = colors.border)}
            >
              + NEW COLLECTION
            </button>
          )}
        </aside>

        {/* Image Grid */}
        <main
          className="admin-main"
          style={{
            flex: 1,
            padding: 24,
            overflowY: "auto",
          }}
        >
          {selectedColl ? (
            <>
              <div
                style={{
                  fontFamily: fonts.label,
                  fontSize: 28,
                  marginBottom: 20,
                }}
              >
                {selectedColl.name}
              </div>

              <UploadZone
                token={token}
                collectionId={selectedId}
                onUploadComplete={handleUploadComplete}
              />

              {selectedColl.images.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: colors.textMuted,
                    fontFamily: fonts.body,
                    fontSize: 15,
                  }}
                >
                  No images yet. Drag photos above to upload.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 16,
                  }}
                >
                  {selectedColl.images.map((img, i) => (
                    <ImageCard
                      key={`${img.src}-${i}`}
                      image={img}
                      onDelete={() => deleteImage(selectedId, i)}
                      onTitleChange={(newTitle) => updateImageTitle(selectedId, i, newTitle)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                color: colors.textMuted,
                fontFamily: fonts.body,
              }}
            >
              {manifest.collections.length === 0
                ? "No collections yet. Create one to get started."
                : "Select a collection from the sidebar."}
            </div>
          )}
        </main>
      </div>

      {/* Status bar */}
      <footer
        style={{
          padding: "10px 24px",
          borderTop: `1px solid ${colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: colors.textMuted,
          fontFamily: fonts.body,
          flexShrink: 0,
        }}
      >
        <span>
          {manifest.collections.length} collection{manifest.collections.length !== 1 ? "s" : ""} · {totalImages} total image{totalImages !== 1 ? "s" : ""}
        </span>
        <span>nicertatscru.com</span>
      </footer>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .admin-mobile-tabs { display: flex !important; }
          .admin-sidebar {
            display: ${mobileTab === "collections" ? "block" : "none"} !important;
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid ${colors.border};
          }
          .admin-main {
            display: ${mobileTab === "images" ? "block" : "none"} !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

// ─── Admin Panel Root ───
export default function AdminPanel() {
  const [token, setToken] = useState(null);

  // Check for existing session on mount (verify endpoint)
  // JWT is in memory only — refresh = re-login. This is intentional.

  if (!token) {
    return <LoginScreen onLogin={setToken} />;
  }

  return <Dashboard token={token} onLogout={() => setToken(null)} />;
}
