import "./App.css";
import "mdb-ui-kit/css/mdb.dark.min.css";
import {
    MDBTabs,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsContent,
    MDBTabsPane,
    MDBNavbarBrand,
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCardImage,
} from "mdb-react-ui-kit";
import { useState } from "react";
import Notiflix from "notiflix";

export default function App() {
    const [basicActive, setBasicActive] = useState("homeTab");

    const handleBasicClick = (value) => {
        if (value === basicActive) return;
        setBasicActive(value);
    };

    /**
     * @param {import("../PSMoveClickerAPI/PSMoveClickerAPI").ControllerInfo} controllerInfo
     */

    return (
        <div className="h-100">
            <MDBTabs
                style={{
                    backgroundColor: "#363636",
                    height: "47px",
                }}
            >
                <MDBTabsItem>
                    <MDBTabsLink
                        onClick={() => handleBasicClick("homeTab")}
                        active={basicActive === "homeTab"}
                    >
                        Home
                    </MDBTabsLink>
                </MDBTabsItem>
                <MDBTabsItem>
                    <MDBTabsLink
                        onClick={() => handleBasicClick("versionsTab")}
                        active={basicActive === "versionsTab"}
                    >
                        Versions
                    </MDBTabsLink>
                </MDBTabsItem>
            </MDBTabs>

            <MDBTabsContent
                style={{
                    height: "calc(100% - 47px)",
                    position: "relative",
                }}
            >
                <MDBTabsPane className="h-100" show={basicActive === "homeTab"}>
                    <div id="background"></div>
                    <div id="content-container">
                        <div className="content">Space Eternity 3</div>
                    </div>
                    <div id="play-container">
                        <button id="play-button">Play</button>
                    </div>
                </MDBTabsPane>
                <MDBTabsPane show={basicActive === "versionsTab"}>
                    <button id="add-button" />
                </MDBTabsPane>
            </MDBTabsContent>
        </div>
    );
}
