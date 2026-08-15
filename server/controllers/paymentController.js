import Record from "../models/Record.js";
import Transaction from "../models/Transaction.js";

import {
  createPaymentNotification,
} from "../services/notificationService.js";


// ==========================================
// CREATE PAYMENT
// ==========================================

export const createPayment = async (
  req,
  res
) => {
  try {
    const {
      recordId,
      principalAmount = 0,
      interestAmount = 0,
      transactionDate,
      note = "",
    } = req.body;

    // ----------------------------------------
    // USER
    // ----------------------------------------

    const userId = req.user._id;

    const principal =
      Number(principalAmount);

    const interest =
      Number(interestAmount);


    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!recordId) {
      return res.status(400).json({
        message:
          "Record ID is required",
      });
    }

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(interest)
    ) {
      return res.status(400).json({
        message:
          "Invalid payment amount",
      });
    }

    if (
      principal < 0 ||
      interest < 0
    ) {
      return res.status(400).json({
        message:
          "Payment amounts cannot be negative",
      });
    }

    if (
      principal === 0 &&
      interest === 0
    ) {
      return res.status(400).json({
        message:
          "Payment amount must be greater than zero",
      });
    }


    // ----------------------------------------
    // FIND USER'S RECORD
    // ----------------------------------------

    const record =
      await Record.findOne({
        _id: recordId,
        userId,
      });

    if (!record) {
      return res.status(404).json({
        message:
          "Financial record not found",
      });
    }


    // ----------------------------------------
    // PREVENT PRINCIPAL OVERPAYMENT
    // ----------------------------------------

    if (
      principal >
      record.outstandingPrincipal
    ) {
      return res.status(400).json({
        message:
          `Principal payment cannot exceed outstanding principal of ₹${record.outstandingPrincipal}`,
      });
    }

    // Interest payments are intentionally
    // not capped by outstandingInterest.
    //
    // Interest can be manually recorded as
    // money received even when the currently
    // outstanding interest is ₹0.


    // ----------------------------------------
    // DETERMINE TRANSACTION TYPE
    // ----------------------------------------

    let type;

    if (
      principal > 0 &&
      interest > 0
    ) {
      type = "BOTH_PAYMENT";
    } else if (
      principal > 0
    ) {
      type =
        "PRINCIPAL_PAYMENT";
    } else {
      type =
        "INTEREST_PAYMENT";
    }


    // ----------------------------------------
    // TOTAL AMOUNT
    // ----------------------------------------

    const totalAmount =
      Number(
        (
          principal +
          interest
        ).toFixed(2)
      );


    // ----------------------------------------
    // PAYMENT DATE
    // ----------------------------------------

    const date =
      transactionDate
        ? new Date(transactionDate)
        : new Date();

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid transaction date",
      });
    }


    // ----------------------------------------
    // UPDATE OUTSTANDING BALANCES
    // ----------------------------------------

    record.outstandingPrincipal =
      Number(
        Math.max(
          0,
          record.outstandingPrincipal -
            principal
        ).toFixed(2)
      );

    record.outstandingInterest =
      Number(
        Math.max(
          0,
          record.outstandingInterest -
            interest
        ).toFixed(2)
      );


    // ----------------------------------------
    // UPDATE PAID TOTALS
    // ----------------------------------------

    record.principalPaid =
      Number(
        (
          (record.principalPaid || 0) +
          principal
        ).toFixed(2)
      );

    record.interestPaid =
      Number(
        (
          (record.interestPaid || 0) +
          interest
        ).toFixed(2)
      );


    // ----------------------------------------
    // DETERMINE STATUS
    // ----------------------------------------

    if (
      record.outstandingPrincipal <= 0 &&
      record.outstandingInterest <= 0
    ) {
      record.outstandingPrincipal = 0;
      record.outstandingInterest = 0;

      record.status = "SETTLED";
    } else {
      record.status =
        "PARTIALLY_PAID";
    }


    // ----------------------------------------
    // SAVE RECORD
    // ----------------------------------------

    await record.save();


    // ----------------------------------------
    // CREATE TRANSACTION
    // ----------------------------------------

    const transaction =
      await Transaction.create({
        userId,

        recordId:
          record._id,

        type,

        principalAmount:
          principal,

        interestAmount:
          interest,

        totalAmount,

        transactionDate:
          date,

        note:
          note.trim(),
      });


    // ----------------------------------------
    // CREATE PAYMENT NOTIFICATION
    // ----------------------------------------

    try {
      const populatedRecord =
        await record.populate({
          path: "personId",
          select: "name",
        });

      await createPaymentNotification({
        userId,

        recordId:
          record._id,

        transactionId:
          transaction._id,

        amount:
          totalAmount,

        personName:
          populatedRecord
            .personId?.name,
      });
    } catch (
      notificationError
    ) {
      console.error(
        "Payment notification error:",
        notificationError
      );
    }


    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(201).json({
      message:
        "Payment recorded successfully",

      transaction,

      record: {
        outstandingPrincipal:
          record.outstandingPrincipal,

        outstandingInterest:
          record.outstandingInterest,

        principalPaid:
          record.principalPaid,

        interestPaid:
          record.interestPaid,

        status:
          record.status,
      },
    });

  } catch (error) {
    console.error(
      "Create payment error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while recording payment",
    });
  }
};


