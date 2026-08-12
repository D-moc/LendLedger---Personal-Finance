import Record from "../models/Record.js";
import Transaction from "../models/Transaction.js";

export const createPayment = async (req, res) => {
  try {
    const {
      recordId,
      principalAmount = 0,
      interestAmount = 0,
      transactionDate,
      note = "",
    } = req.body;

    const userId = req.user.userId;

    const principal = Number(principalAmount);
    const interest = Number(interestAmount);

    // Basic validation
    if (!recordId) {
      return res.status(400).json({
        message: "Record ID is required",
      });
    }

    if (principal < 0 || interest < 0) {
      return res.status(400).json({
        message: "Payment amounts cannot be negative",
      });
    }

    if (principal === 0 && interest === 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than zero",
      });
    }

    // Find record belonging to logged-in user
    const record = await Record.findOne({
      _id: recordId,
      userId,
    });

    if (!record) {
      return res.status(404).json({
        message: "Financial record not found",
      });
    }

    // Prevent overpayment
    if (principal > record.outstandingPrincipal) {
      return res.status(400).json({
        message: `Principal payment cannot exceed outstanding principal of ₹${record.outstandingPrincipal}`,
      });
    }

    if (interest > record.outstandingInterest) {
      return res.status(400).json({
        message: `Interest payment cannot exceed outstanding interest of ₹${record.outstandingInterest}`,
      });
    }

    const totalAmount = principal + interest;

    let type;

    if (principal > 0 && interest > 0) {
      type = "BOTH_PAYMENT";
    } else if (principal > 0) {
      type = "PRINCIPAL_PAYMENT";
    } else {
      type = "INTEREST_PAYMENT";
    }

    const date = transactionDate
      ? new Date(transactionDate)
      : new Date();

    // Update record
    record.outstandingPrincipal = Number(
      (
        record.outstandingPrincipal - principal
      ).toFixed(2)
    );

    record.outstandingInterest = Number(
      (
        record.outstandingInterest - interest
      ).toFixed(2)
    );

    record.principalPaid = Number(
      (record.principalPaid + principal).toFixed(2)
    );

    record.interestPaid = Number(
      (record.interestPaid + interest).toFixed(2)
    );

    // Determine status
    if (
      record.outstandingPrincipal === 0 &&
      record.outstandingInterest === 0
    ) {
      record.status = "SETTLED";
    } else if (
      principal > 0 ||
      interest > 0
    ) {
      record.status = "PARTIALLY_PAID";
    }

    await record.save();

    // Create transaction history
    const transaction = await Transaction.create({
      userId,
      recordId,
      type,
      principalAmount: principal,
      interestAmount: interest,
      totalAmount,
      transactionDate: date,
      note: note.trim(),
    });

    res.status(201).json({
      message: "Payment recorded successfully",
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
    console.error("Create payment error:", error);

    res.status(500).json({
      message: "Server error while recording payment",
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { recordId } = req.params;

    const userId = req.user.userId;

    const record = await Record.findOne({
      _id: recordId,
      userId,
    });

    if (!record) {
      return res.status(404).json({
        message: "Financial record not found",
      });
    }

    const transactions = await Transaction.find({
      recordId,
      userId,
    }).sort({
      transactionDate: -1,
    });

    res.json({
      transactions,
    });
  } catch (error) {
    console.error(
      "Get transactions error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching transactions",
    });
  }
};