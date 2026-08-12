import cron from "node-cron";
import Record from "../models/Record.js";

import {
  generateDueInterest,
} from "../services/interestService.js";

const runInterestGeneration = async () => {
  try {
    console.log(
      "[Interest Job] Checking for due interest..."
    );

    const records = await Record.find({
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
    });

    let totalGenerated = 0;
    let totalAmount = 0;

    for (const record of records) {
      try {
        const result =
          await generateDueInterest(
            record
          );

        totalGenerated +=
          result.generated;

        totalAmount +=
          result.amount;

        if (result.generated > 0) {
          console.log(
            `[Interest Job] Record ${record._id}: ` +
              `${result.generated} interest charge(s), ` +
              `₹${result.amount}`
          );
        }
      } catch (error) {
        console.error(
          `[Interest Job] Failed for record ${record._id}:`,
          error.message
        );
      }
    }

    console.log(
      `[Interest Job] Completed. ` +
        `Records checked: ${records.length}, ` +
        `Charges generated: ${totalGenerated}, ` +
        `Total interest: ₹${totalAmount.toFixed(2)}`
    );
  } catch (error) {
    console.error(
      "[Interest Job] Failed:",
      error
    );
  }
};


// ==========================================
// RUN EVERY DAY AT 00:05
// ==========================================

export const startInterestJob = () => {
  cron.schedule(
    "5 0 * * *",
    async () => {
      await runInterestGeneration();
    },
    {
      timezone:
        "Asia/Kolkata",
    }
  );

  console.log(
    "[Interest Job] Scheduler started."
  );
};