import Transaction from "../models/Transaction.js";

import {
  calculateMonthlyInterest,
} from "../utils/interestCalculator.js";

import {
  addOneMonth,
} from "../utils/dateUtils.js";

import {
  createInterestDueNotification,
  createOverdueNotification,
} from "./notificationService.js";


export const generateDueInterest = async (
  record,
  asOfDate = new Date()
) => {
  // ==========================================
  // VALIDATION
  // ==========================================

  if (
    record.interestType !== "MONTHLY" ||
    record.interestRate <= 0 ||
    record.outstandingPrincipal <= 0
  ) {
    return {
      generated: 0,
      amount: 0,
    };
  }


  // ==========================================
  // GET NEXT INTEREST DATE
  // ==========================================

  let nextInterestDate =
    record.nextInterestDate;

  if (!nextInterestDate) {
    nextInterestDate =
      addOneMonth(
        record.startDate
      );
  }


  let generatedCount = 0;
  let generatedAmount = 0;


  // ==========================================
  // GENERATE DUE INTEREST
  // ==========================================

  while (
    nextInterestDate <= asOfDate &&
    record.outstandingPrincipal > 0
  ) {
    const interest =
      calculateMonthlyInterest(
        record.outstandingPrincipal,
        record.interestRate
      );

    if (interest <= 0) {
      break;
    }


    const interestPeriod =
      nextInterestDate
        .toISOString()
        .split("T")[0];


    // ========================================
    // PREVENT DUPLICATE INTEREST
    // ========================================

    const alreadyCharged =
      await Transaction.findOne({
        userId:
          record.userId,

        recordId:
          record._id,

        type:
          "INTEREST_CHARGE",

        interestPeriod,
      });


    if (!alreadyCharged) {

      // ======================================
      // CREATE INTEREST TRANSACTION
      // ======================================

      await Transaction.create({
        userId:
          record.userId,

        recordId:
          record._id,

        type:
          "INTEREST_CHARGE",

        principalAmount:
          0,

        interestAmount:
          interest,

        totalAmount:
          interest,

        transactionDate:
          nextInterestDate,

        interestPeriod,

        note:
          `Monthly interest for ${interestPeriod}`,
      });


      // ======================================
      // UPDATE OUTSTANDING INTEREST
      // ======================================

      record.outstandingInterest =
        Number(
          (
            record.outstandingInterest +
            interest
          ).toFixed(2)
        );


      record.lastInterestDate =
        new Date(
          nextInterestDate
        );


      if (
        !record.interestDueSince
      ) {
        record.interestDueSince =
          new Date(
            nextInterestDate
          );
      }


      generatedCount += 1;

      generatedAmount +=
        interest;


      // ======================================
      // CREATE INTEREST NOTIFICATION
      // ======================================

      try {
        const populatedRecord =
          await record.populate({
            path:
              "personId",

            select:
              "name",
          });


        await createInterestDueNotification({
          userId:
            record.userId,

          recordId:
            record._id,

          amount:
            interest,

          personName:
            populatedRecord
              .personId?.name,
        });

      } catch (
        notificationError
      ) {
        console.error(
          `[Interest Notification] Failed for record ${record._id}:`,
          notificationError.message
        );
      }
    }


    // ========================================
    // MOVE TO NEXT MONTH
    // ========================================

    nextInterestDate =
      addOneMonth(
        nextInterestDate
      );
  }


  // ==========================================
  // UPDATE NEXT INTEREST DATE
  // ==========================================

  record.nextInterestDate =
    nextInterestDate;


  // ==========================================
  // UPDATE STATUS
  // ==========================================

  if (
    record.outstandingPrincipal === 0 &&
    record.outstandingInterest === 0
  ) {
    record.status =
      "SETTLED";

  } else if (
    record.outstandingInterest > 0
  ) {
    record.status =
      "OVERDUE";

  } else {
    record.status =
      "ACTIVE";
  }


  // ==========================================
  // CREATE OVERDUE NOTIFICATION
  // ==========================================

  if (
    record.status === "OVERDUE" &&
    record.outstandingInterest > 0
  ) {
    try {
      const populatedRecord =
        await record.populate({
          path:
            "personId",

          select:
            "name",
        });


      const overdueAmount =
        Number(
          (
            record.outstandingPrincipal +
            record.outstandingInterest
          ).toFixed(2)
        );


      await createOverdueNotification({
        userId:
          record.userId,

        recordId:
          record._id,

        amount:
          overdueAmount,

        personName:
          populatedRecord
            .personId?.name,
      });

    } catch (
      notificationError
    ) {
      console.error(
        `[Overdue Notification] Failed for record ${record._id}:`,
        notificationError.message
      );
    }
  }


  // ==========================================
  // SAVE RECORD
  // ==========================================

  await record.save();


  // ==========================================
  // RETURN RESULT
  // ==========================================

  return {
    generated:
      generatedCount,

    amount:
      Number(
        generatedAmount.toFixed(2)
      ),
  };
};