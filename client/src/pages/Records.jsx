import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import RecordCard from "../components/records/RecordCard";

import api from "../services/api";

const Records = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const direction =
    location.pathname === "/given"
      ? "GIVEN"
      : location.pathname === "/borrowed"
        ? "BORROWED"
        : "ALL";

  // =========================================================
  // FETCH RECORDS
  // =========================================================

  const fetchRecords = async () => {
    try {
      setError("");

      const params = {};

      if (direction !== "ALL") {
        params.direction = direction;
      }

      if (status !== "ALL") {
        params.status = status;
      }

      const response = await api.get("/records", {
        params,
      });

      setRecords(response.data.records || []);
    } catch (error) {
      console.error("Records fetch error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRecords();
  }, [location.pathname, status]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter((record) =>
      record.personId?.name
        ?.toLowerCase()
        .includes(query)
    );
  }, [records, search]);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  // =========================================================
  // DIRECTION
  // =========================================================

  const handleDirectionChange = (value) => {
    if (value === "GIVEN") {
      navigate("/given");
    } else if (value === "BORROWED") {
      navigate("/borrowed");
    } else {
      navigate("/records");
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="
          mb-7
          flex
          flex-col
          gap-5
          md:flex-row
          md:items-center
          md:justify-between
        ">

          <div>

            <div className="
              mb-2
              flex
              items-center
              gap-2
            ">
              <div className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-violet-50
                text-violet-600
              ">
                <FileText size={14} />
              </div>

              <span className="
                font-mono
                text-[9px]
                font-medium
                uppercase
                tracking-[0.25em]
                text-violet-600
              ">
                Financial ledger
              </span>
            </div>

            <h1 className="
              font-display
              text-3xl
              font-semibold
              tracking-tight
              text-slate-900
              sm:text-4xl
            ">
              {direction === "GIVEN"
                ? "Money given"
                : direction === "BORROWED"
                  ? "Money borrowed"
                  : "Records"}
            </h1>

            <p className="
              mt-2
              max-w-xl
              text-sm
              text-slate-500
            ">
              {direction === "GIVEN"
                ? "Track money you have given to others."
                : direction === "BORROWED"
                  ? "Track money you have borrowed from others."
                  : "Every financial agreement, organized in one place."}
            </p>

          </div>


          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-medium
              text-slate-500
              shadow-sm
              shadow-slate-200/30
              transition
              hover:border-slate-300
              hover:bg-slate-50
              hover:text-slate-800
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </section>


        {/* ===================================================
            TYPE TABS
        =================================================== */}

        <div className="
          mb-5
          flex
          flex-wrap
          gap-2
        ">

          <TypeTab
            active={direction === "ALL"}
            onClick={() =>
              handleDirectionChange("ALL")
            }
            icon={FileText}
            label="All records"
          />

          <TypeTab
            active={direction === "GIVEN"}
            onClick={() =>
              handleDirectionChange("GIVEN")
            }
            icon={ArrowUpRight}
            label="Money given"
            activeClass="
              border-emerald-200
              bg-emerald-50
              text-emerald-600
            "
          />

          <TypeTab
            active={direction === "BORROWED"}
            onClick={() =>
              handleDirectionChange("BORROWED")
            }
            icon={ArrowDownLeft}
            label="Money borrowed"
            activeClass="
              border-orange-200
              bg-orange-50
              text-orange-600
            "
          />

        </div>


        {/* ===================================================
            FILTER BAR
        =================================================== */}

        <section className="
          mb-6
          flex
          flex-col
          gap-3
          sm:flex-row
        ">

          {/* SEARCH */}

          <div className="
            relative
            flex-1
          ">

            <Search
              size={15}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by person name..."
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                py-3
                pl-11
                pr-4
                text-sm
                text-slate-800
                outline-none
                shadow-sm
                shadow-slate-200/20
                transition
                placeholder:text-slate-400
                focus:border-violet-300
                focus:ring-4
                focus:ring-violet-500/5
              "
            />

          </div>


          {/* STATUS */}

          <div className="
            relative
            sm:w-52
          ">

            <SlidersHorizontal
              size={14}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="
                w-full
                appearance-none
                rounded-xl
                border
                border-slate-200
                bg-white
                py-3
                pl-10
                pr-10
                text-xs
                font-medium
                text-slate-600
                outline-none
                shadow-sm
                shadow-slate-200/20
                transition
                focus:border-violet-300
                focus:ring-4
                focus:ring-violet-500/5
              "
            >
              <option value="ALL">
                All statuses
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="PARTIALLY_PAID">
                Partially paid
              </option>

              <option value="DUE_SOON">
                Due soon
              </option>

              <option value="OVERDUE">
                Overdue
              </option>

              <option value="SETTLED">
                Settled
              </option>
            </select>

          </div>


          {/* COUNT */}

          <div className="
            flex
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            shadow-sm
            shadow-slate-200/20
          ">

            <span className="
              whitespace-nowrap
              font-mono
              text-[9px]
              font-medium
              uppercase
              tracking-wider
              text-slate-400
            ">
              {filteredRecords.length}{" "}
              {filteredRecords.length === 1
                ? "record"
                : "records"}
            </span>

          </div>

        </section>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="
            mb-6
            rounded-xl
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-600
          ">
            {error}
          </div>
        )}


        {/* ===================================================
            RECORDS
        =================================================== */}

        {loading ? (

          <div className="space-y-3">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  h-52
                  animate-pulse
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                "
              />
            ))}

          </div>

        ) : filteredRecords.length === 0 ? (

          <EmptyRecords
            direction={direction}
            searching={Boolean(search.trim())}
          />

        ) : (

          <div className="space-y-3">

            {filteredRecords.map((record) => (
              <RecordCard
                key={record._id}
                record={record}
                onClick={() =>
                  navigate(
                    `/records/${record._id}`
                  )
                }
              />
            ))}

          </div>

        )}

      </div>
    </DashboardLayout>
  );
};


