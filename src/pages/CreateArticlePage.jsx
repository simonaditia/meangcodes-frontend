import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarkdownContent from "../components/common/MarkdownContent";
import { createArticle, fetchAuthors, fetchCategories, uploadImage } from "../services/articleService";

const DRAFT_STORAGE_KEY = "meangcodes:create-article-draft";

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(payload) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota and private mode failures.
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function formatSavedTime(timestamp) {
  if (!timestamp) {
    return "";
  }

  return timeFormatter.format(new Date(timestamp));
}

function useFormOptions() {
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [authorList, categoryList] = await Promise.all([fetchAuthors(), fetchCategories()]);
        if (!mounted) return;

        setAuthors(authorList);
        setCategories(categoryList);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { authors, categories, loading };
}

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const initializedRef = useRef(false);
  const { authors, categories, loading } = useFormOptions();
  const initialDraft = useMemo(() => readDraft(), []);

  const [title, setTitle] = useState(initialDraft?.title || "");
  const [thumbnail, setThumbnail] = useState(initialDraft?.thumbnail || "");
  const [authorId, setAuthorId] = useState(initialDraft?.authorId || "");
  const [categoryId, setCategoryId] = useState(initialDraft?.categoryId || "");
  const [content, setContent] = useState(initialDraft?.content || "Mulai tulis artikel kamu di sini...");
  const [published, setPublished] = useState(initialDraft?.published ?? true);
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingEditorImage, setUploadingEditorImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(Boolean(initialDraft));
  const [autosaveToast, setAutosaveToast] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(initialDraft?.savedAt || null);
  const [error, setError] = useState("");

  const estimatedReadTime = useMemo(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  }, [content]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    const timeoutId = setTimeout(() => {
      const savedAt = Date.now();
      saveDraft({
        title,
        thumbnail,
        authorId,
        categoryId,
        content,
        published,
        savedAt,
      });

      setLastSavedAt(savedAt);
      setAutosaveToast(`Tersimpan barusan - ${formatSavedTime(savedAt)}`);
    }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [title, thumbnail, authorId, categoryId, content, published]);

  useEffect(() => {
    if (!autosaveToast) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setAutosaveToast("");
    }, 2300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [autosaveToast]);

  function insertSnippet(snippet, wrapSelection = false) {
    const target = editorRef.current;
    if (!target) return;

    const start = target.selectionStart;
    const end = target.selectionEnd;
    const selected = content.slice(start, end);
    const insertion = wrapSelection ? snippet.replace("{{text}}", selected || "teks") : snippet;

    const next = content.slice(0, start) + insertion + content.slice(end);
    setContent(next);

    requestAnimationFrame(() => {
      target.focus();
      const cursor = start + insertion.length;
      target.setSelectionRange(cursor, cursor);
    });
  }

  async function uploadImagesToEditor(files) {
    if (!files.length) {
      return;
    }

    setError("");
    setUploadingEditorImage(true);
    try {
      const urls = [];
      for (const file of files) {
        const imageUrl = await uploadImage(file);
        urls.push(imageUrl);
      }

      if (urls.length > 0) {
        insertSnippet(`\n${urls.map((url) => `![alt text](${url})`).join("\n")}\n`);
      }
    } catch (err) {
      setError(err.message || "Gagal upload image ke server.");
    } finally {
      setUploadingEditorImage(false);
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";
    await uploadImagesToEditor([file]);
  }

  async function handleThumbnailUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    setUploadingThumbnail(true);
    try {
      const imageUrl = await uploadImage(file);
      setThumbnail(imageUrl);
    } catch (err) {
      setError(err.message || "Gagal upload thumbnail ke server.");
    } finally {
      setUploadingThumbnail(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const article = await createArticle({
        title,
        content,
        thumbnail,
        readTime: estimatedReadTime,
        authorId: Number(authorId),
        categoryId: Number(categoryId),
        published,
      });

      clearDraft();
      setRestoredDraft(false);
      setLastSavedAt(null);
      navigate(`/articles/${article.slug}`);
    } catch (err) {
      setError(err.message || "Gagal menyimpan artikel.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditorDrop(event) {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer?.files || []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) {
      return;
    }

    await uploadImagesToEditor(files);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Editor</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Buat Artikel Baru</h1>
        </div>
        <Link to="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
          Kembali
        </Link>
      </div>

      {restoredDraft ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          Draft sebelumnya berhasil dipulihkan dari localStorage.
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Memuat data penulis dan kategori...
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.35fr,0.9fr]">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Judul</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Cara Menulis API Gin yang Scalable"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Thumbnail URL atau Upload File</span>
            <input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
            />
            <div className="flex items-center gap-2">
              <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                {uploadingThumbnail ? "Uploading..." : "Upload Thumbnail"}
                <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploadingThumbnail} />
              </label>
              {thumbnail ? <span className="text-xs text-slate-500 dark:text-slate-400">URL thumbnail sudah terisi.</span> : null}
            </div>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Penulis</span>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
                required
              >
                <option value="">Pilih penulis</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Kategori</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
                required
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <ToolButton onClick={() => insertSnippet("# {{text}}", true)} label="H1" />
              <ToolButton onClick={() => insertSnippet("## {{text}}", true)} label="H2" />
              <ToolButton onClick={() => insertSnippet("### {{text}}", true)} label="H3" />
              <ToolButton onClick={() => insertSnippet("#### {{text}}", true)} label="H4" />
              <ToolButton onClick={() => insertSnippet("\nParagraf biasa\n")} label="Text" />
              <ToolButton onClick={() => insertSnippet("\n`kode-inline`\n")} label="Inline Code" />
              <ToolButton onClick={() => insertSnippet("\n```go\nfmt.Println(\"hello\")\n```\n")} label="Code Block" />
              <ToolButton onClick={() => insertSnippet("\n![alt text](https://images.unsplash.com/photo-1498050108023-c5249f4df085)\n")} label="Image URL" />
              <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                {uploadingEditorImage ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingEditorImage} />
              </label>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={handleEditorDrop}
              className={`relative rounded-xl ${isDragOver ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between px-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Tip: drag-and-drop gambar langsung ke area editor.</span>
                <span>{uploadingEditorImage ? "Sedang upload..." : "Drop image untuk upload"}</span>
              </div>
              {isDragOver ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/95 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Lepaskan file gambar untuk upload ke editor
                </div>
              ) : null}
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[360px] w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm leading-7 outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publish sekarang
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                clearDraft();
                setRestoredDraft(false);
                setLastSavedAt(null);
                setAutosaveToast("");
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Hapus Draft Lokal
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Autosave aktif{lastSavedAt ? ` - Terakhir disimpan ${formatSavedTime(lastSavedAt)}` : ""}.
            </span>
          </div>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Menyimpan..." : "Simpan Artikel"}
          </button>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ringkasan</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Estimasi baca: {estimatedReadTime} menit</li>
              <li>Heading: pakai tombol H1-H4</li>
              <li>Kode: inline atau code block</li>
              <li>Gambar: URL atau upload file ke server</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Preview</h2>
            <div className="mt-4 max-h-[520px] overflow-auto space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-200">
              <h1 className="text-2xl font-bold">{title || "Judul artikel akan tampil di sini"}</h1>
              <MarkdownContent content={content} className="markdown-content" />
            </div>
          </div>
        </aside>
      </form>

      {autosaveToast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-emerald-200 bg-white/95 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg backdrop-blur dark:border-emerald-700 dark:bg-slate-900/95 dark:text-emerald-300">
          {autosaveToast}
        </div>
      ) : null}
    </section>
  );
}

function ToolButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {label}
    </button>
  );
}
