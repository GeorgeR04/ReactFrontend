import GemInfoPage from "./GemInfoPage.jsx";
import logoPro from "../../../assets/Image/tournamentpage/Procircuitlogo.png";

export default function GemProPage() {
    return (
        <GemInfoPage
            title="GEM Pro Circuit"
            badge="PRO"
            logo={logoPro}
            description={
                "The Pro Circuit is where ambition meets reality. This is the final battleground before the Major. " +
                "Only the strongest competitors from Masters and selected S-tier community tournaments earn their place here. " +
                "Survive the Pro Circuit, and the Major awaits."
            }
        />
    );
}
