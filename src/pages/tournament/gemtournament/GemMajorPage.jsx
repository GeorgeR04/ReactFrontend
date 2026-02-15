import GemInfoPage from "./GemInfoPage.jsx";
import logoMajor from "../../../assets/Image/placeholder/MainLogo.png";

export default function GemMajorPage() {
    return (
        <GemInfoPage
            title="GEM Gaming Esport Major"
            badge="MAJOR"
            logo={logoMajor}
            description={
                "This is the pinnacle of competitive esports. Only the best, top-tier players from the Pro Circuit may qualify for this invitation-only tournament. " +
                "Every match is a showcase of peak performance, mental toughness, and relentless ambition. " +
                "This is where champions are crowned, legacies are built, and history is written."
            }
        />
    );
}
