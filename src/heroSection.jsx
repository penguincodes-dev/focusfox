import "../src/heroSection.css"
import { useState } from "react"

export default function HeroSection() {
    const [engine, setEngine] = useState("perplexity")
    const [open, setOpen] = useState(false)
    const [animating, setAnimating] = useState(false)

    const engines = {
        perplexity: "perplexity-ai-icon.png",
        duckduckgo: "duckduckgo-icon.jpg"
    }

    const handleEngineChange = () => {
        if (animating) return

        setAnimating(true)

        setTimeout(() => {
            setEngine(
                engine === "perplexity"
                    ? "duckduckgo"
                    : "perplexity"
            )

            setAnimating(false)
        }, 300)
    }

    const handleSearch = (e) => {
        e.preventDefault()

        const query = e.target.search.value.trim()

        if (query) {
            const searchUrls = {
                perplexity: "https://www.perplexity.ai/search?q=",
                duckduckgo: "https://duckduckgo.com/?q="
            }

            window.location.href =
                `${searchUrls[engine]}${encodeURIComponent(query)}`
        }
    }

    const nextEngine =
        engine === "perplexity"
            ? "duckduckgo"
            : "perplexity"

    return (
        <div id="heroSection">

            <h1>
                FocusFox
            </h1>

            <form
                className="searchBar"
                onSubmit={handleSearch}
            >

                <div className={`engine-options ${open ? "open" : ""}`}>

                    <button
                        type="button"
                        onClick={handleEngineChange}
                        disabled={animating}
                    >

                        <div className="icon-wrapper">

                            {/* Current icon */}
                            <img
                                className={`engine-icon current ${
                                    animating ? "slide-out" : ""
                                }`}
                                src={engines[engine]}
                                alt=""
                            />

                            {/* Next icon */}
                            {animating && (
                                <img
                                    className="engine-icon next slide-in"
                                    src={engines[nextEngine]}
                                    alt=""
                                />
                            )}

                        </div>

                    </button>

                </div>

                <input
                    id="input"
                    name="search"
                    type="text"
                    autoComplete="off"
                />

            </form>

        </div>
    )
}