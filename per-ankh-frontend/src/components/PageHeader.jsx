/**
 * En-tête de page unifié — à placer en haut du contenu de chaque page.
 * Si title/description sont omis, les valeurs de la route courante sont utilisées.
 */
import { useLocation } from "react-router-dom";
import { getRouteMeta } from "../config/navigation";

export default function PageHeader({
  title,
  description,
  actions,
  className = "",
}) {
  const { pathname } = useLocation();
  const meta = getRouteMeta(pathname);

  return (
    <section
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            {meta.section}
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {title || meta.title}
          </h1>
          {(description || meta.description) && (
            <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-2xl">
              {description || meta.description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
