import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Upload, Play, Globe, X, FileSpreadsheet } from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import WebsiteList from "../components/WebsiteList";
import { websitesAPI } from "../services/api";
import { SpinnerOverlay } from "../components/Loader";

function AddWebsiteModal({ onClose, onAdded }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("auto");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSaving(true);
    try {
      await websitesAPI.add({ url: url.trim(), name: name.trim() || undefined, type });
      toast.success("Website added!");
      onAdded();
      onClose();
    } catch {
      toast.error("Failed to add website");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Add Website</h3>
            <p className="text-xs text-slate-400">Add a new URL to the scraping queue</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">URL <span className="text-red-500">*</span></label>
            <input className="input" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Display Name</label>
            <input className="input" placeholder="My Job Portal" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Content Type</label>
            <select className="input" value={type} onChange={e => setType(e.target.value)}>
              <option value="auto">Auto Detect</option>
              <option value="html">HTML</option>
              <option value="xml">XML / RSS</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? "Adding..." : "Add Website"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Websites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrapingId, setScrapingId] = useState(null);
  const [bulkScraping, setBulkScraping] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileRef = useRef();

  const fetchWebsites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await websitesAPI.getAll();
      setWebsites(res.data);
    } catch {
      toast.error("Failed to load websites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  const handleScrapeOne = async (id) => {
    setScrapingId(id);
    const tid = toast.loading("Scraping website...");
    try {
      const res = await websitesAPI.scrapeOne(id);
      toast.success(`Found ${res.data.jobsFound} jobs!`, { id: tid });
      fetchWebsites();
    } catch {
      toast.error("Scraping failed", { id: tid });
    } finally {
      setScrapingId(null);
    }
  };

  const handleScrapeAll = async () => {
    setBulkScraping(true);
    const tid = toast.loading(`Scraping ${websites.length} websites...`);
    try {
      const res = await websitesAPI.scrapeAll();
      toast.success(`Done! ${res.data.totalJobs} new jobs from ${res.data.success} sites`, { id: tid });
      fetchWebsites();
    } catch {
      toast.error("Bulk scraping failed", { id: tid });
    } finally {
      setBulkScraping(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await websitesAPI.delete(id);
      setWebsites((w) => w.filter((s) => s.id !== id));
      toast.success("Website removed");
    } catch {
      toast.error("Failed to remove website");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tid = toast.loading("Uploading Excel...");
    try {
      const res = await websitesAPI.upload(file);
      toast.success(`Added ${res.data.added} sites (${res.data.skipped} skipped)`, { id: tid });
      fetchWebsites();
    } catch {
      toast.error("Upload failed", { id: tid });
    }
    e.target.value = "";
  };

  const activeCount   = websites.filter(w => w.status === "active").length;
  const errorCount    = websites.filter(w => w.status === "error").length;

  return (
    <div className="flex-1 flex flex-col">
      {bulkScraping && <SpinnerOverlay label={`Scraping ${websites.length} websites...`} />}
      <Navbar
        title="Websites"
        subtitle={`${websites.length} sites · ${activeCount} active · ${errorCount} errors`}
        onRefresh={fetchWebsites}
        loading={loading}
      />

      <main className="flex-1 p-8 space-y-6 page-enter">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={15} />
            Add Website
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary">
            <FileSpreadsheet size={15} />
            Upload Excel
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} />
          <div className="ml-auto">
            <button
              onClick={handleScrapeAll}
              disabled={bulkScraping || websites.length === 0}
              className="btn-success"
            >
              <Play size={14} />
              Scrape All ({websites.length})
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total",    value: websites.length, color: "bg-blue-50 text-blue-700"    },
            { label: "Active",   value: activeCount,     color: "bg-emerald-50 text-emerald-700" },
            { label: "Errors",   value: errorCount,      color: "bg-red-50 text-red-700"      },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl px-5 py-4 ${color} flex items-center justify-between`}>
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-2xl font-extrabold">{value}</span>
            </div>
          ))}
        </div>

        {/* Upload Hint */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex items-center gap-4 cursor-pointer
                     hover:border-brand-400 hover:bg-brand-50/30 transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center flex-shrink-0 transition-colors">
            <Upload size={20} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
          </div>
          <div>
            <p className="font-semibold text-slate-700 group-hover:text-brand-700 transition-colors">
              Upload Excel with 900+ website URLs
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              Columns: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">url</code>,{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">name</code>,{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">type</code> — .xlsx or .xls
            </p>
          </div>
          <div className="ml-auto">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-brand-600 transition-colors">
              Click to browse →
            </span>
          </div>
        </div>

        {/* Website List */}
        <WebsiteList
          websites={websites}
          loading={loading}
          scrapingId={scrapingId}
          onScrape={handleScrapeOne}
          onDelete={handleDelete}
        />
      </main>

      {showModal && (
        <AddWebsiteModal onClose={() => setShowModal(false)} onAdded={fetchWebsites} />
      )}
    </div>
  );
}
