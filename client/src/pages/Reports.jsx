import { useEffect, useState } from "react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  IndianRupee,
  CreditCard,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  FileText,
  BarChart3,
  CircleDollarSign,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Percent,
  Activity,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

const Reports = () => {
  const [report, setReport] = useState(null);
  const [paymentTrends, setPaymentTrends] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH REPORTS + PAYMENT TRENDS
  // ==========================================

  const fetchReports = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [overviewResponse, trendsResponse] =
        await Promise.all([
          api.get("/reports/overview"),
          api.get("/reports/payment-trends"),
        ]);

      setReport(overviewResponse.data);
      setPaymentTrends(trendsResponse.data);
    } catch (error) {
      console.error("Reports error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (value = 0) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={22}
              className="mx-auto animate-spin text-violet-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading reports...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
              <AlertCircle size={20} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-slate-900">
              Unable to load reports
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchReports()}
              className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-slate-900 transition hover:bg-violet-500"
            >
              Try again
            </button>

          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return null;
  }

  // ==========================================
  // SAFE DATA
  // ==========================================

  const given = report.given || {};
  const borrowed = report.borrowed || {};
  const payments = report.payments || {};
  const records = report.records || {};

  // ==========================================
  // VALUES
  // ==========================================

  const givenOriginal = Number(
    given.original || 0
  );

  const borrowedOriginal = Number(
    borrowed.original || 0
  );

  const givenOutstanding = Number(
    given.outstanding || 0
  );

  const borrowedOutstanding = Number(
    borrowed.outstanding || 0
  );

  const givenPrincipal = Number(
    given.outstandingPrincipal || 0
  );

  const givenInterest = Number(
    given.outstandingInterest || 0
  );

  const borrowedPrincipal = Number(
    borrowed.outstandingPrincipal || 0
  );

  const borrowedInterest = Number(
    borrowed.outstandingInterest || 0
  );

  // ==========================================
  // OUTSTANDING
  // ==========================================

  const totalOutstanding =
    givenOutstanding +
    borrowedOutstanding;

  const totalOutstandingPrincipal =
    givenPrincipal +
    borrowedPrincipal;

  const totalOutstandingInterest =
    givenInterest +
    borrowedInterest;

  // ==========================================
  // INTEREST INSIGHTS
  // ==========================================

  const totalInterestPaid = Number(
    payments.interest || 0
  );

  const totalInterestOutstanding =
    totalOutstandingInterest;

  const totalInterestExposure =
    totalInterestPaid +
    totalInterestOutstanding;

  const givenInterestPercentage =
    totalInterestOutstanding > 0
      ? (givenInterest /
          totalInterestOutstanding) *
        100
      : 0;

  const borrowedInterestPercentage =
    totalInterestOutstanding > 0
      ? (borrowedInterest /
          totalInterestOutstanding) *
        100
      : 0;

  const interestOutstandingPercentage =
    totalOutstanding > 0
      ? (totalInterestOutstanding /
          totalOutstanding) *
        100
      : 0;

  const principalOutstandingPercentage =
    totalOutstanding > 0
      ? (totalOutstandingPrincipal /
          totalOutstanding) *
        100
      : 0;

  // ==========================================
  // COMPARISON
  // ==========================================

  const maxOriginal = Math.max(
    givenOriginal,
    borrowedOriginal,
    1
  );

  const maxOutstanding = Math.max(
    givenOutstanding,
    borrowedOutstanding,
    1
  );

  const maxInterest = Math.max(
    givenInterest,
    borrowedInterest,
    1
  );

  // ==========================================
  // PAYMENT TRENDS DATA
  // ==========================================

  const monthlyPayments =
    paymentTrends?.monthly || [];

  const trendSummary =
    paymentTrends?.summary || {
      total: 0,
      principal: 0,
      interest: 0,
      count: 0,
    };

  const maxMonthlyPayment = Math.max(
    ...monthlyPayments.map((item) =>
      Number(item.total || 0)
    ),
    1
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <DashboardLayout>

      <div className="space-y-8">

        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-600">
              Financial overview
            </p>

            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
              Reports
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Understand your lending and borrowing activity.
            </p>

          </div>

          <button
            type="button"
            onClick={() => fetchReports(false)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* ================================== */}
        {/* TOP SUMMARY */}
        {/* ================================== */}

        <div className="grid gap-4 md:grid-cols-3">

          <SummaryCard
            title="Money given"
            value={formatCurrency(
              givenOriginal
            )}
            subtitle={`${given.count || 0} record${
              given.count === 1
                ? ""
                : "s"
            }`}
            icon={ArrowUpRight}
            positive
          />

          <SummaryCard
            title="Money borrowed"
            value={formatCurrency(
              borrowedOriginal
            )}
            subtitle={`${borrowed.count || 0} record${
              borrowed.count === 1
                ? ""
                : "s"
            }`}
            icon={ArrowDownLeft}
          />

          <SummaryCard
            title="Net position"
            value={formatCurrency(
              report.netPosition
            )}
            subtitle={
              report.netPosition >= 0
                ? "More owed to you"
                : "More owed by you"
            }
            icon={TrendingUp}
            positive={
              report.netPosition >= 0
            }
          />

        </div>

        {/* ================================== */}
        {/* 3F.2 GIVEN VS BORROWED */}
        {/* ================================== */}

        <section>

          <SectionHeading
            icon={BarChart3}
            title="Given vs borrowed"
            subtitle="Compare your overall lending and borrowing position"
          />

          <div className="grid gap-4 lg:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03]">

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                    ORIGINAL AMOUNT
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Total amount initially recorded
                  </p>
                </div>

                <BarChart3
                  size={17}
                  className="text-violet-600"
                />
              </div>

              <div className="mt-7 space-y-6">

                <ComparisonBar
                  label="Money given"
                  value={givenOriginal}
                  maxValue={maxOriginal}
                  formattedValue={formatCurrency(
                    givenOriginal
                  )}
                  type="given"
                />

                <ComparisonBar
                  label="Money borrowed"
                  value={borrowedOriginal}
                  maxValue={maxOriginal}
                  formattedValue={formatCurrency(
                    borrowedOriginal
                  )}
                  type="borrowed"
                />

              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03]">

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                    OUTSTANDING AMOUNT
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Amount that is still unpaid
                  </p>
                </div>

                <IndianRupee
                  size={17}
                  className="text-violet-600"
                />
              </div>

              <div className="mt-7 space-y-6">

                <ComparisonBar
                  label="Money given"
                  value={givenOutstanding}
                  maxValue={maxOutstanding}
                  formattedValue={formatCurrency(
                    givenOutstanding
                  )}
                  type="given"
                />

                <ComparisonBar
                  label="Money borrowed"
                  value={borrowedOutstanding}
                  maxValue={maxOutstanding}
                  formattedValue={formatCurrency(
                    borrowedOutstanding
                  )}
                  type="borrowed"
                />

              </div>
            </div>

          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-5 py-4">

              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                COMPARISON
              </p>

            </div>

            <div className="grid grid-cols-3 border-b border-slate-100 px-5 py-4">

              <div className="text-[10px] text-slate-400">
                METRIC
              </div>

              <div className="text-right font-mono text-[9px] uppercase tracking-wider text-emerald-600">
                GIVEN
              </div>

              <div className="text-right font-mono text-[9px] uppercase tracking-wider text-amber-600">
                BORROWED
              </div>

            </div>

            <ComparisonRow
              label="Original amount"
              given={givenOriginal}
              borrowed={borrowedOriginal}
              formatCurrency={
                formatCurrency
              }
            />

            <ComparisonRow
              label="Outstanding"
              given={givenOutstanding}
              borrowed={borrowedOutstanding}
              formatCurrency={
                formatCurrency
              }
            />

            <ComparisonRow
              label="Records"
              given={given.count || 0}
              borrowed={
                borrowed.count || 0
              }
              formatCurrency={(value) =>
                Number(value).toLocaleString(
                  "en-IN"
                )
              }
            />

          </div>

        </section>

        {/* ================================== */}
        {/* 3F.3 OUTSTANDING ANALYSIS */}
        {/* ================================== */}

        <section>

          <SectionHeading
            icon={CircleDollarSign}
            title="Outstanding analysis"
            subtitle="Break down what is still unpaid"
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03]">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                  TOTAL OUTSTANDING
                </p>

                <p className="mt-2 font-mono text-3xl font-bold text-slate-900">
                  {formatCurrency(
                    totalOutstanding
                  )}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Across all active financial records
                </p>

              </div>

              <div className="w-full max-w-md">

                <div className="mb-3 flex items-center justify-between">

                  <span className="text-xs text-slate-500">
                    Principal
                  </span>

                  <span className="font-mono text-xs text-slate-700">
                    {formatCurrency(
                      totalOutstandingPrincipal
                    )}
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-700"
                    style={{
                      width: `${principalOutstandingPercentage}%`,
                    }}
                  />

                </div>

                <div className="mt-3 flex items-center justify-between">

                  <span className="text-xs text-slate-500">
                    Interest
                  </span>

                  <span className="font-mono text-xs text-slate-700">
                    {formatCurrency(
                      totalOutstandingInterest
                    )}
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-700"
                    style={{
                      width: `${interestOutstandingPercentage}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">

            <OutstandingCard
              title="Money given"
              outstanding={
                givenOutstanding
              }
              principal={
                givenPrincipal
              }
              interest={
                givenInterest
              }
              icon={ArrowUpRight}
              type="given"
            />

            <OutstandingCard
              title="Money borrowed"
              outstanding={
                borrowedOutstanding
              }
              principal={
                borrowedPrincipal
              }
              interest={
                borrowedInterest
              }
              icon={ArrowDownLeft}
              type="borrowed"
            />

          </div>

          <div className="mt-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">

              <div className="flex items-center justify-between">

                <div>

                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                    RECORD STATUS
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Distribution of your current records
                  </p>

                </div>

                <FileText
                  size={16}
                  className="text-slate-500"
                />

              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">

                <StatusBreakdown
                  label="Total"
                  value={
                    records.total
                  }
                  icon={FileText}
                />

                <StatusBreakdown
                  label="Active"
                  value={
                    records.active
                  }
                  icon={Clock3}
                />

                <StatusBreakdown
                  label="Partial"
                  value={
                    records.partiallyPaid
                  }
                  icon={
                    CircleDollarSign
                  }
                />

                <StatusBreakdown
                  label="Overdue"
                  value={
                    records.overdue
                  }
                  icon={
                    AlertTriangle
                  }
                />

                <StatusBreakdown
                  label="Settled"
                  value={
                    records.settled
                  }
                  icon={
                    CheckCircle2
                  }
                />

              </div>

            </div>

          </div>

        </section>

        {/* ================================== */}
        {/* 3F.4 INTEREST INSIGHTS */}
        {/* ================================== */}

        <section>

          <SectionHeading
            icon={Percent}
            title="Interest insights"
            subtitle="Understand interest paid and currently outstanding"
          />

          <div className="grid gap-4 md:grid-cols-3">

            <InterestMetricCard
              label="Interest paid"
              value={formatCurrency(
                totalInterestPaid
              )}
              subtitle="Total interest payments recorded"
            />

            <InterestMetricCard
              label="Interest outstanding"
              value={formatCurrency(
                totalInterestOutstanding
              )}
              subtitle="Interest still unpaid"
            />

            <InterestMetricCard
              label="Interest exposure"
              value={formatCurrency(
                totalInterestExposure
              )}
              subtitle="Paid + currently outstanding"
            />

          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03]">

              <div className="flex items-center justify-between">

                <div>

                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                    INTEREST OUTSTANDING
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Given vs borrowed
                  </p>

                </div>

                <Percent
                  size={17}
                  className="text-violet-600"
                />

              </div>

              <div className="mt-7 space-y-6">

                <InterestBar
                  label="Money given"
                  value={givenInterest}
                  maxValue={maxInterest}
                  percentage={
                    givenInterestPercentage
                  }
                  type="given"
                  formatCurrency={
                    formatCurrency
                  }
                />

                <InterestBar
                  label="Money borrowed"
                  value={borrowedInterest}
                  maxValue={maxInterest}
                  percentage={
                    borrowedInterestPercentage
                  }
                  type="borrowed"
                  formatCurrency={
                    formatCurrency
                  }
                />

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03]">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                  OUTSTANDING BREAKDOWN
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Principal vs interest
                </p>

              </div>

              <div className="mt-7">

                <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="bg-violet-500 transition-all duration-700"
                    style={{
                      width: `${principalOutstandingPercentage}%`,
                    }}
                  />

                  <div
                    className="bg-amber-500 transition-all duration-700"
                    style={{
                      width: `${interestOutstandingPercentage}%`,
                    }}
                  />

                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-white p-4">

                    <div className="flex items-center gap-2">

                      <span className="h-2 w-2 rounded-full bg-violet-600" />

                      <p className="text-xs text-slate-500">
                        Principal
                      </p>

                    </div>

                    <p className="mt-2 font-mono text-lg text-slate-700">
                      {formatCurrency(
                        totalOutstandingPrincipal
                      )}
                    </p>

                    <p className="mt-1 font-mono text-[9px] text-slate-400">
                      {principalOutstandingPercentage.toFixed(
                        1
                      )}
                      %
                    </p>

                  </div>

                  <div className="rounded-xl bg-white p-4">

                    <div className="flex items-center gap-2">

                      <span className="h-2 w-2 rounded-full bg-amber-400" />

                      <p className="text-xs text-slate-500">
                        Interest
                      </p>

                    </div>

                    <p className="mt-2 font-mono text-lg text-slate-700">
                      {formatCurrency(
                        totalOutstandingInterest
                      )}
                    </p>

                    <p className="mt-1 font-mono text-[9px] text-slate-400">
                      {interestOutstandingPercentage.toFixed(
                        1
                      )}
                      %
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">

            <div className="grid gap-4 sm:grid-cols-3">

              <InterestDetail
                label="Given interest outstanding"
                value={formatCurrency(
                  givenInterest
                )}
              />

              <InterestDetail
                label="Borrowed interest outstanding"
                value={formatCurrency(
                  borrowedInterest
                )}
              />

              <InterestDetail
                label="Interest paid"
                value={formatCurrency(
                  totalInterestPaid
                )}
              />

            </div>

          </div>

        </section>

        {/* ================================== */}
        {/* 3F.5 PAYMENT TRENDS */}
        {/* ================================== */}

        <section>

          <SectionHeading
            icon={Activity}
            title="Payment trends"
            subtitle="Track your payment activity month by month"
          />

          {/* TREND SUMMARY */}

          <div className="grid gap-4 sm:grid-cols-3">

            <TrendSummaryCard
              label="Total payments"
              value={formatCurrency(
                trendSummary.total
              )}
              subtitle={`${trendSummary.count || 0} payment transaction${
                trendSummary.count === 1
                  ? ""
                  : "s"
              }`}
            />

            <TrendSummaryCard
              label="Principal paid"
              value={formatCurrency(
                trendSummary.principal
              )}
              subtitle="Principal portion"
            />

            <TrendSummaryCard
              label="Interest paid"
              value={formatCurrency(
                trendSummary.interest
              )}
              subtitle="Interest portion"
            />

          </div>

          {/* MONTHLY CHART */}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03]">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                  MONTHLY PAYMENTS
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total amount paid each month
                </p>

              </div>

              <BarChart3
                size={17}
                className="text-violet-600"
              />

            </div>

            {monthlyPayments.length === 0 ? (

              <div className="flex min-h-[220px] items-center justify-center">

                <div className="text-center">

                  <Activity
                    size={22}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    No payment data yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your payment trends will appear here after you record payments.
                  </p>

                </div>

              </div>

            ) : (

              <div className="mt-8">

                <div className="flex h-64 items-end gap-2 overflow-x-auto pb-8">

                  {monthlyPayments.map(
                    (item, index) => {

                      const total =
                        Number(
                          item.total || 0
                        );

                      const height =
                        Math.max(
                          4,
                          (total /
                            maxMonthlyPayment) *
                            100
                        );

                      return (
                        <div
                          key={`${item.year}-${item.month}-${index}`}
                          className="group flex min-w-[70px] flex-1 flex-col items-center justify-end"
                        >

                          <div className="mb-2 text-center opacity-0 transition group-hover:opacity-100">

                            <p className="font-mono text-[10px] font-semibold text-slate-700">
                              {formatCurrency(
                                total
                              )}
                            </p>

                          </div>

                          <div
                            className="w-full max-w-[44px] rounded-t-lg bg-violet-600/60 transition-all duration-500 group-hover:bg-violet-500"
                            style={{
                              height: `${height}%`,
                              minHeight: "4px",
                            }}
                            title={`${item.label}: ${formatCurrency(
                              total
                            )}`}
                          />

                          <p className="mt-3 whitespace-nowrap font-mono text-[9px] text-slate-400">
                            {item.label}
                          </p>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            )}

          </div>

          {/* MONTHLY DETAILS */}

          {monthlyPayments.length > 0 && (

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">

              <div className="border-b border-slate-200 px-5 py-4">

                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                  MONTHLY DETAILS
                </p>

              </div>

              <div className="grid grid-cols-4 border-b border-slate-100 px-5 py-3">

                <span className="text-[9px] text-slate-400">
                  MONTH
                </span>

                <span className="text-right text-[9px] text-slate-400">
                  TOTAL
                </span>

                <span className="text-right text-[9px] text-slate-400">
                  PRINCIPAL
                </span>

                <span className="text-right text-[9px] text-slate-400">
                  INTEREST
                </span>

              </div>

              {monthlyPayments
                .slice()
                .reverse()
                .map((item, index) => (

                  <div
                    key={`${item.year}-${item.month}-${index}`}
                    className="grid grid-cols-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
                  >

                    <div className="text-xs text-slate-600">
                      {item.label}
                    </div>

                    <div className="text-right font-mono text-xs text-slate-700">
                      {formatCurrency(
                        item.total
                      )}
                    </div>

                    <div className="text-right font-mono text-xs text-slate-500">
                      {formatCurrency(
                        item.principal
                      )}
                    </div>

                    <div className="text-right font-mono text-xs text-slate-500">
                      {formatCurrency(
                        item.interest
                      )}
                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

        {/* ================================== */}
        {/* PAYMENT SUMMARY */}
        {/* ================================== */}

        <section>

          <SectionHeading
            icon={CreditCard}
            title="Payment summary"
            subtitle="Your recorded payment activity"
          />

          <div className="grid gap-4 sm:grid-cols-3">

            <MetricCard
              label="Total paid"
              value={formatCurrency(
                payments.total
              )}
            />

            <MetricCard
              label="Principal paid"
              value={formatCurrency(
                payments.principal
              )}
            />

            <MetricCard
              label="Interest paid"
              value={formatCurrency(
                payments.interest
              )}
            />

          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                  PAYMENT ACTIVITY
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Total recorded payments
                </p>

              </div>

              <div className="text-right">

                <p className="font-mono text-2xl font-bold text-slate-900">
                  {payments.count || 0}
                </p>

                <p className="font-mono text-[8px] uppercase tracking-wider text-slate-400">
                  transactions
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================== */}
        {/* RECORD STATUS */}
        {/* ================================== */}

        <section>

          <SectionHeading
            icon={FileText}
            title="Record status"
            subtitle="Current state of your financial records"
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

            <StatusCard
              label="Total"
              value={records.total}
            />

            <StatusCard
              label="Active"
              value={records.active}
            />

            <StatusCard
              label="Partially paid"
              value={records.partiallyPaid}
            />

            <StatusCard
              label="Overdue"
              value={records.overdue}
            />

            <StatusCard
              label="Settled"
              value={records.settled}
            />

          </div>

        </section>

      </div>
    </DashboardLayout>
  );
};


// ==========================================
// SUMMARY CARD
// ==========================================

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  positive = false,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">

      <div className="flex items-start justify-between">

        <div>

          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
            {title}
          </p>

          <p
            className={`mt-3 font-mono text-2xl font-bold ${
              positive
                ? "text-violet-700"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {subtitle}
          </p>

        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600">

          <Icon size={16} />

        </div>

      </div>

    </div>
  );
};


// ==========================================
// SECTION HEADING
// ==========================================

const SectionHeading = ({
  icon: Icon,
  title,
  subtitle,
}) => {
  return (
    <div className="mb-4 flex items-center gap-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">

        <Icon size={15} />

      </div>

      <div>

        <h2 className="text-sm font-semibold text-slate-800">
          {title}
        </h2>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {subtitle}
        </p>

      </div>

    </div>
  );
};


// ==========================================
// COMPARISON BAR
// ==========================================

const ComparisonBar = ({
  label,
  value,
  maxValue,
  formattedValue,
  type,
}) => {
  const percentage =
    maxValue > 0
      ? Math.min(
          100,
          (value / maxValue) * 100
        )
      : 0;

  const isGiven =
    type === "given";

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className={`h-2 w-2 rounded-full ${
              isGiven
                ? "bg-emerald-400"
                : "bg-amber-400"
            }`}
          />

          <span className="text-xs text-slate-600">
            {label}
          </span>

        </div>

        <span className="font-mono text-xs font-medium text-slate-700">
          {formattedValue}
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isGiven
              ? "bg-emerald-500"
              : "bg-amber-500"
          }`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <p className="mt-1 text-right font-mono text-[8px] text-slate-400">
        {percentage.toFixed(0)}% of highest value
      </p>

    </div>
  );
};


// ==========================================
// COMPARISON ROW
// ==========================================

const ComparisonRow = ({
  label,
  given,
  borrowed,
  formatCurrency,
}) => {
  return (
    <div className="grid grid-cols-3 border-b border-slate-100 px-5 py-4 last:border-b-0">

      <div className="text-xs text-slate-500">
        {label}
      </div>

      <div className="text-right font-mono text-xs text-slate-700">
        {formatCurrency(given)}
      </div>

      <div className="text-right font-mono text-xs text-slate-700">
        {formatCurrency(borrowed)}
      </div>

    </div>
  );
};


// ==========================================
// OUTSTANDING CARD
// ==========================================

const OutstandingCard = ({
  title,
  outstanding,
  principal,
  interest,
  icon: Icon,
  type,
}) => {
  const principalPercentage =
    outstanding > 0
      ? Math.min(
          100,
          (principal / outstanding) *
            100
        )
      : 0;

  const interestPercentage =
    outstanding > 0
      ? Math.min(
          100,
          (interest / outstanding) *
            100
        )
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-700">
            {title}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Current outstanding
          </p>

        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            type === "given"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >

          <Icon size={16} />

        </div>

      </div>

      <p className="mt-6 font-mono text-2xl font-bold text-slate-900">
        {`₹${Number(
          outstanding || 0
        ).toLocaleString("en-IN")}`}
      </p>

      <div className="mt-5 space-y-4">

        <div>

          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs text-slate-500">
              Principal
            </span>

            <span className="font-mono text-xs text-slate-600">
              {`₹${Number(
                principal || 0
              ).toLocaleString(
                "en-IN"
              )}`}
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-violet-500"
              style={{
                width: `${principalPercentage}%`,
              }}
            />

          </div>

        </div>

        <div>

          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs text-slate-500">
              Interest
            </span>

            <span className="font-mono text-xs text-slate-600">
              {`₹${Number(
                interest || 0
              ).toLocaleString(
                "en-IN"
              )}`}
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-amber-500"
              style={{
                width: `${interestPercentage}%`,
              }}
            />

          </div>

        </div>

      </div>

    </div>
  );
};


// ==========================================
// STATUS BREAKDOWN
// ==========================================

const StatusBreakdown = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">

      <Icon
        size={14}
        className="text-slate-500"
      />

      <p className="mt-3 font-mono text-xl font-semibold text-slate-700">
        {value || 0}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {label}
      </p>

    </div>
  );
};


// ==========================================
// INTEREST METRIC CARD
// ==========================================

const InterestMetricCard = ({
  label,
  value,
  subtitle,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">

      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>

      <p className="mt-3 font-mono text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-[11px] text-slate-500">
        {subtitle}
      </p>

    </div>
  );
};


// ==========================================
// INTEREST BAR
// ==========================================

const InterestBar = ({
  label,
  value,
  maxValue,
  percentage,
  type,
  formatCurrency,
}) => {
  const width =
    maxValue > 0
      ? Math.min(
          100,
          (value / maxValue) * 100
        )
      : 0;

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className={`h-2 w-2 rounded-full ${
              type === "given"
                ? "bg-emerald-400"
                : "bg-amber-400"
            }`}
          />

          <span className="text-xs text-slate-600">
            {label}
          </span>

        </div>

        <span className="font-mono text-xs text-slate-700">
          {formatCurrency(value)}
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full transition-all duration-700 ${
            type === "given"
              ? "bg-emerald-500"
              : "bg-amber-500"
          }`}
          style={{
            width: `${width}%`,
          }}
        />

      </div>

      <p className="mt-1 text-right font-mono text-[8px] text-slate-400">
        {percentage.toFixed(1)}% of interest outstanding
      </p>

    </div>
  );
};


// ==========================================
// INTEREST DETAIL
// ==========================================

const InterestDetail = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-white p-4">

      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-mono text-lg font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
};


// ==========================================
// PAYMENT TREND SUMMARY CARD
// ==========================================

const TrendSummaryCard = ({
  label,
  value,
  subtitle,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">

      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>

      <p className="mt-3 font-mono text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-[11px] text-slate-500">
        {subtitle}
      </p>

    </div>
  );
};


// ==========================================
// METRIC CARD
// ==========================================

const MetricCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">

      <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-3 font-mono text-xl font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
};


// ==========================================
// STATUS CARD
// ==========================================

const StatusCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <p className="font-mono text-[8px] uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-mono text-xl font-semibold text-slate-700">
        {value || 0}
      </p>

    </div>
  );
};


export default Reports;