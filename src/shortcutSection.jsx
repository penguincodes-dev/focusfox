import { useState, useEffect } from "react";

import "../src/shortcutSection.css"

export default function Shortcuts() {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [opened, setOpen] = useState(false);

    const [shortcuts, setShortcuts] = useState(() => {
        const saved = localStorage.getItem("shortcuts");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    }, [shortcuts]);

    function addShortcut() {
        if (!name || !url) return;

        setShortcuts([
            ...shortcuts,
            {
                id: crypto.randomUUID(),
                name: name,
                url: url
            }
        ]);

        setName("");
        setUrl("");
        setOpen(false);
    }

    function removeShortcut(id) {
        setShortcuts(
            shortcuts.filter((shortcut) => shortcut.id !== id)
        );
    }

    return (
        <div className="shortcutsSection">
            
                {shortcuts.map((shortcut) => (
                    <Shortcut
                        key={shortcut.id}
                        id={shortcut.id}
                        name={shortcut.name}
                        url={shortcut.url}
                        onRemove={removeShortcut}
                    />
                ))}
                <button className="addShortcut" onClick={() => setOpen(true)}>
                    +
                </button>
                {opened ? (
                    <div className="shortcutPopUpWindow" >
                        <input
                            value={name}
                            type="text"
                            placeholder="name"
                            onChange={(e) => setName(e.target.value)}
                        />

                        <input
                            value={url}
                            type="text"
                            placeholder="https://example.com"
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <div className="sPUWoptions">
                            <button onClick={addShortcut}>
                                +
                            </button>

                            <button onClick={() => setOpen(false)}>
                                x
                            </button>
                        </div>
                    </div>
                ) : (
                    <></>
                )}

        </div>
    );
}

function Shortcut({ id, name, url, onRemove }) {
    return (
            <a href={url}>
                <div className="shortcut">
                        <div className="shortcutIcon">
                            {name[0].toUpperCase() + name.slice(1, 2)}
                        </div>


                    <button
                        className="shortcutRemove"
                        onClick={() => onRemove(id)}
                    >
                        ×
                </button>
                </div>
            </a>


    );
}
// function removeShortcut(id, key) {
//     const element = document.getElementById(id)
//     element.remove();
//     localStorage.removeItem(key)
// }
