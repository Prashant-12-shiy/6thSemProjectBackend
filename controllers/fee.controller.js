const crypto = require("crypto");
const https = require("https");
const FeeStructure = require("../models/FeeStructure.model");
const FeePayment = require("../models/FeePayment.model");
const Student = require("../models/Student.model");
const Class = require("../models/Class.model");

const SIGNED_FIELD_NAMES = "total_amount,transaction_uuid,product_code";
const SANDBOX_PRODUCT_CODE = "EPAYTEST";

const getEsewaConfig = () => ({
  paymentUrl:
    process.env.ESEWA_PAYMENT_URL ||
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  statusUrl:
    process.env.ESEWA_STATUS_URL ||
    "https://uat.esewa.com.np/api/epay/transaction/status/",
  productCode: process.env.ESEWA_PRODUCT_CODE || SANDBOX_PRODUCT_CODE,
  secretKey: process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q",
});

const formatAmount = (amount) => {
  const numericAmount = Number(amount);
  return Number.isInteger(numericAmount)
    ? numericAmount.toString()
    : numericAmount.toFixed(2);
};

const normalizeAmount = (amount) =>
  Number(String(amount || "0").replace(/,/g, ""));

const buildSignatureMessage = (payload, signedFieldNames) =>
  signedFieldNames
    .split(",")
    .map((fieldName) => `${fieldName}=${payload[fieldName] ?? ""}`)
    .join(",");

const createEsewaSignature = (payload, signedFieldNames = SIGNED_FIELD_NAMES) =>
  crypto
    .createHmac("sha256", getEsewaConfig().secretKey)
    .update(buildSignatureMessage(payload, signedFieldNames))
    .digest("base64");

const decodeEsewaData = (encodedData) => {
  const decodedText = Buffer.from(encodedData, "base64").toString("utf8");
  return JSON.parse(decodedText);
};

