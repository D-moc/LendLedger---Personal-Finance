import Person from "../models/Person.js";
import Record from "../models/Record.js";
import Transaction from "../models/Transaction.js";

export const searchLedger = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const query =
      String(req.query.q || "").trim();

    if (!query) {
      return res.json({
        results: [],
      });
    }

    const regex =
      new RegExp(query, "i");

    // ========================================
    // PEOPLE
    // ========================================

    const people =
      await Person.find({
        userId,
        $or: [
          { name: regex },
          { phone: regex },
          { email: regex },
        ],
      })
        .select("name phone email")
        .limit(5)
        .lean();


    // ========================================
    // RECORDS
    // ========================================

    const records =
      await Record.find({
        userId,
      })
        .populate({
          path: "personId",
          select: "name phone",
        })
        .limit(20)
        .lean();


    const matchingRecords =
      records.filter((record) => {
        const personName =
          record.personId?.name || "";

        const direction =
          record.direction || "";

        const status =
          record.status || "";

        return (
          regex.test(personName) ||
          regex.test(direction) ||
          regex.test(status) ||
          String(
            record.originalPrincipal || ""
          ).includes(query)
        );
      });


    // ========================================
    // TRANSACTIONS
    // ========================================

    const transactions =
      await Transaction.find({
        userId,
      })
        .populate({
          path: "recordId",
          populate: {
            path: "personId",
            select: "name",
          },
        })
        .sort({
          transactionDate: -1,
        })
        .limit(30)
        .lean();


    const matchingTransactions =
      transactions.filter(
        (transaction) => {
          const personName =
            transaction.recordId
              ?.personId?.name || "";

          const type =
            transaction.type || "";

          const note =
            transaction.note || "";

          return (
            regex.test(personName) ||
            regex.test(type) ||
            regex.test(note) ||
            String(
              transaction.totalAmount || ""
            ).includes(query)
          );
        }
      );


    // ========================================
    // FORMAT RESULTS
    // ========================================

    const results = [

      ...people.map(
        (person) => ({
          id: person._id,

          type: "person",

          title:
            person.name,

          subtitle:
            person.phone ||
            person.email ||
            "Person",
        })
      ),

      ...matchingRecords.map(
        (record) => ({
          id: record._id,

          type: "record",

          title:
            record.personId?.name ||
            "Financial record",

          subtitle:
            `${record.direction} • ₹${Number(
              record.originalPrincipal || 0
            ).toLocaleString("en-IN")} • ${
              record.status
            }`,
        })
      ),

      ...matchingTransactions.map(
        (transaction) => ({
          id: transaction._id,

          type: "payment",

          title:
            transaction.recordId
              ?.personId?.name ||
            "Payment",

          subtitle:
            `${transaction.type} • ₹${Number(
              transaction.totalAmount || 0
            ).toLocaleString("en-IN")}`,
        })
      ),

    ];

    return res.status(200).json({
      results: results.slice(0, 15),
    });

  } catch (error) {
    console.error(
      "Ledger search error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to search ledger",
    });
  }
};