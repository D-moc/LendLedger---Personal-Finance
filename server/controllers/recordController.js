import Person from "../models/Person.js";
import Record from "../models/Record.js";
import Transaction from "../models/Transaction.js";

import {
  calculateMonthlyInterest,
} from "../utils/interestCalculator.js";

import {
  addOneMonth,
} from "../utils/dateUtils.js";

export const createRecord = async (req, res) => {
  try {
    const {
      personId,
      direction,
      originalPrincipal,
      interestRate = 0,
      interestType = "NONE",
      startDate,
      notes = "",
    } = req.body;

    const userId = req.user.userId;

    // Validation
    if (
      !personId ||
      !direction ||
      !originalPrincipal ||
      !startDate
    ) {
      return res.status(400).json({
        message:
          "Person, direction, amount and start date are required",
      });
    }

    if (!["GIVEN", "BORROWED"].includes(direction)) {
      return res.status(400).json({
        message: "Invalid record direction",
      });
    }

    if (!["NONE", "MONTHLY"].includes(interestType)) {
      return res.status(400).json({
        message: "Invalid interest type",
      });
    }

    // Make sure person belongs to current user
    const person = await Person.findOne({
      _id: personId,
      userId,
    });

    if (!person) {
      return res.status(404).json({
        message: "Person not found",
      });
    }

    const principal = Number(originalPrincipal);
    const rate = Number(interestRate);

    if (principal <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    if (rate < 0) {
      return res.status(400).json({
        message: "Interest rate cannot be negative",
      });
    }

    const parsedStartDate = new Date(startDate);

    let nextInterestDate = null;

    if (interestType === "MONTHLY") {
      nextInterestDate =
        addOneMonth(parsedStartDate);
    }

    const record = await Record.create({
      userId,
      personId,
      direction,
      originalPrincipal: principal,
      outstandingPrincipal: principal,
      interestRate: rate,
      interestType,
      outstandingInterest: 0,
      interestPaid: 0,
      principalPaid: 0,
      startDate: parsedStartDate,
      nextInterestDate,
      status: "ACTIVE",
      notes,
    });

    // Initial transaction
    await Transaction.create({
      userId,
      recordId: record._id,
      type: "INITIAL",
      principalAmount: principal,
      interestAmount: 0,
      totalAmount: principal,
      transactionDate: parsedStartDate,
      note:
        direction === "GIVEN"
          ? "Initial money given"
          : "Initial money borrowed",
    });

    const populatedRecord =
      await Record.findById(record._id)
        .populate("personId", "name phone");

    res.status(201).json({
      message: "Financial record created successfully",
      record: populatedRecord,
    });
  } catch (error) {
    console.error("Create record error:", error);

    res.status(500).json({
      message: "Server error while creating record",
    });
  }
};

export const getRecords = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      direction,
      status,
      personId,
    } = req.query;

    const filter = {
      userId,
    };

    if (
      direction &&
      ["GIVEN", "BORROWED"].includes(direction)
    ) {
      filter.direction = direction;
    }

    if (
      status &&
      [
        "ACTIVE",
        "DUE_SOON",
        "OVERDUE",
        "PARTIALLY_PAID",
        "SETTLED",
      ].includes(status)
    ) {
      filter.status = status;
    }

    if (personId) {
      filter.personId = personId;
    }

    const records = await Record.find(filter)
      .populate(
        "personId",
        "name phone"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      records,
    });
  } catch (error) {
    console.error("Get records error:", error);

    res.status(500).json({
      message: "Server error while fetching records",
    });
  }
};

export const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.userId;

    const record = await Record.findOne({
      _id: id,
      userId,
    }).populate(
      "personId",
      "name phone"
    );

    if (!record) {
      return res.status(404).json({
        message: "Financial record not found",
      });
    }

    res.json({
      record,
    });
  } catch (error) {
    console.error("Get record error:", error);

    res.status(500).json({
      message: "Server error while fetching record",
    });
  }
};

export const getRecordSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.userId;

    const record = await Record.findOne({
      _id: id,
      userId,
    }).populate(
      "personId",
      "name phone"
    );

    if (!record) {
      return res.status(404).json({
        message: "Financial record not found",
      });
    }

    const totalOutstanding =
      Number(
        (
          record.outstandingPrincipal +
          record.outstandingInterest
        ).toFixed(2)
      );

    res.json({
      summary: {
        recordId: record._id,
        person: record.personId,
        direction: record.direction,

        originalPrincipal:
          record.originalPrincipal,

        principalPaid:
          record.principalPaid,

        outstandingPrincipal:
          record.outstandingPrincipal,

        interestPaid:
          record.interestPaid,

        outstandingInterest:
          record.outstandingInterest,

        totalOutstanding,

        interestRate:
          record.interestRate,

        interestType:
          record.interestType,

        status:
          record.status,

        startDate:
          record.startDate,

        nextInterestDate:
          record.nextInterestDate,
      },
    });
  } catch (error) {
    console.error(
      "Record summary error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while creating summary",
    });
  }
};

export const settleRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.userId;

    const record = await Record.findOne({
      _id: id,
      userId,
    });

    if (!record) {
      return res.status(404).json({
        message: "Financial record not found",
      });
    }

    if (
      record.outstandingPrincipal > 0 ||
      record.outstandingInterest > 0
    ) {
      return res.status(400).json({
        message:
          "Record cannot be settled while an outstanding balance exists",
      });
    }

    record.status = "SETTLED";

    await record.save();

    res.json({
      message: "Record settled successfully",
      record,
    });
  } catch (error) {
    console.error("Settle record error:", error);

    res.status(500).json({
      message: "Server error while settling record",
    });
  }
};