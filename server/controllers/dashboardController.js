import Record from "../models/Record.js";

export const getDashboardSummary = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const records = await Record.find({
      userId,
    });

    let totalGiven = 0;
    let totalBorrowed = 0;

    let outstandingGiven = 0;
    let outstandingBorrowed = 0;

    let interestDue = 0;

    let activeRecords = 0;
    let overdueRecords = 0;
    let settledRecords = 0;

    for (const record of records) {
      if (record.direction === "GIVEN") {
        totalGiven += record.originalPrincipal;

        outstandingGiven +=
          record.outstandingPrincipal;
      }

      if (record.direction === "BORROWED") {
        totalBorrowed +=
          record.originalPrincipal;

        outstandingBorrowed +=
          record.outstandingPrincipal;
      }

      interestDue +=
        record.outstandingInterest;

      if (record.status !== "SETTLED") {
        activeRecords += 1;
      }

      if (record.status === "OVERDUE") {
        overdueRecords += 1;
      }

      if (record.status === "SETTLED") {
        settledRecords += 1;
      }
    }

    const totalOutstanding =
      outstandingGiven +
      outstandingBorrowed +
      interestDue;

    const netPosition =
      outstandingGiven -
      outstandingBorrowed;

    res.json({
      summary: {
        totalGiven:
          Number(totalGiven.toFixed(2)),

        totalBorrowed:
          Number(totalBorrowed.toFixed(2)),

        outstandingGiven:
          Number(
            outstandingGiven.toFixed(2)
          ),

        outstandingBorrowed:
          Number(
            outstandingBorrowed.toFixed(2)
          ),

        interestDue:
          Number(interestDue.toFixed(2)),

        totalOutstanding:
          Number(
            totalOutstanding.toFixed(2)
          ),

        netPosition:
          Number(netPosition.toFixed(2)),

        activeRecords,

        overdueRecords,

        settledRecords,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while generating dashboard summary",
    });
  }
};