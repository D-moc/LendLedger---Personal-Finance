import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
      index: true,
    },

    direction: {
      type: String,
      enum: ["GIVEN", "BORROWED"],
      required: true,
    },

    originalPrincipal: {
      type: Number,
      required: [true, "Original amount is required"],
      min: 0.01,
    },

    outstandingPrincipal: {
      type: Number,
      required: true,
      min: 0,
    },

    interestRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    interestType: {
      type: String,
      enum: ["NONE", "MONTHLY"],
      default: "NONE",
    },

    outstandingInterest: {
      type: Number,
      default: 0,
      min: 0,
    },

    interestPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    principalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },

    nextInterestDate: {
      type: Date,
      default: null,
    },

    lastInterestDate: {
      type: Date,
      default: null,
    },

    interestDueSince: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "DUE_SOON", "OVERDUE", "PARTIALLY_PAID", "SETTLED"],
      default: "ACTIVE",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

recordSchema.index({ userId: 1, status: 1 });
recordSchema.index({ userId: 1, personId: 1 });

const Record = mongoose.model("Record", recordSchema);

export default Record;
