import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { fetchQualityReport } from '../services/api';
import type { QualityReportResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const QualityReportPage: React.FC = () => {
  const [report, setReport] = useState<QualityReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchQualityReport();
      setReport(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data quality report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) return <LoadingSpinner message="Running empirical data quality audit..." />;
  if (error || !report) return <ErrorMessage message={error || 'Failed to load report'} onRetry={loadReport} />;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Dataset Integrity & Audit Report
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Empirical runtime validation across all 7 database tables and ball-by-ball delivery logs
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {report.passed_checks} / {report.total_checks} Checks Passed
          </span>
          {report.warning_checks > 0 && (
            <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
              {report.warning_checks} Warnings
            </span>
          )}
          {report.failed_checks > 0 && (
            <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
              {report.failed_checks} Failed
            </span>
          )}
        </div>
      </div>

      {/* Audit Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {report.checks.map((check) => {
          const isPassed = check.status === 'passed';
          const isWarning = check.status === 'warning';

          return (
            <div key={check.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{check.title}</span>
                  {isPassed ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Passed</span>
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Warning</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      <XCircle className="w-3 h-3" />
                      <span>Failed</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-medium mb-3">{check.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-slate-800">
                {check.details}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
