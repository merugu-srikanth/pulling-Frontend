import { useState, useEffect, useCallback } from "react";
import { Search, Download, Trash2, Filter, X, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import JobTable from "../components/JobTable";
import { jobsAPI } from "../services/api";

/* ─── Delete All Confirmation Modal ──────────────────────────────────────── */
function DeleteAllModal({ total, onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Delete All Jobs?</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              This will permanently remove all{" "}
              <span className="font-semibold text-red-600">{total.toLocaleString()}</span> jobs.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="mx-6 mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
          <AlertTriangle size={15} className="flex-shrink-0" />
          This action cannot be undone.
        </div>

        {/* Buttons */}
        <div className="flex gap-2 px-6 pb-6">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            <Trash2 size={14} />
            {loading ? "Deleting..." : `Delete All ${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingAicte, setExportingAicte] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getAll({ search, source, page, limit });
      setJobs(res.data.jobs);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [search, source, page, limit]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleDelete = async (id) => {
    try {
      await jobsAPI.delete(id);
      toast.success("Job removed");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const handleDeleteMany = async (ids) => {
    const tid = toast.loading(`Deleting ${ids.length} jobs...`);
    try {
      const res = await jobsAPI.deleteMany(ids);
      toast.success(`${res.data.deleted} jobs deleted`, { id: tid });
      fetchJobs();
    } catch {
      toast.error("Bulk delete failed", { id: tid });
    }
  };

  const handleDeleteAll = async () => {
    setDeleteAllLoading(true);
    const tid = toast.loading("Deleting all jobs...");
    try {
      const res = await jobsAPI.deleteAll();
      toast.success(`${res.data.deleted.toLocaleString()} jobs deleted`, { id: tid });
      setShowDeleteAll(false);
      fetchJobs();
    } catch {
      toast.error("Failed to delete all jobs", { id: tid });
    } finally {
      setDeleteAllLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    const tid = toast.loading("Generating Excel file...");
    try {
      await jobsAPI.exportExcel();
      toast.success("Excel downloaded!", { id: tid });
    } catch {
      toast.error("Export failed", { id: tid });
    } finally {
      setExporting(false);
    }
  };

  const handleExportAicte = async () => {
    setExportingAicte(true);
    const tid = toast.loading("Generating AICTE Excel...");
    try {
      await jobsAPI.exportAicte();
      toast.success("AICTE Excel downloaded!", { id: tid });
    } catch {
      toast.error("AICTE export failed", { id: tid });
    } finally {
      setExportingAicte(false);
    }
  };

  const clearFilters = () => { setSearch(""); setSource(""); setPage(1); };
  const hasFilters = search || source;

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        title="Jobs"
        subtitle={`${total.toLocaleString()} total jobs collected`}
        onRefresh={fetchJobs}
        loading={loading}
      />

      <main className="flex-1 p-8 space-y-6 page-enter">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10 pr-4"
              placeholder="Search by title or organization..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="input pl-8 w-44"
              placeholder="Filter by source"
              value={source}
              onChange={(e) => { setSource(e.target.value); setPage(1); }}
            />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary">
              <X size={13} />Clear
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleExport} disabled={exporting} className="btn-success">
              <Download size={14} />
              {exporting ? "Exporting..." : "Export Excel"}
            </button>
            <button
              onClick={handleExportAicte}
              disabled={exportingAicte}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 text-sm font-semibold border border-emerald-200 hover:border-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet size={14} />
              {exportingAicte ? "Exporting..." : "AICTE Excel"}
            </button>
            <button
              onClick={() => setShowDeleteAll(true)}
              disabled={total === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-sm font-semibold border border-red-200 hover:border-red-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              Delete All
            </button>
          </div>
        </div>

        {/* Filter summary */}
        {hasFilters && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-50 border border-brand-100 text-sm">
            <Search size={13} className="text-brand-500" />
            <span className="text-brand-800">
              Showing <strong>{total}</strong> results
              {search && <> for "<strong>{search}</strong>"</>}
              {source && <> from <strong>{source}</strong></>}
            </span>
          </div>
        )}

        {/* Table */}
        <JobTable
          jobs={jobs}
          loading={loading}
          total={total}
          page={page}
          limit={limit}
          onPage={(p) => setPage(p)}
          onDelete={handleDelete}
          onDeleteMany={handleDeleteMany}
        />
      </main>

      {/* Delete All Modal */}
      {showDeleteAll && (
        <DeleteAllModal
          total={total}
          onConfirm={handleDeleteAll}
          onCancel={() => setShowDeleteAll(false)}
          loading={deleteAllLoading}
        />
      )}
    </div>
  );
}
