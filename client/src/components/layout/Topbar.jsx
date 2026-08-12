import {
  Bell,
  Menu,
  Search,
  X,
  Users,
  FileText,
  CreditCard,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState([]);

  const [searching, setSearching] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  // =========================================================
  // LOAD UNREAD NOTIFICATIONS
  // =========================================================

  const loadUnreadCount = async () => {
    try {
      const response = await api.get(
        "/notifications/unread-count"
      );

      setUnreadCount(
        response.data.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Load notification count error:",
        error
      );
    }
  };

  useEffect(() => {
    loadUnreadCount();

    const interval = setInterval(
      loadUnreadCount,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // CLOSE PROFILE WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // KEYBOARD SHORTCUTS
  // =========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeElement =
        document.activeElement;

      const isTyping =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";

      if (
        event.key === "/" &&
        !isTyping
      ) {
        event.preventDefault();

        setSearchOpen(true);

        setTimeout(() => {
          searchRef.current?.focus();
        }, 50);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
        setResults([]);
        setProfileOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  useEffect(() => {
    const performSearch = async () => {
      const value = query.trim();

      if (!value) {
        setResults([]);
        return;
      }

      try {
        setSearching(true);

        const response = await api.get(
          `/search?q=${encodeURIComponent(value)}`
        );

        setResults(
          response.data.results || []
        );
      } catch (error) {
        console.error(
          "Search error:",
          error
        );

        setResults([]);
      } finally {
        setSearching(false);
      }
    };

    const timeout = setTimeout(
      performSearch,
      300
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  // =========================================================
  // OPEN SEARCH
  // =========================================================

  const openSearch = () => {
    setSearchOpen(true);

    setTimeout(() => {
      searchRef.current?.focus();
    }, 50);
  };

  // =========================================================
  // CLOSE SEARCH
  // =========================================================

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  };

  // =========================================================
  // RESULT ICON
  // =========================================================

  const getResultIcon = (type) => {
    switch (type) {
      case "person":
        return Users;

      case "record":
        return FileText;

      case "payment":
        return CreditCard;

      default:
        return Search;
    }
  };

  // =========================================================
  // RESULT CLICK
  // =========================================================

  const handleResultClick = (result) => {
    closeSearch();

    if (result.type === "person") {
      navigate(
        `/people/${result.id}`
      );
      return;
    }

    if (result.type === "record") {
      navigate(
        `/records/${result.id}`
      );
      return;
    }

    if (result.type === "payment") {
      navigate(
        `/payments/${result.id}`
      );
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    setProfileOpen(false);

    try {
      await logout();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      navigate("/login");
    }
  };

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-20
        items-center
        border-b
        border-zinc-200
        bg-white/95
        px-4
        shadow-[0_1px_12px_rgba(15,23,42,0.04)]
        backdrop-blur-xl
        sm:px-6
        lg:px-8
      "
    >

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="
          mr-3
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-zinc-200
          bg-white
          text-slate-500
          shadow-sm
          transition
          hover:border-violet-200
          hover:bg-violet-50
          hover:text-violet-600
          lg:hidden
        "
      >
        <Menu size={18} />
      </button>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative hidden md:block">

        {!searchOpen ? (

          <button
            type="button"
            onClick={openSearch}
            className="
              group
              flex
              w-[420px]
              items-center
              gap-3
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-slate-400
              shadow-sm
              transition-all
              hover:border-violet-200
              hover:bg-violet-50/30
              hover:text-slate-700
            "
          >

            <Search
              size={17}
              className="
                shrink-0
                transition
                group-hover:text-violet-600
              "
            />

            <span className="flex-1 text-left font-mono text-xs">
              Search your ledger...
            </span>

            <kbd
              className="
                rounded-md
                border
                border-slate-200
                bg-slate-50
                px-2
                py-1
                font-mono
                text-[9px]
                text-slate-400
              "
            >
              /
            </kbd>

          </button>

        ) : (

          <div className="relative">

            {/* Search input */}

            <div
              className="
                flex
                w-[450px]
                items-center
                gap-3
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                py-3
                shadow-sm
                transition-all
                focus-within:border-violet-400
                focus-within:ring-4
                focus-within:ring-violet-500/10
              "
            >

              <Search
                size={16}
                className="
                  shrink-0
                  text-violet-500
                "
              />

              <input
                ref={searchRef}
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                placeholder="Search people, records, payments..."
                className="
                  w-full
                  bg-transparent
                  text-sm
                  text-zinc-900
                  outline-none
                  placeholder:text-slate-400
                "
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    searchRef.current?.focus();
                  }}
                  className="
                    rounded-md
                    p-1
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-700
                  "
                >
                  <X size={15} />
                </button>
              )}

              <button
                type="button"
                onClick={closeSearch}
                className="
                  rounded-md
                  border
                  border-slate-200
                  bg-slate-50
                  px-1.5
                  py-0.5
                  font-mono
                  text-[8px]
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-600
                "
              >
                ESC
              </button>

            </div>


            {/* Search results */}

            {(query || searching) && (
              <div
                className="
                  absolute
                  left-0
                  top-[58px]
                  z-[100]
                  w-[450px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-xl
                  shadow-slate-300/30
                "
              >

                {searching ? (

                  <div className="px-4 py-8 text-center">

                    <div
                      className="
                        mx-auto
                        h-5
                        w-5
                        animate-spin
                        rounded-full
                        border-2
                        border-slate-200
                        border-t-violet-600
                      "
                    />

                    <p className="mt-3 text-xs text-slate-400">
                      Searching...
                    </p>

                  </div>

                ) : results.length === 0 ? (

                  <div className="px-4 py-8 text-center">

                    <div
                      className="
                        mx-auto
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-50
                        text-slate-300
                      "
                    >
                      <Search size={19} />
                    </div>

                    <p className="mt-3 text-xs font-semibold text-slate-600">
                      No results found
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Try a person's name or email
                    </p>

                  </div>

                ) : (

                  <div className="max-h-[360px] overflow-y-auto p-2">

                    {results.map((result) => {

                      const Icon =
                        getResultIcon(
                          result.type
                        );

                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          type="button"
                          onClick={() =>
                            handleResultClick(
                              result
                            )
                          }
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-3
                            text-left
                            transition
                            hover:bg-violet-50
                          "
                        >

                          <div
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              bg-slate-50
                              text-slate-500
                            "
                          >
                            <Icon size={16} />
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-xs font-semibold text-zinc-800">
                              {result.title}
                            </p>

                            {result.subtitle && (
                              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                {result.subtitle}
                              </p>
                            )}

                          </div>

                          <span
                            className="
                              rounded-md
                              bg-slate-100
                              px-2
                              py-1
                              font-mono
                              text-[8px]
                              uppercase
                              text-slate-400
                            "
                          >
                            {result.type}
                          </span>

                        </button>
                      );
                    })}

                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">


        {/* =================================================
            SETTINGS
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate("/settings")
          }
          aria-label="Settings"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-zinc-200
            bg-white
            text-slate-500
            shadow-sm
            transition-all
            hover:border-violet-200
            hover:bg-violet-50
            hover:text-violet-600
          "
        >
          <Settings size={18} />
        </button>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate("/notifications")
          }
          aria-label="Notifications"
          className="
            relative
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-zinc-200
            bg-white
            text-slate-500
            shadow-sm
            transition-all
            hover:border-violet-200
            hover:bg-violet-50
            hover:text-violet-600
          "
        >

          <Bell size={18} />

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -right-1
                -top-1
                flex
                min-h-[18px]
                min-w-[18px]
                items-center
                justify-center
                rounded-full
                bg-violet-600
                px-1
                font-mono
                text-[9px]
                font-bold
                text-white
                ring-2
                ring-white
              "
            >
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}

        </button>


        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="mx-1 hidden h-8 w-px bg-zinc-200 sm:block" />


        {/* =================================================
            PROFILE
        ================================================= */}

        <div
          ref={profileRef}
          className="relative"
        >

          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                (previous) =>
                  !previous
              )
            }
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            className="
              group
              flex
              items-center
              gap-2.5
              rounded-xl
              px-1.5
              py-1.5
              transition
              hover:bg-slate-50
            "
          >

            {/* Name */}

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold text-zinc-800">
                {user?.name || "User"}
              </p>

              <p
                className="
                  font-mono
                  text-[8px]
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Personal account
              </p>

            </div>


            {/* Avatar */}

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-violet-500
                to-indigo-600
                font-display
                text-sm
                font-bold
                text-white
                shadow-md
                shadow-violet-200
                transition
                group-hover:scale-105
              "
            >
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </div>


            {/* Chevron */}

            <ChevronDown
              size={14}
              className={`
                hidden
                text-slate-400
                transition
                sm:block
                ${
                  profileOpen
                    ? "rotate-180 text-violet-500"
                    : ""
                }
              `}
            />

          </button>


          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

          {profileOpen && (
            <div
              className="
                absolute
                right-0
                top-[56px]
                z-[100]
                w-64
                overflow-hidden
                rounded-2xl
                border
                border-zinc-200
                bg-white
                shadow-xl
                shadow-slate-300/30
              "
            >

              {/* User information */}

              <div
                className="
                  border-b
                  border-zinc-100
                  px-4
                  py-4
                "
              >

                <p className="truncate text-sm font-semibold text-zinc-800">
                  {user?.name || "User"}
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {user?.email || ""}
                </p>

              </div>


              {/* Logout */}

              <div className="p-2">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-red-500
                    transition
                    hover:bg-red-50
                  "
                >

                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-red-50
                    "
                  >
                    <LogOut size={15} />
                  </span>

                  Logout

                </button>

              </div>

            </div>
          )}

        </div>

      </div>


      {/* =====================================================
          MOBILE SEARCH
      ===================================================== */}

      <button
        type="button"
        onClick={openSearch}
        aria-label="Search"
        className="
          ml-2
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-zinc-200
          bg-white
          text-slate-500
          shadow-sm
          transition
          hover:border-violet-200
          hover:bg-violet-50
          hover:text-violet-600
          md:hidden
        "
      >
        <Search size={18} />
      </button>

    </header>
  );
};

export default Topbar;