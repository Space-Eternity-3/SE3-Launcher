export default function HomePage() {
    return (
        <div style={{
            position: "absolute",
            top: "0",
            left: "0",
            bottom: "0",
            right: "0"
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
