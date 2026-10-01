import { useState, useEffect } from "react";
import "./App.css";

const extensionAPI =
  globalThis.browser ||
  globalThis.chrome;

// ========================================
// STORAGE HELPER
// ========================================

const storage = {
  async get(keys) {
    // Firefox extension
    if (extensionAPI?.storage?.local) {
      return await extensionAPI.storage.local.get(keys);
    }

    // React/Vite development fallback
    const result = {};

    if (keys.includes("shortcuts")) {
      try {
        result.shortcuts =
          JSON.parse(
            localStorage.getItem("shortcuts")
          ) || {};
      } catch {
        result.shortcuts = {};
      }
    }

    if (keys.includes("theme")) {
      result.theme =
        localStorage.getItem("theme");
    }

    return result;
  },

  async set(data) {
    // Firefox extension
    if (extensionAPI?.storage?.local) {
      await extensionAPI.storage.local.set(data);
      return;
    }

    // React/Vite development fallback
    if ("shortcuts" in data) {
      localStorage.setItem(
        "shortcuts",
        JSON.stringify(data.shortcuts)
      );
    }

    if ("theme" in data) {
      localStorage.setItem(
        "theme",
        data.theme
      );
    }
  },
};

// ========================================
// ADD SHORTCUT POPUP
// ========================================

function PopUpWindow({
  visible,
  setVisible,
  shortcutName,
  setShortcutName,
  shortcutLink,
  setShortcutLink,
  addShortcut,
  lightMode,
}) {
  return (
    <>
      {visible && (
        <div className="popup-overlay">
          <div className="popup-window">

            {/* CLOSE BUTTON */}

            <button
              onClick={() => setVisible(false)}
              className="popup-close"
            >
              ×
            </button>

            {/* SHORTCUT NAME */}

            <input
              value={shortcutName}
              onChange={(e) =>
                setShortcutName(e.target.value)
              }
              type="text"
              placeholder="Name"
              className="popup-input"
            />

            {/* SHORTCUT WEBSITE */}

            <input
              value={shortcutLink}
              onChange={(e) =>
                setShortcutLink(e.target.value)
              }
              type="text"
              placeholder="example.com"
              className="popup-input"
            />

            {/* ADD SHORTCUT */}

            <button
              onClick={() => {
                if (
                  !shortcutName.trim() ||
                  !shortcutLink.trim()
                ) {
                  return;
                }

                addShortcut(
                  shortcutName.trim(),
                  shortcutLink.trim()
                );

                setShortcutName("");
                setShortcutLink("");

                setVisible(false);
              }}
              className="popup-add-button"
            >
              + Add to the den
            </button>

          </div>
        </div>
      )}
    </>
  );
}

// ========================================
// SHORTCUT
// ========================================

function Shortcut({
  name,
  link,
  onDelete,
  lightMode,
}) {
  return (
    <div
      className="shortcut"
      onClick={() => {
        const url =
          link.startsWith("http://") ||
          link.startsWith("https://")
            ? link
            : `https://${link}`;

        window.location = url;
      }}
    >
      {/* SHORTCUT INITIALS */}

      <span className="shortcut-initials">
        {name.slice(0, 2).toUpperCase()}
      </span>

      {/* DELETE */}

      <button
        className="shortcut-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        ×
      </button>
    </div>
  );
}

// ========================================
// MAIN APP
// ========================================

