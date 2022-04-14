export default function HomePage() {
    return (
        <div style={{
            width: "100%",
            height: "100%"
        }}>
            <div id="background"></div>
            <div id="content-container">
                <div className="content">Space Eternity 3</div>
            </div>
            <div id="play-container">
                <button id="play-button">Play</button>
            </div>
        </div>
    );
}
