import { useState, useEffect } from "react";
import {
  Trash2, ExternalLink, ChevronLeft, ChevronRight,
  Copy, Check, Eye, X, Building2, GraduationCap,
  Calendar, Globe, Hash, Clock, Link, CheckSquare,
  Square, MinusSquare, AlertTriangle, MapPin,
  Banknote, Timer, Briefcase, CalendarCheck, BookOpen
} from "lucide-react";
import clsx from "clsx";
import { toast } from "react-hot-toast";
import { TableSkeleton } from "./Loader";

/* ─── Badges ──────────────────────────────────────────────────────────── */

function QualBadge({ qual }) {
  const map = {
    "10th Pass":     "badge-warning",
    "12th Pass":     "badge-info",
    "B.E / B.Tech":  "badge-success",
    "Graduate":      "badge-info",
    "Post Graduate": "badge-gray",
  };
  return <span className={clsx("badge", map[qual] || "badge-gray")}>{qual}</span>;
}

function VacancyBadge({ count }) {
  if (!count) return <span className="text-slate-400 text-xs italic">N/A</span>;
  return (
    <span className={clsx(
      "font-bold text-sm tabular-nums",
      count > 10000 ? "text-violet-600" : count > 1000 ? "text-brand-600" : "text-slate-700"
    )}>
      {count.toLocaleString()}
    </span>
  );
}

/* ─── Checkbox ────────────────────────────────────────────────────────── */

function Checkbox({ checked, indeterminate, onChange, className = "" }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      className={clsx("flex items-center justify-center w-4.5 h-4.5 rounded transition-colors flex-shrink-0", className)}
    >
      {indeterminate
        ? <MinusSquare size={16} className="text-brand-500" />
        : checked
          ? <CheckSquare size={16} className="text-brand-600" />
          : <Square size={16} className="text-slate-300 hover:text-slate-400" />
      }
    </button>
  );
}

/* ─── Copy Button ─────────────────────────────────────────────────────── */

function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Link copied!", { duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy link"
      className={clsx(
        "p-1.5 rounded-lg transition-all duration-150 flex-shrink-0",
        copied ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-brand-600 hover:bg-brand-50",
        className
      )}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

/* ─── Detail Modal ────────────────────────────────────────────────────── */

function DetailRow({ icon: Icon, label, value, mono = false, isLink = false }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        {isLink ? (
          <div className="flex items-center gap-2">
            <p className={clsx("text-sm text-slate-700 break-all", mono && "font-mono text-xs")}>{value}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              <CopyButton text={value} />
              <a href={value} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ) : (
          <p className={clsx("text-sm text-slate-800 break-words", mono && "font-mono text-xs")}>{value}</p>
        )}
      </div>
    </div>
  );
}

