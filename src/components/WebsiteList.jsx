import { Globe, Trash2, Play, CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import clsx from "clsx";
import { TableSkeleton } from "./Loader";

function StatusBadge({ status }) {
  const map = {
    active:   { cls: "badge-success", icon: CheckCircle,  label: "Active"   },
    inactive: { cls: "badge-gray",    icon: Clock,         label: "Inactive" },
    error:    { cls: "badge-error",   icon: XCircle,       label: "Error"    },
  };
  const { cls, icon: Icon, label } = map[status] || map.inactive;
  return (
    <span className={clsx("badge", cls)}>
      <Icon size={10} />
      {label}
    </span>
  );
}

export default function WebsiteList({ websites, loading, scrapingId, onScrape, onDelete }) {
  if (loading) {
    return <div className="card"><TableSkeleton rows={5} cols={5} /></div>;
  }

  if (!websites.length) {
    return (
      <div className="card text-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <Globe size={24} className="text-slate-400" />
        </div>
        <p className="font-semibold text-slate-600">No websites added yet</p>
        <p className="text-sm text-slate-400 mt-1">Add a website URL or upload an Excel file to get started</p>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Website</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Type</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Jobs Found</th>
            <th className="text-left px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Last Scraped</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {websites.map((site) => {
            const isScraping = scrapingId === site.id;
            return (
              <tr key={site.id} className="table-row-hover group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Globe size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{site.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[220px]">{site.url}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={clsx("badge", site.type === "xml" ? "badge-info" : "badge-gray")}>
                    {site.type?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <StatusBadge status={site.status} />
                    {site.errorMessage && (
                      <div className="relative group/tooltip">
                        <AlertCircle size={13} className="text-red-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block z-10">
                          <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs whitespace-nowrap shadow-xl">
                            {site.errorMessage}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="font-bold text-brand-600">{site.jobsFound?.toLocaleString() || 0}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-slate-500">
                    {site.lastScraped
                      ? new Date(site.lastScraped).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
                      : "Never"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onScrape(site.id)}
                      disabled={isScraping}
                      className={clsx(
                        "p-1.5 rounded-lg transition-colors",
                        isScraping
                          ? "text-brand-500 bg-brand-50 cursor-wait"
                          : "text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                      )}
                      title="Scrape"
                    >
                      {isScraping ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    </button>
                    <button
                      onClick={() => onDelete(site.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