const getFrontendUrl = (req) => {
  const configuredUrl = process.env.FRONTEND_URL;
  const requestOrigin = req.headers.origin;
  return (configuredUrl || requestOrigin || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
};

const checkEsewaStatus = ({ productCode, totalAmount, transactionUuid }) =>
  new Promise((resolve, reject) => {
    const { statusUrl } = getEsewaConfig();
    const statusCheckUrl = new URL(statusUrl);
    statusCheckUrl.searchParams.set("product_code", productCode);
    statusCheckUrl.searchParams.set("total_amount", totalAmount);
    statusCheckUrl.searchParams.set("transaction_uuid", transactionUuid);

    const request = https.get(statusCheckUrl, (response) => {
      let body = "";

      response.on("data", (chunk) => {
        body += chunk;
      });

      response.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    request.setTimeout(10000, () => {
      request.destroy(new Error("eSewa status check timed out"));
    });

    request.on("error", reject);
  });

exports.getFeeStructures = async (req, res) => {
  try {
    const classes = await Class.find({})
      .populate("teacherInCharge", "name")
      .lean();
    const feeStructures = await FeeStructure.find({
      class: { $in: classes.map((classDoc) => classDoc._id) },
    }).lean();
    const feeStructureByClass = new Map(
      feeStructures.map((feeStructure) => [
        feeStructure.class.toString(),
        feeStructure,
      ])
    );

    const response = classes.map((classDoc) => {
      const feeStructure = feeStructureByClass.get(classDoc._id.toString());

      return {
        _id: feeStructure?._id,
        classId: classDoc._id,
        className: classDoc.name,
        section: classDoc.section,
        teacherInCharge: classDoc.teacherInCharge,
        studentsCount: classDoc.students?.length || 0,
        monthlyFee: feeStructure?.monthlyFee || 0,
        currency: feeStructure?.currency || "NPR",
        updatedAt: feeStructure?.updatedAt,
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching fee structures",
      error: error.message || error,
    });
  }
};

exports.setFeeStructure = async (req, res) => {
  try {
    const { classId, monthlyFee } = req.body;
    const parsedFee = Number(monthlyFee);

    if (!classId) {
      return res.status(400).json({ message: "Class is required" });
    }

    if (!Number.isFinite(parsedFee) || parsedFee < 0) {
      return res
        .status(400)
        .json({ message: "Monthly fee must be a valid Nepali Rupees amount" });
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    const feeStructure = await FeeStructure.findOneAndUpdate(
      { class: classId },
      {
        monthlyFee: parsedFee,
        currency: "NPR",
        updatedBy: req.user._id,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate("class", "name section");

    return res.status(200).json({
      message: "Monthly fee updated successfully",
      feeStructure,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating monthly fee",
      error: error.message || error,
    });
  }
};

exports.getFeePayments = async (req, res) => {
  try {
    const filter = {};

    if (req.query.classId) {
      filter.class = req.query.classId;
    }

    const payments = await FeePayment.find(filter)
      .populate("student", "name rollNumber email")
      .populate("class", "name")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching fee payments",
      error: error.message || error,
    });
  }
};

exports.getMyFeeSummary = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };

    const student = await Student.findById(req.user._id)
      .populate("class", "name section")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feeStructure = await FeeStructure.findOne({
      class: student.class._id,
    }).lean();
    const payments = await FeePayment.find({ student: student._id })
      .sort({ year: -1, month: -1, createdAt: -1 })
      .lean();
    const currentPayments = payments.filter(
      (payment) =>
        payment.month === currentMonth.month &&
        payment.year === currentMonth.year
    );
    const currentPayment =
      currentPayments.find((payment) => payment.status === "COMPLETE") ||
      currentPayments[0];

    return res.status(200).json({
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
      },
      class: student.class,
      currentMonth,
      feeStructureId: feeStructure?._id,
      monthlyFee: feeStructure?.monthlyFee || 0,
      currency: feeStructure?.currency || "NPR",
      currentPaymentStatus: currentPayment?.status || "UNPAID",
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching fee summary",
      error: error.message || error,
    });
  }
};

exports.initiateEsewaPayment = async (req, res) => {
  try {
    const month = Number(req.body.month);
    const year = Number(req.body.year);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Valid month is required" });
    }

    if (!Number.isInteger(year) || year < 2000) {
      return res.status(400).json({ message: "Valid year is required" });
    }

    const student = await Student.findById(req.user._id).populate(
      "class",
      "name"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feeStructure = await FeeStructure.findOne({ class: student.class._id });
    if (!feeStructure || feeStructure.monthlyFee <= 0) {
      return res
        .status(404)
        .json({ message: "Monthly fee is not set for your class yet" });
    }

    const paidPayment = await FeePayment.findOne({
      student: student._id,
      month,
      year,
      status: "COMPLETE",
    });

    if (paidPayment) {
      return res
        .status(400)
        .json({ message: "This monthly fee has already been paid" });
    }

    const { paymentUrl, productCode } = getEsewaConfig();
    const amount = formatAmount(feeStructure.monthlyFee);
    const transactionUuid = `FEE-${student._id.toString()}-${year}-${String(
      month
    ).padStart(2, "0")}-${Date.now()}`;
    const frontendUrl = getFrontendUrl(req);

    const formData = {
      amount,
      tax_amount: "0",
      total_amount: amount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${frontendUrl}/students/fees/esewa/success`,
      failure_url: `${frontendUrl}/students/fees/esewa/failure?transaction_uuid=${transactionUuid}`,
      signed_field_names: SIGNED_FIELD_NAMES,
    };

    formData.signature = createEsewaSignature(
      formData,
      formData.signed_field_names
    );

    const payment = await FeePayment.create({
      student: student._id,
      class: student.class._id,
      feeStructure: feeStructure._id,
      month,
      year,
      amount: feeStructure.monthlyFee,
      currency: "NPR",
      status: "INITIATED",
      productCode,
      transactionUuid,
      signature: formData.signature,
    });

    return res.status(201).json({
      actionUrl: paymentUrl,
      formData,
      payment: {
        _id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        month: payment.month,
        year: payment.year,
        transactionUuid: payment.transactionUuid,
        status: payment.status,
      },
      testCredentials: {
        eSewaIds: [
          "9806800001",
          "9806800002",
          "9806800003",
          "9806800004",
          "9806800005",
        ],
        password: "Nepal@123",
        token: "123456",
        productCode,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error initiating eSewa payment",
      error: error.message || error,
    });
  }
};

exports.confirmEsewaPayment = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ message: "eSewa response data is missing" });
    }

    const decodedData = decodeEsewaData(data);
    const expectedSignature = createEsewaSignature(
      decodedData,
      decodedData.signed_field_names
    );

    if (expectedSignature !== decodedData.signature) {
      return res.status(400).json({ message: "Invalid eSewa signature" });
    }

    const { productCode } = getEsewaConfig();
    if (decodedData.product_code !== productCode) {
      return res.status(400).json({ message: "Invalid eSewa product code" });
    }

    const payment = await FeePayment.findOne({
      transactionUuid: decodedData.transaction_uuid,
      student: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Fee payment not found" });
    }

    const paidAmount = normalizeAmount(decodedData.total_amount);
    if (Math.abs(paidAmount - payment.amount) > 0.01) {
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    let statusCheck = null;
    let statusCheckError = null;

    try {
      statusCheck = await checkEsewaStatus({
        productCode,
        totalAmount: formatAmount(payment.amount),
        transactionUuid: payment.transactionUuid,
      });
    } catch (error) {
      statusCheckError = error.message || "Unable to verify status with eSewa";
    }

    const decodedStatus = String(decodedData.status || "").toUpperCase();
    const checkedStatus = String(statusCheck?.status || "").toUpperCase();
    const isSandbox = productCode === SANDBOX_PRODUCT_CODE;
    const isComplete =
      decodedStatus === "COMPLETE" &&
      (checkedStatus === "COMPLETE" || (!checkedStatus && isSandbox));

    payment.status = isComplete
      ? "COMPLETE"
      : checkedStatus || decodedStatus || "PENDING";
    payment.transactionCode =
      decodedData.transaction_code ||
      statusCheck?.ref_id ||
      statusCheck?.refId ||
      payment.transactionCode;
    payment.esewaResponse = {
      decodedData,
      statusCheck,
      statusCheckError,
    };

    if (payment.status === "COMPLETE" && !payment.paidAt) {
      payment.paidAt = new Date();
    }

    await payment.save();

    return res.status(200).json({
      message:
        payment.status === "COMPLETE"
          ? "Fee payment completed successfully"
          : "Fee payment is not complete",
      payment,
      verification: {
        decodedStatus,
        checkedStatus,
        statusCheckError,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error confirming eSewa payment",
      error: error.message || error,
    });
  }
};

exports.markEsewaPaymentFailed = async (req, res) => {
  try {
    const { transaction_uuid: transactionUuid } = req.body;

    if (!transactionUuid) {
      return res.status(200).json({ message: "Payment was cancelled" });
    }

    const payment = await FeePayment.findOne({
      transactionUuid,
      student: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Fee payment not found" });
    }

    if (payment.status !== "COMPLETE") {
      payment.status = "FAILED";
      await payment.save();
    }

    return res.status(200).json({
      message: "Payment was not completed",
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating failed payment",
      error: error.message || error,
    });
  }
};