// ==========================================
// GET ALL TRANSACTIONS FOR ONE RECORD
// ==========================================

export const getTransactions = async (
  req,
  res
) => {
  try {
    const {
      recordId,
    } = req.params;

    const userId =
      req.user._id;


    // ----------------------------------------
    // VERIFY RECORD OWNERSHIP
    // ----------------------------------------

    const record =
      await Record.findOne({
        _id: recordId,
        userId,
      });

    if (!record) {
      return res.status(404).json({
        message:
          "Financial record not found",
      });
    }


    // ----------------------------------------
    // GET TRANSACTIONS
    // ----------------------------------------

    const transactions =
      await Transaction.find({
        recordId:
          record._id,

        userId,
      }).sort({
        transactionDate: -1,
        createdAt: -1,
      });


    return res.status(200).json({
      transactions,
    });

  } catch (error) {
    console.error(
      "Get transactions error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching transactions",
    });
  }
};


// ==========================================
// GET ALL PAYMENTS
// ==========================================

export const getAllPayments = async (
  req,
  res
) => {
  try {
    const userId =
      req.user._id;


    // ----------------------------------------
    // GET PAYMENT TRANSACTIONS
    // ----------------------------------------

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
        .populate({
          path: "recordId",

          select:
            "direction personId originalPrincipal outstandingPrincipal interestRate interestType status",

          populate: {
            path: "personId",

            select:
              "name phone",
          },
        })
        .sort({
          transactionDate: -1,
          createdAt: -1,
        });


    return res.status(200).json({
      transactions,
    });

  } catch (error) {
    console.error(
      "Get all payments error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching payments",
    });
  }
};


// ==========================================
// GET PAYMENT TRENDS
// ==========================================

export const getPaymentTrends =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user._id;


      // --------------------------------------
      // GET PAYMENT TRANSACTIONS
      // --------------------------------------

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


      // ======================================
      // GROUP BY MONTH
      // ======================================

      const monthlyMap =
        new Map();

      for (
        const transaction
        of transactions
      ) {
        const date =
          new Date(
            transaction.transactionDate
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          continue;
        }

        const year =
          date.getFullYear();

        const month =
          date.getMonth();

        const key =
          `${year}-${String(
            month + 1
          ).padStart(2, "0")}`;


        if (
          !monthlyMap.has(key)
        ) {
          monthlyMap.set(
            key,
            {
              year,

              month:
                month + 1,

              label:
                date.toLocaleString(
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
            }
          );
        }


        const current =
          monthlyMap.get(key);


        current.total +=
          Number(
            transaction.totalAmount ||
              0
          );

        current.principal +=
          Number(
            transaction.principalAmount ||
              0
          );

        current.interest +=
          Number(
            transaction.interestAmount ||
              0
          );

        current.count += 1;
      }


      // ======================================
      // FORMAT MONTHLY DATA
      // ======================================

      const monthly =
        Array.from(
          monthlyMap.values()
        ).map(
          (item) => ({
            year:
              item.year,

            month:
              item.month,

            label:
              item.label,

            total:
              Number(
                item.total.toFixed(2)
              ),

            principal:
              Number(
                item.principal.toFixed(
                  2
                )
              ),

            interest:
              Number(
                item.interest.toFixed(
                  2
                )
              ),

            count:
              item.count,
          })
        );


      // ======================================
      // OVERALL TOTALS
      // ======================================

      const total =
        transactions.reduce(
          (
            sum,
            transaction
          ) =>
            sum +
            Number(
              transaction.totalAmount ||
                0
            ),
          0
        );


      const principal =
        transactions.reduce(
          (
            sum,
            transaction
          ) =>
            sum +
            Number(
              transaction.principalAmount ||
                0
            ),
          0
        );


      const interest =
        transactions.reduce(
          (
            sum,
            transaction
          ) =>
            sum +
            Number(
              transaction.interestAmount ||
                0
            ),
          0
        );


      // ======================================
      // RESPONSE
      // ======================================

      return res.status(200).json({
        monthly,

        summary: {
          total:
            Number(
              total.toFixed(2)
            ),

          principal:
            Number(
              principal.toFixed(2)
            ),

          interest:
            Number(
              interest.toFixed(2)
            ),

          count:
            transactions.length,
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