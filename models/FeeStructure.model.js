const mongoose = require("mongoose");

const feeStructureSchema = mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      unique: true,
    },
    monthlyFee: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NPR",
      enum: ["NPR"],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);

module.exports = FeeStructure;
