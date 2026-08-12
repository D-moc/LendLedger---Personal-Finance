import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Record",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "INITIAL",
        "PRINCIPAL_PAYMENT",
        "INTEREST_PAYMENT",
        "BOTH_PAYMENT",
        "INTEREST_CHARGE",
        "ADJUSTMENT",
      ],
      required: true,
    },

    principalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    interestAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    transactionDate: {
      type: Date,
      required: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    interestPeriod: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({
  userId: 1,
  recordId: 1,
  transactionDate: -1,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
