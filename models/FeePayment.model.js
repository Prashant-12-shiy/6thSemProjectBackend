const mongoose = require("mongoose");

const feePaymentSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NPR",
      enum: ["NPR"],
    },
    paymentMethod: {
      type: String,
      default: "eSewa",
      enum: ["eSewa"],
    },
    status: {
      type: String,
      enum: [
        "INITIATED",
        "PENDING",
        "COMPLETE",
        "FAILED",
        "CANCELED",
        "NOT_FOUND",
        "AMBIGUOUS",
        "FULL_REFUND",
        "PARTIAL_REFUND",
      ],
      default: "INITIATED",
    },
    productCode: {
      type: String,
      default: "EPAYTEST",
    },
    transactionUuid: {
      type: String,
      required: true,
      unique: true,
    },
    transactionCode: {
      type: String,
    },
    signature: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    esewaResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

feePaymentSchema.index({ student: 1, month: 1, year: 1 });
feePaymentSchema.index({ class: 1, createdAt: -1 });

const FeePayment = mongoose.model("FeePayment", feePaymentSchema);

module.exports = FeePayment;