function JobModal({ job, onClose }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-200">
            <Building2 size={17} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 text-sm leading-snug">{job.title}</h2>
            <p className="text-xs text-slate-400 mt-1">{job.organization || "Unknown organization"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 px-6 py-3 bg-slate-50/70 border-b border-slate-100">
          {job.vacancies > 0 && <span className="badge badge-info"><Hash size={9} />{job.vacancies.toLocaleString()} vacancies</span>}
          {job.qualification && job.qualification !== "As per notification" && <QualBadge qual={job.qualification} />}
          {job.lastDate && job.lastDate !== "See notification" && <span className="badge badge-warning"><Calendar size={9} />{job.lastDate}</span>}
          <span className="badge badge-gray"><Globe size={9} />{job.source}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-1 scrollbar-thin">
          {job.isUpdated && job.updatedFields?.length > 0 && (
            <div className="my-3 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">Dates Updated</p>
              {job.updatedFields.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs mb-1">
                  <span className="font-semibold text-amber-800 capitalize">{f.replace(/([A-Z])/g, " $1")}:</span>
                  <span className="line-through text-slate-400">{job.previousValues?.[f] || "—"}</span>
                  <span className="text-amber-600">→</span>
                  <span className="font-semibold text-amber-900">{job[f]}</span>
                </div>
              ))}
            </div>
          )}
          <DetailRow icon={Building2}     label="Organization"     value={job.organization} />
          <DetailRow icon={GraduationCap} label="Qualification"    value={job.qualification} />
          <DetailRow icon={Hash}          label="Vacancies"        value={job.vacancies > 0 ? job.vacancies.toLocaleString() : null} />
          <DetailRow icon={Calendar}      label="Last Date / Apply By" value={job.lastDate !== "See notification" ? job.lastDate : null} />
          {/* AICTE internship-specific fields */}
          {job.stipend        && <DetailRow icon={Banknote}     label="Stipend"          value={job.stipend} />}
          {job.duration       && <DetailRow icon={Timer}        label="Duration"         value={job.duration} />}
          {job.location       && <DetailRow icon={MapPin}       label="Location"         value={job.location} />}
          {job.internshipType && <DetailRow icon={Briefcase}    label="Type"             value={job.internshipType} />}
          {job.startDate      && <DetailRow icon={CalendarCheck} label="Start Date"      value={job.startDate} />}
          {job.postedDate     && <DetailRow icon={Clock}        label="Posted On"        value={job.postedDate} />}
          {/* NPTEL-specific fields */}
          {job.source === "nptel.ac.in" && <>
            {job.courseDuration  && <DetailRow icon={Calendar}      label="Course Duration"      value={job.courseDuration} />}
            {job.enrollmentStart && <DetailRow icon={CalendarCheck} label="Enrollment Start Date" value={job.enrollmentStart} />}
            {job.enrollmentEnd   && <DetailRow icon={CalendarCheck} label="Enrollment End Date"   value={job.enrollmentEnd} />}
            {job.examRegStart    && <DetailRow icon={CalendarCheck} label="Exam Reg. Start Date"  value={job.examRegStart} />}
            {job.examRegEnd      && <DetailRow icon={CalendarCheck} label="Exam Reg. End Date"    value={job.examRegEnd} />}
            {job.examDate        && <DetailRow icon={Calendar}      label="Exam Date"             value={job.examDate} />}
            {job.credits         && <DetailRow icon={Hash}          label="Credits"              value={job.credits} />}
            {job.level           && <DetailRow icon={GraduationCap} label="Level"                value={job.level} />}
            {job.language        && <DetailRow icon={Globe}         label="Language"             value={job.language} />}
            {job.courseType      && <DetailRow icon={Briefcase}     label="Course Type"          value={job.courseType} />}
            {job.discipline      && <DetailRow icon={BookOpen}      label="Discipline"           value={job.discipline} />}
            {job.professor       && <DetailRow icon={Building2}     label="Professor"            value={job.professor} />}
          </>}
          <DetailRow icon={Globe}         label="Source Website"   value={job.source} />
          <DetailRow icon={Clock}         label="Scraped At"
            value={job.scrapedAt ? new Date(job.scrapedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null} />
          <DetailRow icon={Link}          label="Apply Link"       value={job.applyLink} isLink mono />
        </div>
        <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          {job.applyLink && job.applyLink !== "#" && (
            <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 justify-center">
              <ExternalLink size={14} />Apply Now
            </a>
          )}
          <CopyButton text={job.applyLink} className="btn-secondary !p-2.5" />
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Bulk Delete Confirm Modal ───────────────────────────────────────── */

function ConfirmModal({ count, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Delete {count} job{count !== 1 ? "s" : ""}?</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger flex-1 justify-center !bg-red-600 !text-white hover:!bg-red-700 border-0"
          >
            <Trash2 size={14} />
            {loading ? "Deleting..." : `Delete ${count}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Bulk Action Bar ─────────────────────────────────────────────────── */

function BulkActionBar({ selectedCount, totalCount, onDeleteSelected, onClearSelection }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onDeleteSelected();
    setDeleting(false);
    setConfirming(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 px-5 py-3 bg-brand-600 rounded-xl text-white animate-slide-up shadow-lg shadow-brand-200">
        <div className="flex items-center gap-2 flex-1">
          <CheckSquare size={16} className="text-brand-200" />
          <span className="text-sm font-semibold">
            {selectedCount} of {totalCount} selected
          </span>
        </div>
        <button
          onClick={() => setConfirming(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400
                     text-white text-xs font-semibold transition-colors"
        >
          <Trash2 size={13} />
          Delete Selected
        </button>
        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-lg hover:bg-brand-500 transition-colors text-brand-200 hover:text-white"
          title="Clear selection"
        >
          <X size={15} />
        </button>
      </div>

      {confirming && (
        <ConfirmModal
          count={selectedCount}
          loading={deleting}
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

/* ─── Main Table ──────────────────────────────────────────────────────── */

export default function JobTable({ jobs, loading, total, page, limit, onPage, onDelete, onDeleteMany }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);

  // Clear selection when page / jobs change
  useEffect(() => { setSelectedIds(new Set()); }, [page, jobs]);

  const totalPages = Math.ceil(total / limit);
  const pageIds = jobs.map((j) => j.id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id));
  const allPageSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const somePageSelected = selectedOnPage.length > 0 && !allPageSelected;

  const toggleAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => new Set([...prev, ...pageIds]));
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    await onDeleteMany([...selectedIds]);
    setSelectedIds(new Set());
  };

  return (
    <>
      {/* Bulk action bar — appears above table when items selected */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={total}
          onDeleteSelected={handleDeleteSelected}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {/* Select-all checkbox */}
                <th className="px-4 py-3.5 w-10">
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={somePageSelected}
                    onChange={toggleAll}
                  />
                </th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide min-w-[220px]">Job Title</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide min-w-[140px]">Organization</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide w-24">Vacancies</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide min-w-[140px]">Qualification</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide w-32">Last Date</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide min-w-[180px]">Apply Link</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide w-28">Source</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={9} className="px-5 py-6"><TableSkeleton rows={6} cols={7} /></td></tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                        <span className="text-2xl">📋</span>
                      </div>
                      <p className="font-medium text-slate-500">No jobs found</p>
                      <p className="text-xs">Try scraping some websites first</p>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job, idx) => {
                  const isSelected = selectedIds.has(job.id);
                  return (
                    <tr
                      key={job.id || idx}
                      onClick={() => toggleOne(job.id)}
                      className={clsx(
                        "group cursor-pointer transition-colors duration-100",
                        isSelected
                          ? "bg-brand-50/60 hover:bg-brand-50"
                          : job.isUpdated
                            ? "bg-amber-50/70 hover:bg-amber-50"
                            : "hover:bg-slate-50"
                      )}
                    >
                      {/* Row checkbox */}
                      <td className="px-4 py-3.5">
                        <Checkbox checked={isSelected} onChange={() => toggleOne(job.id)} />
                      </td>

                      {/* Job Title */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-1.5 max-w-[220px]">
                          <p className="font-semibold text-slate-800 line-clamp-2 leading-snug text-xs">{job.title}</p>
                          {job.isUpdated && (
                            <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 mt-0.5">
                              UPDATED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="px-4 py-3.5">
                        <span className="text-slate-700 text-xs font-medium">{job.organization || "—"}</span>
                      </td>

                      {/* Vacancies */}
                      <td className="px-4 py-3.5 text-center">
                        <VacancyBadge count={job.vacancies} />
                      </td>

                      {/* Qualification */}
                      <td className="px-4 py-3.5">
                        <QualBadge qual={job.qualification || "As per notification"} />
                      </td>

                      {/* Last Date */}
                      <td className="px-4 py-3.5">
                        <span className={clsx(
                          "text-xs font-medium",
                          job.lastDate === "See notification" ? "text-slate-400 italic" : "text-slate-700"
                        )}>
                          {job.lastDate}
                        </span>
                      </td>

                      {/* Apply Link */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        {job.applyLink && job.applyLink !== "#" ? (
                          <div className="flex items-center gap-1.5 max-w-[180px]">
                            <p className="text-xs text-slate-400 font-mono truncate flex-1" title={job.applyLink}>
                              {job.applyLink.replace(/^https?:\/\//, "").slice(0, 28)}…
                            </p>
                            <CopyButton text={job.applyLink} />
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3.5">
                        <span className="badge badge-gray text-[10px]">{job.source}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold
                                       text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
                          >
                            <Eye size={12} />View
                          </button>
                          <button
                            onClick={() => onDelete(job.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50
                                       transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</span>
              {" "}of{" "}
              <span className="font-semibold text-slate-700">{total.toLocaleString()}</span> jobs
              {selectedIds.size > 0 && (
                <span className="ml-2 text-brand-600 font-semibold">· {selectedIds.size} selected</span>
              )}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPage(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => onPage(p)}
                    className={clsx(
                      "w-8 h-8 rounded-lg text-xs font-semibold transition-colors",
                      p === page
                        ? "bg-brand-600 text-white shadow-sm"
                        : "border border-slate-200 text-slate-600 hover:bg-white"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => onPage(page + 1)}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </>
  );
}
