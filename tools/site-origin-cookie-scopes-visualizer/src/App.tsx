import "./App.css";
import { useEffect, useState } from "react";

import { loadPSL, urlToComponents } from "./utils/psl.ts";
import toColoredComponents from "./utils/color.ts";
import validateURL from "./utils/url.ts";

import Header from "./components/Header.tsx";

import InputURLsArea from "./components/InputURLsArea.tsx";
import OutputVisualURLsComponentsArea from "./components/OutputVisualURLsComponentsArea.tsx";
import OutputSiteOriginScopesTable from "./components/OutputSiteOriginScopesTable.tsx";
import Cookies from "./components/Cookies.tsx";

function getURLFromHash(label: string): URL | null {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const encodedMaybeURL = params.get(label);
  if (encodedMaybeURL == null) {
    return null;
  }

  // Must be a URL
  let url;
  try {
    url = new URL(decodeURIComponent(encodedMaybeURL));
  } catch {
    return null;
  }

  // And must be valid to use (only http/https, etc.)
  const err = validateURL(url.toString());
  if (err) {
    history.replaceState(null, "", window.location.pathname);
    console.error(`Ignoring ${label} URL given from fragment.`, err);
    return null;
  }

  return url;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPSL()
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => {
        alert(err);
      });
  }, []);

  const exampleVictim = new URL("https://app.example.co.uk/");
  const exampleAttacker = new URL("http://1.dev.example.co.uk:8080/xss");

  const [validParsedURLVictim, setValidParsedURLVictim] = useState<URL>(
    getURLFromHash("target") || exampleVictim,
  );
  const [validParsedURLAttacker, setValidParsedURLAttacker] = useState<URL>(
    getURLFromHash("attacker") || exampleAttacker,
  );

  const victimComponents = urlToComponents(validParsedURLVictim);
  const attackerComponents = urlToComponents(validParsedURLAttacker);
  const coloredComponents = toColoredComponents(
    victimComponents,
    attackerComponents,
  );

  const loadingView = (
    <div className="flex flex-col items-center justify-center mt-4 w-3xl">
      <div className="text-xl">Loading latest Public Suffix List...</div>
    </div>
  );

  return (
    <div className="max-w-3xl">
      <Header />

      <div className="border-b border-gray-200 mt-3 mb-6 max-w-2xl"></div>

      <h3 className="text-xl mb-2">Input URLs</h3>

      <InputURLsArea
        validParsedURLVictim={validParsedURLVictim}
        setValidParsedURLVictim={setValidParsedURLVictim}
        validParsedURLAttacker={validParsedURLAttacker}
        setValidParsedURLAttacker={setValidParsedURLAttacker}
      />

      <div className="border-b border-gray-200 mb-6 max-w-2xl"></div>

      <h3 className="text-xl">URL components</h3>
      <p className="text-sm text-gray-400">relevant to site & origin</p>

      {isLoading ? (
        loadingView
      ) : (
        <>
          <OutputVisualURLsComponentsArea
            coloredComponents={coloredComponents}
            victimComponents={victimComponents}
            attackerComponents={attackerComponents}
          />

          <h3 className="text-xl mt-2">General site & origin scopes</h3>

          <OutputSiteOriginScopesTable
            coloredComponents={coloredComponents}
            victimComponents={victimComponents}
            attackerComponents={attackerComponents}
          />

          <div className="border-b border-gray-200 mb-6"></div>

          <h3 className="text-xl">Cookie-related scopes for target URL</h3>
          <Cookies
            coloredComponents={coloredComponents}
            victimComponents={victimComponents}
          />
        </>
      )}
    </div>
  );
}

export default App;
