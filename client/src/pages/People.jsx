import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Search,
  Users,
  RefreshCw,
  Archive,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import PersonCard from "../components/people/PersonCard";
import AddPersonModal from "../components/people/AddPersonModal";
import EditPersonModal from "../components/people/EditPersonModal";

import api from "../services/api";

const People = () => {
  const navigate = useNavigate();

  const [people, setPeople] = useState([]);
  const [summaries, setSummaries] = useState({});

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("ACTIVE");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editPerson, setEditPerson] = useState(null);

  // =========================================================
  // FETCH PEOPLE
  // =========================================================

  const fetchPeople = async () => {
    try {
      setError("");

      const response = await api.get("/people", {
        params: {
          archived: viewMode === "ARCHIVED",
        },
      });

      const fetchedPeople =
        response.data.people || [];

      setPeople(fetchedPeople);

      // Fetch summaries
      const summaryEntries =
        await Promise.all(
          fetchedPeople.map(async (person) => {
            try {
              const summaryResponse =
                await api.get(
                  `/people/${person._id}/summary`
                );

              return [
                person._id,
                summaryResponse.data.summary,
              ];
            } catch {
              return [
                person._id,
                null,
              ];
            }
          })
        );

      setSummaries(
        Object.fromEntries(summaryEntries)
      );
    } catch (error) {
      console.error(
        "People fetch error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load people."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // VIEW CHANGE
  // =========================================================

  useEffect(() => {
    setLoading(true);
    setSearch("");
    fetchPeople();
  }, [viewMode]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredPeople = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return people;
    }

    return people.filter((person) =>
      person.name
        ?.toLowerCase()
        .includes(query)
    );
  }, [people, search]);

  // =========================================================
  // ADD PERSON
  // =========================================================

  const handleAddPerson = async (data) => {
    await api.post("/people", data);

    setAddOpen(false);

    await fetchPeople();
  };

  // =========================================================
  // UPDATE PERSON
  // =========================================================

  const handleUpdatePerson = async (
    id,
    data
  ) => {
    await api.put(
      `/people/${id}`,
      data
    );

    setEditPerson(null);

    await fetchPeople();
  };

  // =========================================================
  // ARCHIVE PERSON
  // =========================================================

  const handleArchivePerson = async (
    person
  ) => {
    const confirmed =
      window.confirm(
        `Archive ${person.name}?\n\nTheir financial records and history will be preserved.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/people/${person._id}`
      );

      await fetchPeople();
    } catch (error) {
      console.error(
        "Archive person error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to archive person."
      );
    }
  };

  // =========================================================
  // RESTORE PERSON
  // =========================================================

  const handleRestorePerson = async (
    person
  ) => {
    try {
      setError("");

      await api.patch(
        `/people/${person._id}/restore`
      );

      await fetchPeople();
    } catch (error) {
      console.error(
        "Restore person error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to restore person."
      );
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPeople();
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <section className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Users
                size={15}
                className="text-violet-600"
              />

              <span className="font-mono text-[9px] font-medium uppercase tracking-[0.3em] text-violet-600">
                Your network
              </span>
            </div>

            <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-4xl">
              People
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Everyone connected to your
              financial records.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border border-slate-200
                bg-white
                px-4 py-2.5
                text-xs font-medium
                text-slate-500
                shadow-sm
                transition
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-800
                disabled:cursor-not-allowed
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

            {viewMode === "ACTIVE" && (
              <button
                type="button"
                onClick={() =>
                  setAddOpen(true)
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-violet-600
                  px-4 py-2.5
                  text-xs
                  font-semibold
                  text-white
                  shadow-sm
                  shadow-violet-200
                  transition
                  hover:bg-violet-700
                  active:scale-[0.98]
                "
              >
                <Plus size={15} />
                Add person
              </button>
            )}
          </div>
        </section>

        {/* TABS */}

        <div className="mb-5 flex items-center gap-2 border-b border-slate-200">

          {/* ACTIVE */}

          <button
            type="button"
            onClick={() => {
              setViewMode("ACTIVE");
              setSearch("");
            }}
            className={`
              -mb-px
              flex
              items-center
              gap-2
              border-b-2
              px-4
              py-3
              text-xs
              font-semibold
              transition
              ${
                viewMode === "ACTIVE"
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }
            `}
          >
            <Users size={14} />

            Active

            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] text-slate-500">
              {viewMode === "ACTIVE"
                ? people.length
                : "—"}
            </span>
          </button>

          {/* ARCHIVED */}

          <button
            type="button"
            onClick={() => {
              setViewMode("ARCHIVED");
              setSearch("");
            }}
            className={`
              -mb-px
              flex
              items-center
              gap-2
              border-b-2
              px-4
              py-3
              text-xs
              font-semibold
              transition
              ${
                viewMode === "ARCHIVED"
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }
            `}
          >
            <Archive size={14} />

            Archived

            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] text-slate-500">
              {viewMode === "ARCHIVED"
                ? people.length
                : "—"}
            </span>
          </button>
        </div>

        {/* SEARCH */}

        <section className="mb-6 flex flex-col gap-3 sm:flex-row">

          <div className="relative max-w-xl flex-1">
            <Search
              size={16}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={
                viewMode === "ARCHIVED"
                  ? "Search archived people..."
                  : "Search people..."
              }
              className="
                w-full
                rounded-xl
                border border-slate-200
                bg-white
                py-3
                pl-11
                pr-4
                text-sm
                text-slate-800
                outline-none
                shadow-sm
                transition
                placeholder:text-slate-400
                focus:border-violet-300
                focus:ring-4
                focus:ring-violet-500/10
              "
            />
          </div>

          <div className="
            flex
            items-center
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            shadow-sm
          ">
            <span className="
              font-mono
              text-[9px]
              font-medium
              uppercase
              tracking-wider
              text-slate-400
            ">
              {filteredPeople.length}{" "}
              {filteredPeople.length === 1
                ? "person"
                : "people"}
            </span>
          </div>
        </section>

        {/* ARCHIVED INFO */}

        {viewMode === "ARCHIVED" && (
          <div className="
            mb-6
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-amber-100
            bg-amber-50
            px-4
            py-3
          ">
            <Archive
              size={15}
              className="
                shrink-0
                text-amber-600
              "
            />

            <p className="
              text-xs
              leading-5
              text-amber-700
            ">
              Archived people are hidden from
              your active list, but their
              financial records and history
              are preserved.
            </p>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="
            mb-6
            flex
            items-center
            justify-between
            gap-4
            rounded-xl
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-600
          ">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="
                text-xs
                font-medium
                text-red-500
                hover:text-red-700
              "
            >
              Dismiss
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          ">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-64
                    animate-pulse
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                  "
                />
              )
            )}
          </div>
        ) : filteredPeople.length === 0 ? (
          <EmptyPeople
            archived={
              viewMode === "ARCHIVED"
            }
            searching={Boolean(
              search.trim()
            )}
            onAdd={() =>
              setAddOpen(true)
            }
          />
        ) : (
          <div className="
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          ">
            {filteredPeople.map(
              (person) => (
                <PersonCard
                  key={person._id}
                  person={person}
                  summary={
                    summaries[person._id]
                  }
                  onView={() =>
                    navigate(
                      `/people/${person._id}`
                    )
                  }
                  onEdit={setEditPerson}
                  onArchive={
                    handleArchivePerson
                  }
                  onRestore={
                    handleRestorePerson
                  }
                />
              )
            )}
          </div>
        )}

        {/* ADD MODAL */}

        <AddPersonModal
          open={addOpen}
          onClose={() =>
            setAddOpen(false)
          }
          onCreated={handleAddPerson}
        />

        {/* EDIT MODAL */}

        <EditPersonModal
          person={editPerson}
          open={Boolean(editPerson)}
          onClose={() =>
            setEditPerson(null)
          }
          onUpdated={
            handleUpdatePerson
          }
        />
      </div>
    </DashboardLayout>
  );
};

