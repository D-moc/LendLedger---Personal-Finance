import Record from "../models/Record.js";

import {
  generateDueInterest,
} from "../services/interestService.js";


// ==========================================
// GENERATE INTEREST FOR ONE RECORD
// ==========================================

export const generateInterestForRecord = async (
  req,
  res
) => {
  try {
    const { recordId } = req.params;

    const userId = req.user._id;

    const record = await Record.findOne({
      _id: recordId,
      userId,
    });

    if (!record) {
      return res.status(404).json({
        message:
          "Financial record not found",
      });
    }

    const result =
      await generateDueInterest(record);

    const updatedRecord =
      await Record.findById(
        record._id
      ).populate(
        "personId",
        "name phone"
      );

    res.status(200).json({
      message:
        "Interest calculation completed",

      generated:
        result.generated,

      amount:
        result.amount,

      record:
        updatedRecord,
    });
  } catch (error) {
    console.error(
      "Generate interest error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while generating interest",
    });
  }
};


// ==========================================
// GENERATE INTEREST FOR ALL USER RECORDS
// ==========================================

export const generateAllDueInterest = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    // Find all records that can generate
    // monthly interest.
    const records = await Record.find({
      userId,

      interestType: "MONTHLY",

      interestRate: {
        $gt: 0,
      },

      outstandingPrincipal: {
        $gt: 0,
      },

      status: {
        $in: [
          "ACTIVE",
          "DUE_SOON",
          "OVERDUE",
          "PARTIALLY_PAID",
        ],
      },
    }).populate(
      "personId",
      "name phone"
    );

    let totalGenerated = 0;
    let totalAmount = 0;

    const results = [];

    // Process each record one by one.
    for (const record of records) {
      const result =
        await generateDueInterest(
          record
        );

      totalGenerated +=
        result.generated;

      totalAmount +=
        result.amount;

      results.push({
        recordId: record._id,

        person:
          record.personId?.name ||
          "Unknown",

        generated:
          result.generated,

        amount:
          result.amount,
      });
    }

    res.status(200).json({
      message:
        "Interest calculation completed",

      recordsChecked:
        records.length,

      totalGenerated,

      totalAmount:
        Number(
          totalAmount.toFixed(2)
        ),

      results,
    });
  } catch (error) {
    console.error(
      "Generate all interest error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while generating interest",
    });
  }
};