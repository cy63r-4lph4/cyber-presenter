import { IntroControls } from "../scenes/intro/IntroControl";
import { IntroScene } from "../scenes/intro/IntroScene";
import { SecurityAlertControls } from "../scenes/intro/SecurityAlertControl";
import { SecurityAlertScene } from "../scenes/intro/SecurityAlertScene";
import { ThreatVectorsControls } from "../scenes/threatVectors/ThreatVectorsControls";
import { ThreatVectorsScene } from "../scenes/threatVectors/ThreatVectorsScene";
import { PhishingLiveControls } from "../scenes/phishing/PhishingLiveControls";
import { PhishingLiveScene } from "../scenes/phishing/PhishingLiveScene";

import { FakeLoginControls } from "../scenes/Shared/FakeLoginControls";
import { FakeLoginScene } from "../scenes/Shared/FakeLoginScreen";
import type { SceneEntry } from "../shared/types/presentation";
import { PasswordsScene } from "../scenes/password/PasswordsScene";
import { PasswordsControls } from "../scenes/password/PasswordsControls";
import { SocialEngineeringScene } from "../scenes/Human/SocialEngineeringScene";
import { SocialEngineeringControls } from "../scenes/Human/SocialEngineeringControls";
import { IncidentResponseScene } from "../scenes/response/InscidenceResponseScene";
import { IncidentResponseControls } from "../scenes/response/IncidentResponseControls";

export const scenes: SceneEntry[] = [
  {
    navLabel: "Security Alert",
    component: SecurityAlertScene,
    controls: SecurityAlertControls,
  },

  {
    navLabel: "Introduction",
    component: IntroScene,
    controls: IntroControls,
  },

  {
    navLabel: "Threat Vectors",
    component: ThreatVectorsScene,
    controls: ThreatVectorsControls,
  },

  {
    navLabel: "Phishing Demo (Live)",
    component: PhishingLiveScene,
    controls: PhishingLiveControls,
  },

  {
    navLabel: "Fake Login Trap",
    component: FakeLoginScene,
    controls: FakeLoginControls,
  },

  {
    navLabel: "The Broken Key Problem",
    component: PasswordsScene,
    controls: PasswordsControls,
  },

  {
    navLabel: "The Human Exploit",
    component: SocialEngineeringScene,
    controls: SocialEngineeringControls,
  },

 
{
  navLabel: "Incident Response",
  component: IncidentResponseScene,
  controls: IncidentResponseControls,
},
 
];