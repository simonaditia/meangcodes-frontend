import React from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../../services/articleService";

const sponsors = [
  { name: "MeangCodes1", href: "#" },
  { name: "MeangCodes2", href: "#" },
  { name: "MeangCodes3", href: "#" },
];

const followLinks = [
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "YouTube", href: "https://youtube.com" },
  { label: "X", href: "https://x.com" },
];

export default function Footer() {
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const data = await fetchCategories();
        if (mounted) {
          setCategories((data || []).slice(0, 8));
        }
      } catch {
        if (mounted) {
          setCategories([]);
        }
      }
    }

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/90 pb-10 pt-8 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto grid w-full max-w-[1320px] gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr,1fr,1fr] lg:px-8">
        <div className="space-y-3">
          <h3 className="font-serif-display text-2xl text-slate-900 dark:text-slate-100">MeangCodes</h3>
          <p className="max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
            Portal edukasi dan blog teknologi dengan kurasi artikel engineering, keamanan, dan praktik pengembangan modern.
          </p>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Built for mindful reading experience
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 dark:text-slate-300">Sponsors</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            {sponsors.map((sponsor) => (
              <li key={sponsor.name}>
                <a href={sponsor.href} className="hover:text-emerald-700 dark:hover:text-emerald-300">
                  {sponsor.name}
                </a>
              </li>
            ))}
          </ul>

          <h4 className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 dark:text-slate-300">Follow Us</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {followLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 dark:text-slate-300">Quick Categories</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
