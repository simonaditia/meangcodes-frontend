import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ActionToast from "../components/common/ActionToast";
import MarkdownContent from "../components/common/MarkdownContent";
import { useAuthRole } from "../hooks/useAuthRole";
import {
  deleteArticle,
  fetchArticleBySlug,
  fetchAuthors,
  fetchCategories,
  updateArticle,
  uploadImage,
} from "../services/articleService";

export default function EditArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthRole();
  const editorRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingEditorImage, setUploadingEditorImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);

  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [article, authorList, categoryList] = await Promise.all([
          fetchArticleBySlug(slug),
          fetchAuthors(),
          fetchCategories(),
        ]);

        if (!mounted) {
          return;
        }

        setAuthors(authorList);
        setCategories(categoryList);
        setTitle(article.title || "");
        setThumbnail(article.thumbnail || "");
        setAuthorId(String(article.authorId || ""));
        setCategoryId(String(article.categoryId || ""));
        setContent(article.content || "");
        setPublished(Boolean(article.published));
      } catch (err) {
        if (mounted) {
          setError(err.message || "Gagal memuat artikel.");
        }
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
  }, [slug]);

  const estimatedReadTime = useMemo(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  }, [content]);

  function insertSnippet(snippet, wrapSelection = false) {
    const target = editorRef.current;
    if (!target) {
      return;
    }

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
    if (!file) {
      return;
    }

    event.target.value = "";
    await uploadImagesToEditor([file]);
  }

  async function handleThumbnailUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

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
    if (!slug) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updated = await updateArticle(slug, {
        title,
        content,
        thumbnail,
        readTime: estimatedReadTime,
        authorId: Number(authorId),
        categoryId: Number(categoryId),
        published,
      });

      setToast({ type: "success", message: "Perubahan artikel berhasil disimpan." });
      if (updated?.slug && updated.slug !== slug) {
        setTimeout(() => {
          navigate(`/articles/${updated.slug}/edit`);
        }, 650);
      }
    } catch (err) {
      const message = err.message || "Gagal menyimpan perubahan artikel.";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!slug || deleting) {
      return;
    }

    const confirmed = window.confirm("Hapus artikel ini? Artikel tidak dihapus permanen, hanya ditandai deleted_at.");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteArticle(slug);
      setToast({ type: "success", message: "Artikel ditandai deleted_at dan dipindahkan dari daftar aktif." });
      setTimeout(() => {
        navigate("/");
      }, 850);
    } catch (err) {
      const message = err.message || "Gagal menghapus artikel.";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setDeleting(false);
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Memuat data artikel...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-4 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        <p>Mode saat ini bukan admin. Halaman edit dan delete artikel disembunyikan untuk non-admin.</p>
        <Link to={slug ? `/articles/${slug}` : "/"} className="inline-flex rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800">
          Kembali ke Detail Artikel
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Editor</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Edit Artikel</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            {deleting ? "Menghapus..." : "Delete Article"}
          </button>
          <Link
            to={slug ? `/articles/${slug}` : "/"}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Kembali
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.35fr,0.9fr]">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Judul</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Thumbnail URL atau Upload File</span>
            <input
              value={thumbnail}
              onChange={(event) => setThumbnail(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
            />
            <div className="flex items-center gap-2">
              <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                {uploadingThumbnail ? "Uploading..." : "Upload Thumbnail"}
                <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploadingThumbnail} />
              </label>
            </div>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Penulis</span>
              <select
                value={authorId}
                onChange={(event) => setAuthorId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
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
                onChange={(event) => setCategoryId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
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
              className={`relative rounded-xl ${isDragOver ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between px-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Tip: drag-and-drop gambar langsung ke area editor.</span>
                <span>{uploadingEditorImage ? "Sedang upload..." : "Drop image untuk upload"}</span>
              </div>
              {isDragOver ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/95 text-sm font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  Lepaskan file gambar untuk upload ke editor
                </div>
              ) : null}

              <textarea
                ref={editorRef}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-[360px] w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm leading-7 outline-none ring-amber-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
            Publish sekarang
          </label>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ringkasan</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Estimasi baca: {estimatedReadTime} menit</li>
              <li>Perubahan artikel menggunakan endpoint PATCH</li>
              <li>Delete Article memakai soft delete (deleted_at)</li>
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

      <ActionToast toast={toast} onClose={() => setToast(null)} />
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
