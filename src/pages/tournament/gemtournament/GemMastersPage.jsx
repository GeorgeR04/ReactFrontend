import GemInfoPage from "./GemInfoPage.jsx";
import logoMasters from "../../../assets/Image/tournamentpage/masterslogo.png";

export default function GemMastersPage() {
    return (
        <GemInfoPage
            title="GEM Masters"
            badge="MASTERS"
            logo={logoMasters}
            description={
                "GEM Masters is the open league where talent is tested and careers begin. " +
                "Anyone can enter, but only the strongest advance. Winning a Masters event qualifies you for the Pro Circuit. " +
                "This is where underdogs rise and the grind truly begins."
            }
        />
    );
}
