import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
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

    paymentDate: {
      type: Date,
      required: true,
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

paymentSchema.virtual("totalAmount").get(function () {
  return (
    this.principalAmount +
    this.interestAmount
  );
});

const Payment = mongoose.model(
  "Payment",
  paymentSchema
);

export default Payment;