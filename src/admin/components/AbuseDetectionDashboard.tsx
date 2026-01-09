/**
 * Abuse Detection Dashboard Component
 * Monitor and manage abuse reports
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { AbuseReport, AbuseType, AbuseSeverity, AbuseStatus } from '../types/admin';
import { DatabaseService } from '../services/databaseService';

interface AbuseDetectionDashboardProps {
  onInvestigate?: (reportId: string) => void;
  onResolve?: (reportId: string, decision: string) => void;
}

export function AbuseDetectionDashboard({
  onInvestigate,
  onResolve
}: AbuseDetectionDashboardProps) {
  const [filterSeverity, setFilterSeverity] = useState<AbuseSeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AbuseStatus | 'all'>('all');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real abuse reports from database
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
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading abuse reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Open Reports"
          value={stats.open}
          icon={AlertTriangle}
          color="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title="Investigating"
          value={stats.investigating}
          icon={Clock}
          color="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Critical"
          value={stats.critical}
          icon={AlertCircle}
          color="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          color="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Abuse Reports</h2>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Reports */}
        <div className="divide-y divide-gray-200">
          {filteredReports.map((report) => (
            <div key={report.id} className="p-6">
              <div
                className="cursor-pointer"
                onClick={() =>
                  setExpandedReport(expandedReport === report.id ? null : report.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-lg ${getSeverityColor(report.severity)
                        .bg}`}
                    >
                      <AlertTriangle
                        className={`w-6 h-6 ${getSeverityColor(report.severity)
                          .icon}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {formatAbuseType(report.abuse_type)}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(
                            report.severity
                          )}`}
                        >
                          {report.severity}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {report.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {report.user_id}
                        </span>
                        <span>
                          Detected{' '}
                          {formatTimeAgo(report.detected_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    {report.status === 'open' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInvestigate?.(report.id);
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Investigate
                      </button>
                    )}
                    {report.status === 'investigating' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResolve?.(report.id, 'confirmed');
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedReport === report.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <AbuseReportDetails report={report} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  iconColor: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  iconColor
}: StatCardProps) {
  return (
    <div className={`${color} rounded-lg border border-gray-200 p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <Icon className={`${iconColor} w-6 h-6`} />
      </div>
    </div>
  );
}

interface AbuseReportDetailsProps {
  report: AbuseReport;
}

function AbuseReportDetails({ report }: AbuseReportDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-1">Abuse Type</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatAbuseType(report.abuse_type)}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-1">Detected</p>
          <p className="text-sm font-semibold text-gray-900">
            {report.detected_at.toLocaleString()}
          </p>
        </div>
      </div>

      {report.evidence && (
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-2">Evidence</p>
          <pre className="text-xs text-gray-700 overflow-auto max-h-48">
            {JSON.stringify(report.evidence, null, 2)}
          </pre>
        </div>
      )}

      {report.resolution_notes && (
        <div className="bg-green-50 p-3 rounded border border-green-200">
          <p className="text-xs text-green-700 font-medium mb-1">Resolution Notes</p>
          <p className="text-sm text-green-900">{report.resolution_notes}</p>
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

function getSeverityColor(severity: AbuseSeverity): {
  bg: string;
  icon: string;
} {
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
    resolved: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-100 text-gray-800'
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