function App() {

  // ========================================
  // SEARCH STATE
  // ========================================

  const [open, setOpen] =
    useState(false);

  const [engine, setEngine] =
    useState("Perplexity");

  const [inputValue, setInputValue] =
    useState("");

  // ========================================
  // POPUP STATE
  // ========================================

  const [
    popUpWindowVisible,
    setPopUpWindowVisible,
  ] = useState(false);

  // ========================================
  // SHORTCUT STATE
  // ========================================

  const [shortcuts, setShortcuts] =
    useState({});

  const [shortcutName, setShortcutName] =
    useState("");

  const [shortcutLink, setShortcutLink] =
    useState("");

  // ========================================
  // LIGHT / DARK MODE
  // ========================================

  const [lightMode, setLightMode] =
    useState(false);

  // ========================================
  // LOAD SAVED DATA
  // ========================================

  useEffect(() => {
    const loadData = async () => {
      try {
        const result =
          await storage.get([
            "shortcuts",
            "theme",
          ]);

        // LOAD SHORTCUTS

        if (result.shortcuts) {
          setShortcuts(result.shortcuts);
        }

        // LOAD THEME

        if (result.theme) {
          setLightMode(
            result.theme === "light"
          );
        }
      } catch (error) {
        console.error(
          "Failed to load FocusFox data:",
          error
        );
      }
    };

    loadData();
  }, []);

  // ========================================
  // SAVE THEME
  // ========================================

  useEffect(() => {
    storage
      .set({
        theme: lightMode
          ? "light"
          : "dark",
      })
      .catch((error) => {
        console.error(
          "Failed to save theme:",
          error
        );
      });
  }, [lightMode]);

  // ========================================
  // SEARCH ENGINES
  // ========================================

  const searchEngines = {
    ChatGPT: {
      icon: lightMode
        ? "/chatgbtAI-light.jpg"
        : "/chatgbtIcon.jpg",
    },

    DuckDuckGo: {
      icon: lightMode
        ? "/duckduckgo-light.png"
        : "/duckduckGoIcon.jpg",
    },

    Perplexity: {
      icon: lightMode
        ? "/perplexityAI-light.png"
        : "/perplexityIcon.png",
    },
  };

  // ========================================
  // ADD SHORTCUT
  // ========================================

  async function addShortcut(name, link) {
    const newShortcuts = {
      ...shortcuts,
      [name]: link,
    };

    setShortcuts(newShortcuts);

    try {
      await storage.set({
        shortcuts: newShortcuts,
      });
    } catch (error) {
      console.error(
        "Failed to save shortcut:",
        error
      );
    }
  }

  // ========================================
  // DELETE SHORTCUT
  // ========================================

  async function deleteShortcut(name) {
    const newShortcuts = {
      ...shortcuts,
    };

    delete newShortcuts[name];

    setShortcuts(newShortcuts);

    try {
      await storage.set({
        shortcuts: newShortcuts,
      });
    } catch (error) {
      console.error(
        "Failed to delete shortcut:",
        error
      );
    }
  }

  // ========================================
  // SEARCH
  // ========================================

  const handleSearch = () => {
    if (!inputValue.trim()) {
      return;
    }

    const query =
      encodeURIComponent(inputValue);

    if (engine === "DuckDuckGo") {
      window.location =
        `https://duckduckgo.com/?q=${query}`;
    }

    if (engine === "ChatGPT") {
      window.location =
        `https://chatgpt.com/?q=${query}`;
    }

    if (engine === "Perplexity") {
      window.location =
        `https://www.perplexity.ai/?q=${query}`;
    }
  };

  // ========================================
  // MAIN PAGE
  // ========================================

  return (
    <div
      className={`app ${
        lightMode ? "light" : ""
      }`}
    >

      {/* ==================================
          HERO SECTION
          ================================== */}

      <div id="heroSection">

        {/* TITLE */}

        <h1>
          FocusFox
        </h1>

        {/* SEARCH BAR */}

        <div id="searchBar">

          {/* SEARCH ENGINE SELECTOR */}

          <div className="search-engine-selector">

            <button
              onClick={() =>
                setOpen(!open)
              }
              className="search-engine-button"
            >
              <img
                src={
                  searchEngines[
                    engine
                  ].icon
                }
                alt={engine}
              />
            </button>

            {/* SEARCH ENGINE DROPDOWN */}

            <div
              className={`search-engine-dropdown ${
                open ? "open" : ""
              }`}
            >
              {Object.keys(
                searchEngines
              )
                .filter(
                  (name) =>
                    name !== engine
                )
                .map(
                  (name, index) => (
                    <button
                      key={name}
                      onClick={() => {
                        setEngine(name);
                        setOpen(false);
                      }}
                      className="search-engine-option"
                      style={{
                        transitionDelay:
                          open
                            ? `${index * 50}ms`
                            : "0ms",
                      }}
                    >
                      <img
                        src={
                          searchEngines[
                            name
                          ].icon
                        }
                        alt={name}
                      />
                    </button>
                  )
                )}
            </div>

          </div>

          {/* SEARCH INPUT */}

          <div className="search-input-wrapper">

            <input
              type="text"
              placeholder="Ask anything"
              value={inputValue}
              onChange={(e) =>
                setInputValue(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="search-input"
            />

            {/* SEARCH BUTTON */}

            <button
              onClick={handleSearch}
              className={`search-button ${
                engine === "ChatGPT"
                  ? "chatgpt"
                  : engine ===
                    "DuckDuckGo"
                  ? "duckduckgo"
                  : "perplexity"
              }`}
            >
              ↑
            </button>

          </div>

        </div>
      </div>

      {/* ==================================
          SHORTCUT SECTION
          ================================== */}

      <div id="shortcutSection">

        {Object.entries(
          shortcuts
        ).map(
          ([name, link]) => (
            <Shortcut
              key={name}
              name={name}
              link={link}
              lightMode={lightMode}
              onDelete={() =>
                deleteShortcut(name)
              }
            />
          )
        )}

        {/* ADD SHORTCUT BUTTON */}

        <button
          onClick={() =>
            setPopUpWindowVisible(
              true
            )
          }
          className="add-shortcut-button"
        >
          +
        </button>

      </div>

      {/* ==================================
          LIGHT / DARK MODE BUTTON
          ================================== */}

      <button
        onClick={() =>
          setLightMode(!lightMode)
        }
        className="theme-button"
        title={
          lightMode
            ? "Switch to dark mode"
            : "Switch to light mode"
        }
      >
        {lightMode ? "☀" : "☾"}
      </button>

      {/* ==================================
          ADD SHORTCUT POPUP
          ================================== */}

      <PopUpWindow
        visible={
          popUpWindowVisible
        }
        setVisible={
          setPopUpWindowVisible
        }
        shortcutName={
          shortcutName
        }
        setShortcutName={
          setShortcutName
        }
        shortcutLink={
          shortcutLink
        }
        setShortcutLink={
          setShortcutLink
        }
        addShortcut={
          addShortcut
        }
        lightMode={
          lightMode
        }
      />

    </div>
  );
}

export default App;