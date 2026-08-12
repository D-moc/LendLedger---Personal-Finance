import mongoose from "mongoose";

const interestTransactionSchema =
  new mongoose.Schema(
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

      personId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Person",
        required: true,
        index: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      rate: {
        type: Number,
        required: true,
        min: 0,
      },

      principalBase: {
        type: Number,
        required: true,
        min: 0,
      },

      periodStart: {
        type: Date,
        required: true,
      },

      periodEnd: {
        type: Date,
        required: true,
      },

      status: {
        type: String,
        enum: ["DUE", "PAID"],
        default: "DUE",
      },

      paidAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      notes: {
        type: String,
        trim: true,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

interestTransactionSchema.index({
  userId: 1,
  recordId: 1,
  periodStart: 1,
  periodEnd: 1,
});

const InterestTransaction =
  mongoose.model(
    "InterestTransaction",
    interestTransactionSchema
  );

export default InterestTransaction;