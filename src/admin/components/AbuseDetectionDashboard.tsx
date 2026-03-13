/**
 * Abuse Detection Dashboard Component
 * Monitor and manage abuse reports
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Shield
} from 'lucide-react';
import { AbuseReport, AbuseType, AbuseSeverity, AbuseStatus } from '../types/admin';
import { DatabaseService } from '../services/databaseService';

interface AbuseDetectionDashboardProps {
  onInvestigate?: (reportId: string) => void;
  onResolve?: (reportId: string, decision: string) => void;
}

export function AbuseDetectionDashboard({ onInvestigate, onResolve }: AbuseDetectionDashboardProps) {
  const [filterSeverity, setFilterSeverity] = useState<AbuseSeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AbuseStatus | 'all'>('all');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const result = await DatabaseService.getAbuseReports({});
        setReports(result.reports || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch abuse reports:', err);
        setError('Failed to load abuse reports');
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSeverity && matchesStatus;
  });

  const stats = {
    open: reports.filter((r) => r.status === 'open').length,
    investigating: reports.filter((r) => r.status === 'investigating').length,
    critical: reports.filter((r) => r.severity === 'critical').length,
    resolved: reports.filter((r) => r.status === 'resolved').length
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-100 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-[#FF8A2B] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Loading abuse reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Open Reports', value: stats.open, icon: AlertTriangle, gradient: 'from-red-400 to-red-600', shadow: 'shadow-red-500/25' },
    { title: 'Investigating', value: stats.investigating, icon: Clock, gradient: 'from-yellow-400 to-amber-500', shadow: 'shadow-yellow-500/25' },
    { title: 'Critical', value: stats.critical, icon: AlertCircle, gradient: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/25' },
    { title: 'Resolved', value: stats.resolved, icon: CheckCircle, gradient: 'from-emerald-400 to-green-600', shadow: 'shadow-green-500/25' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900 tabular-nums mt-1">{card.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadow} p-3 rounded-xl`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] transition-all duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 pl-3 border-l-4 border-[#FF8A2B] mb-4">
            Abuse Reports
          </h2>
          <div className="flex gap-3 flex-wrap">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Reports */}
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No reports found</p>
            <p className="text-slate-400 text-xs mt-1">Adjust your filters to see more results</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredReports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-6 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors duration-150"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2.5 rounded-xl ${getSeverityColor(report.severity).bg} shrink-0`}>
                        <AlertTriangle className={`w-5 h-5 ${getSeverityColor(report.severity).icon}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                          <h3 className="font-semibold text-slate-900 text-sm">{formatAbuseType(report.abuse_type)}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getSeverityBadge(report.severity)}`}>
                            {report.severity}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />{report.user_id}
                          </span>
                          <span>Detected {formatTimeAgo(report.detected_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4 shrink-0">
                      {report.status === 'open' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onInvestigate?.(report.id); }}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-xl hover:-translate-y-0.5 shadow-lg shadow-blue-500/25 transition-all duration-200"
                        >
                          Investigate
                        </button>
                      )}
                      {report.status === 'investigating' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onResolve?.(report.id, 'confirmed'); }}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-semibold rounded-xl hover:-translate-y-0.5 shadow-lg shadow-green-500/25 transition-all duration-200"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {expandedReport === report.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-100"
                  >
                    <AbuseReportDetails report={report} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function AbuseReportDetails({ report }: { report: AbuseReport }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium mb-1">Abuse Type</p>
          <p className="text-sm font-semibold text-slate-900">{formatAbuseType(report.abuse_type)}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium mb-1">Detected</p>
          <p className="text-sm font-semibold text-slate-900">{report.detected_at.toLocaleString()}</p>
        </div>
      </div>
      {report.evidence && (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium mb-2">Evidence</p>
          <pre className="text-xs text-slate-700 overflow-auto max-h-48 font-mono">{JSON.stringify(report.evidence, null, 2)}</pre>
        </div>
      )}
      {report.resolution_notes && (
        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
          <p className="text-xs text-emerald-700 font-medium mb-1">Resolution Notes</p>
          <p className="text-sm text-emerald-900">{report.resolution_notes}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatAbuseType(type: AbuseType): string {
  const map: Record<AbuseType, string> = {
    quota_abuse: 'Quota Abuse',
    payment_fraud: 'Payment Fraud',
    api_abuse: 'API Abuse',
    terms_violation: 'Terms Violation',
    suspicious_activity: 'Suspicious Activity'
  };
  return map[type] || type;
}

function getSeverityColor(severity: AbuseSeverity): { bg: string; icon: string } {
  const map: Record<AbuseSeverity, { bg: string; icon: string }> = {
    low: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    medium: { bg: 'bg-yellow-50', icon: 'text-yellow-600' },
    high: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    critical: { bg: 'bg-red-50', icon: 'text-red-600' }
  };
  return map[severity];
}

function getSeverityBadge(severity: AbuseSeverity): string {
  const map: Record<AbuseSeverity, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };
  return map[severity];
}

function getStatusBadge(status: AbuseStatus): string {
  const map: Record<AbuseStatus, string> = {
    open: 'bg-red-100 text-red-800',
    investigating: 'bg-blue-100 text-blue-800',
    resolved: 'bg-emerald-100 text-emerald-800',
    dismissed: 'bg-slate-100 text-slate-700'
  };
  return map[status];
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
