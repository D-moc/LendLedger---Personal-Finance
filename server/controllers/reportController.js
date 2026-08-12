import Record from "../models/Record.js";
import Transaction from "../models/Transaction.js";


// ==========================================
// GET REPORT OVERVIEW
// ==========================================

export const getReportOverview = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    // ========================================
    // GET ALL USER RECORDS
    // ========================================

    const records = await Record.find({
      userId,
    }).lean();


    // ========================================
    // GIVEN
    // ========================================

    const givenRecords =
      records.filter(
        (record) =>
          record.direction === "GIVEN"
      );

    const givenOriginal =
      givenRecords.reduce(
        (total, record) =>
          total +
          Number(
            record.originalPrincipal || 0
          ),
        0
      );

    const givenOutstandingPrincipal =
      givenRecords.reduce(
        (total, record) =>
          total +
          Number(
            record.outstandingPrincipal || 0
          ),
        0
      );

    const givenOutstandingInterest =
      givenRecords.reduce(
        (total, record) =>
          total +
          Number(
            record.outstandingInterest || 0
          ),
        0
      );


    // ========================================
    // BORROWED
    // ========================================

    const borrowedRecords =
      records.filter(
        (record) =>
          record.direction === "BORROWED"
      );

    const borrowedOriginal =
      borrowedRecords.reduce(
        (total, record) =>
          total +
          Number(
            record.originalPrincipal || 0
          ),
        0
      );

    const borrowedOutstandingPrincipal =
      borrowedRecords.reduce(
        (total, record) =>
          total +
          Number(
            record.outstandingPrincipal || 0
          ),
        0
      );

    const borrowedOutstandingInterest =
      borrowedRecords.reduce(
        (total, record) =>
          total +
          Number(
            record.outstandingInterest || 0
          ),
        0
      );


    // ========================================
    // PAYMENT TRANSACTIONS
    // ========================================

    const paymentTypes = [
      "PRINCIPAL_PAYMENT",
      "INTEREST_PAYMENT",
      "BOTH_PAYMENT",
    ];

    const payments =
      await Transaction.find({
        userId,

        type: {
          $in: paymentTypes,
        },
      }).lean();


    const totalPayments =
      payments.reduce(
        (total, payment) =>
          total +
          Number(
            payment.totalAmount || 0
          ),
        0
      );

    const totalPrincipalPaid =
      payments.reduce(
        (total, payment) =>
          total +
          Number(
            payment.principalAmount || 0
          ),
        0
      );

    const totalInterestPaid =
      payments.reduce(
        (total, payment) =>
          total +
          Number(
            payment.interestAmount || 0
          ),
        0
      );


    // ========================================
    // OUTSTANDING
    // ========================================

    const givenOutstanding =
      givenOutstandingPrincipal +
      givenOutstandingInterest;

    const borrowedOutstanding =
      borrowedOutstandingPrincipal +
      borrowedOutstandingInterest;


    // ========================================
    // NET POSITION
    //
    // Positive = more money is owed to you
    // Negative = you owe more money
    // ========================================

    const netPosition =
      givenOutstanding -
      borrowedOutstanding;


    // ========================================
    // RECORD COUNTS
    // ========================================

    const activeRecords =
      records.filter(
        (record) =>
          record.status === "ACTIVE"
      ).length;

    const partiallyPaidRecords =
      records.filter(
        (record) =>
          record.status ===
          "PARTIALLY_PAID"
      ).length;

    const overdueRecords =
      records.filter(
        (record) =>
          record.status === "OVERDUE"
      ).length;

    const settledRecords =
      records.filter(
        (record) =>
          record.status === "SETTLED"
      ).length;


    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      given: {
        original:
          Number(
            givenOriginal.toFixed(2)
          ),

        outstandingPrincipal:
          Number(
            givenOutstandingPrincipal.toFixed(2)
          ),

        outstandingInterest:
          Number(
            givenOutstandingInterest.toFixed(2)
          ),

        outstanding:
          Number(
            givenOutstanding.toFixed(2)
          ),

        count:
          givenRecords.length,
      },

      borrowed: {
        original:
          Number(
            borrowedOriginal.toFixed(2)
          ),

        outstandingPrincipal:
          Number(
            borrowedOutstandingPrincipal.toFixed(2)
          ),

        outstandingInterest:
          Number(
            borrowedOutstandingInterest.toFixed(2)
          ),

        outstanding:
          Number(
            borrowedOutstanding.toFixed(2)
          ),

        count:
          borrowedRecords.length,
      },

      payments: {
        total:
          Number(
            totalPayments.toFixed(2)
          ),

        principal:
          Number(
            totalPrincipalPaid.toFixed(2)
          ),

        interest:
          Number(
            totalInterestPaid.toFixed(2)
          ),

        count:
          payments.length,
      },

      netPosition:
        Number(
          netPosition.toFixed(2)
        ),

      records: {
        total:
          records.length,

        active:
          activeRecords,

        partiallyPaid:
          partiallyPaidRecords,

        overdue:
          overdueRecords,

        settled:
          settledRecords,
      },
    });

  } catch (error) {
    console.error(
      "Report overview error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to generate report overview",
    });
  }
};

// ==========================================
// GET PAYMENT TRENDS
// ==========================================

export const getPaymentTrends = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const transactions =
      await Transaction.find({
        userId,
        type: {
          $in: [
            "PRINCIPAL_PAYMENT",
            "INTEREST_PAYMENT",
            "BOTH_PAYMENT",
          ],
        },
      })
        .sort({
          transactionDate: 1,
          createdAt: 1,
        })
        .lean();

    const monthlyMap = new Map();

    for (const transaction of transactions) {
      const date = new Date(
        transaction.transactionDate
      );

      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const year = date.getFullYear();
      const month = date.getMonth();

      const key = `${year}-${String(
        month + 1
      ).padStart(2, "0")}`;

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          year,
          month: month + 1,
          label: date.toLocaleString(
            "en-IN",
            {
              month: "short",
              year: "numeric",
            }
          ),
          total: 0,
          principal: 0,
          interest: 0,
          count: 0,
        });
      }

      const current =
        monthlyMap.get(key);

      current.total += Number(
        transaction.totalAmount || 0
      );

      current.principal += Number(
        transaction.principalAmount || 0
      );

      current.interest += Number(
        transaction.interestAmount || 0
      );

      current.count += 1;
    }

    const monthly = Array.from(
      monthlyMap.values()
    ).map((item) => ({
      year: item.year,
      month: item.month,
      label: item.label,

      total: Number(
        item.total.toFixed(2)
      ),

      principal: Number(
        item.principal.toFixed(2)
      ),

      interest: Number(
        item.interest.toFixed(2)
      ),

      count: item.count,
    }));

    const total =
      transactions.reduce(
        (sum, transaction) =>
          sum +
          Number(
            transaction.totalAmount || 0
          ),
        0
      );

    const principal =
      transactions.reduce(
        (sum, transaction) =>
          sum +
          Number(
            transaction.principalAmount || 0
          ),
        0
      );

    const interest =
      transactions.reduce(
        (sum, transaction) =>
          sum +
          Number(
            transaction.interestAmount || 0
          ),
        0
      );

    return res.status(200).json({
      monthly,

      summary: {
        total: Number(
          total.toFixed(2)
        ),

        principal: Number(
          principal.toFixed(2)
        ),

        interest: Number(
          interest.toFixed(2)
        ),

        count: transactions.length,
      },
    });

  } catch (error) {
    console.error(
      "Payment trends error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to generate payment trends",
    });
  }
};