// =========================================================
// EMPTY STATE
// =========================================================

const EmptyPeople = ({
  archived,
  searching,
  onAdd,
}) => {
  return (
    <div className="
      flex
      min-h-[420px]
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
      shadow-sm
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
        text-violet-600
      ">
        {archived ? (
          <Archive size={22} />
        ) : searching ? (
          <Search size={22} />
        ) : (
          <Users size={22} />
        )}
      </div>

      <h2 className="
        font-display
        text-lg
        font-semibold
        text-slate-900
      ">
        {searching
          ? "No people found"
          : archived
          ? "No archived people"
          : "Your ledger is empty"}
      </h2>

      <p className="
        mt-2
        max-w-sm
        text-xs
        leading-5
        text-slate-500
      ">
        {searching
          ? "Try searching with a different name."
          : archived
          ? "People you archive will appear here. Their financial history remains preserved."
          : "Add your first person to start organizing money given and borrowed."}
      </p>

      {!searching && !archived && (
        <button
          type="button"
          onClick={onAdd}
          className="
            mt-6
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-violet-600
            px-4
            py-2.5
            text-xs
            font-semibold
            text-white
            transition
            hover:bg-violet-700
          "
        >
          <Plus size={14} />
          Add your first person
        </button>
      )}
    </div>
  );
};

export default People;