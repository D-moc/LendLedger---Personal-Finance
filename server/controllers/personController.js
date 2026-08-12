import Person from "../models/Person.js";
import Record from "../models/Record.js";

// =========================================================
// CREATE PERSON
// =========================================================

export const createPerson = async (req, res) => {
  try {
    const {
      name,
      phone = "",
      notes = "",
    } = req.body;

    const userId = req.user.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Person name is required",
      });
    }

    const person = await Person.create({
      userId,
      name: name.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      isArchived: false,
    });

    res.status(201).json({
      message: "Person created successfully",
      person,
    });
  } catch (error) {
    console.error("Create person error:", error);

    res.status(500).json({
      message: "Server error while creating person",
    });
  }
};

// =========================================================
// GET PEOPLE
// =========================================================

export const getPeople = async (req, res) => {
  try {
    const userId = req.user.userId;

    const archived =
      req.query.archived === "true";

    const people = await Person.find({
      userId,
      isArchived: archived,
    }).sort({
      name: 1,
    });

    res.json({
      people,
    });
  } catch (error) {
    console.error("Get people error:", error);

    res.status(500).json({
      message: "Server error while fetching people",
    });
  }
};

// =========================================================
// GET PERSON BY ID
// =========================================================

export const getPersonById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const person = await Person.findOne({
      _id: id,
      userId,
    });

    if (!person) {
      return res.status(404).json({
        message: "Person not found",
      });
    }

    res.json({
      person,
    });
  } catch (error) {
    console.error("Get person error:", error);

    res.status(500).json({
      message: "Server error while fetching person",
    });
  }
};

// =========================================================
// UPDATE PERSON
// =========================================================

export const updatePerson = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      notes,
    } = req.body;

    const userId = req.user.userId;

    const person = await Person.findOne({
      _id: id,
      userId,
    });

    if (!person) {
      return res.status(404).json({
        message: "Person not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      person.name = name.trim();
    }

    if (phone !== undefined) {
      person.phone = phone.trim();
    }

    if (notes !== undefined) {
      person.notes = notes.trim();
    }

    await person.save();

    res.json({
      message: "Person updated successfully",
      person,
    });
  } catch (error) {
    console.error("Update person error:", error);

    res.status(500).json({
      message: "Server error while updating person",
    });
  }
};

// =========================================================
// ARCHIVE PERSON
// =========================================================

export const archivePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const person = await Person.findOne({
      _id: id,
      userId,
    });

    if (!person) {
      return res.status(404).json({
        message: "Person not found",
      });
    }

    if (person.isArchived) {
      return res.status(400).json({
        message: "Person is already archived",
      });
    }

    person.isArchived = true;

    await person.save();

    res.json({
      message: "Person archived successfully",
      person,
    });
  } catch (error) {
    console.error("Archive person error:", error);

    res.status(500).json({
      message: "Server error while archiving person",
    });
  }
};

// =========================================================
// RESTORE PERSON
// =========================================================

export const restorePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const person = await Person.findOne({
      _id: id,
      userId,
    });

    if (!person) {
      return res.status(404).json({
        message: "Person not found",
      });
    }

    if (!person.isArchived) {
      return res.status(400).json({
        message: "Person is already active",
      });
    }

    person.isArchived = false;

    await person.save();

    res.json({
      message: "Person restored successfully",
      person,
    });
  } catch (error) {
    console.error("Restore person error:", error);

    res.status(500).json({
      message: "Server error while restoring person",
    });
  }
};

// =========================================================
// GET PERSON SUMMARY
// =========================================================

export const getPersonSummary = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const person = await Person.findOne({
      _id: id,
      userId,
    });

    if (!person) {
      return res.status(404).json({
        message: "Person not found",
      });
    }

    const records = await Record.find({
      userId,
      personId: id,
    });

    let totalGiven = 0;
    let totalBorrowed = 0;

    let outstandingPrincipal = 0;
    let outstandingInterest = 0;

    for (const record of records) {
      if (record.direction === "GIVEN") {
        totalGiven +=
          record.originalPrincipal || 0;
      }

      if (record.direction === "BORROWED") {
        totalBorrowed +=
          record.originalPrincipal || 0;
      }

      outstandingPrincipal +=
        record.outstandingPrincipal || 0;

      outstandingInterest +=
        record.outstandingInterest || 0;
    }

    res.json({
      person,

      summary: {
        totalGiven:
          Number(totalGiven.toFixed(2)),

        totalBorrowed:
          Number(totalBorrowed.toFixed(2)),

        outstandingPrincipal:
          Number(
            outstandingPrincipal.toFixed(2)
          ),

        outstandingInterest:
          Number(
            outstandingInterest.toFixed(2)
          ),

        totalOutstanding:
          Number(
            (
              outstandingPrincipal +
              outstandingInterest
            ).toFixed(2)
          ),

        recordCount: records.length,
      },
    });
  } catch (error) {
    console.error(
      "Person summary error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while generating person summary",
    });
  }
};