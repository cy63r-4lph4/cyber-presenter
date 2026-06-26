import { Audience } from "./pages/Audience";
import { Display } from "./pages/Display";
import { MicrosoftLoginClone } from "./pages/MicrosoftLoginClone";
import { Remote } from "./pages/Remote";

export default function App() {
  const path = window.location.pathname;

  if (path === "/remote") return <Remote />;
  if (path === "/audience") return <Audience />;
  if (path === "/m-login") return <MicrosoftLoginClone />;

  return <Display />;
}