// =========================================================
// TYPE TAB
// =========================================================

const TypeTab = ({
  active,
  onClick,
  icon: Icon,
  label,
  activeClass = `
    border-violet-200
    bg-violet-50
    text-violet-600
  `,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        items-center
        gap-2
        rounded-xl
        border
        px-4
        py-2.5
        text-xs
        font-medium
        transition
        ${
          active
            ? activeClass
            : `
              border-slate-200
              bg-white
              text-slate-500
              shadow-sm
              shadow-slate-200/20
              hover:border-slate-300
              hover:bg-slate-50
              hover:text-slate-800
            `
        }
      `}
    >
      <Icon size={14} />
      {label}
    </button>
  );
};


// =========================================================
// EMPTY RECORDS
// =========================================================

const EmptyRecords = ({
  direction,
  searching,
}) => {
  let title = "No records found";

  let description =
    "Your financial records will appear here.";

  if (searching) {
    title = "No matching records";
    description =
      "Try searching with a different person name.";
  } else if (direction === "GIVEN") {
    title = "No money given records";
    description =
      "Records where you gave money will appear here.";
  } else if (direction === "BORROWED") {
    title = "No money borrowed records";
    description =
      "Records where you borrowed money will appear here.";
  }

  return (
    <div className="
      flex
      min-h-[380px]
      flex-col
      items-center
      justify-center
      rounded-2xl
      border
      border-dashed
      border-slate-200
      bg-white
      px-6
      text-center
    ">

      <div className="
        mb-5
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-2xl
        bg-violet-50
        text-violet-500
      ">
        <FileText size={22} />
      </div>

      <h2 className="
        font-display
        text-lg
        font-semibold
        text-slate-800
      ">
        {title}
      </h2>

      <p className="
        mt-2
        max-w-sm
        text-xs
        leading-5
        text-slate-400
      ">
        {description}
      </p>

    </div>
  );
};

export default Records;