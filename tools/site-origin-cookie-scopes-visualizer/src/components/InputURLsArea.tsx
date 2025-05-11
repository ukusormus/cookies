import examples from "../utils/examples.ts";
import { useEffect, useState, useTransition } from "react";
import validateURL from "../utils/url.ts";

function ExampleSelect({ setValue }: { setValue: (value: string) => void }) {
  const selectExampleText = "Select example";
  return (
    <select
      onChange={(e) => {
        setValue(e.target.value);
        e.target.value = selectExampleText;
      }}
      defaultValue={selectExampleText}
      className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option disabled value={selectExampleText}>
        {selectExampleText}
      </option>
      {Object.entries(examples).map(([label, urls]) => (
        <optgroup label={label} key={label}>
          {urls.map((url) => (
            <option value={url} key={url}>
              {url}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function NoteArea({ validParsedURL }: { validParsedURL: string }) {
  return (
    <div className="text-xs text-gray-400 mt-1 ml-1">
      Normalized: {validParsedURL}
    </div>
  );
}

function ErrorArea({ errorText }: { errorText: string }) {
  return (
    <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm mt-3 border border-red-200">
      Invalid input URL. {errorText}.
    </div>
  );
}

function URLInput({
  title,
  validParsedURL,
  setValidParsedURL,
}: {
  title: string;
  validParsedURL: URL;
  setValidParsedURL: (value: URL) => void;
}) {
  const [, startTransition] = useTransition();
  const [rawInputValue, setRawInputValue] = useState(validParsedURL.toString());
  const [error, setError] = useState<string | null>(null);

  function updateValidParsedURL(url: URL) {
    startTransition(() => {
      setValidParsedURL(url);
    });
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-700">{title}</span>

        {/* We can assume only valid values are in the select dropdown, hence we can set the "valid" value directly */}
        <ExampleSelect
          setValue={(value: string) => {
            setRawInputValue(value);

            const url = new URL(value);
            setError(null);
            // setValidParsedURL(url);
            updateValidParsedURL(url);
          }}
        />
      </div>

      {/* Direct user input needs validation; if invalid value, don't update validParsedURL state and show error */}
      <input
        value={rawInputValue}
        onChange={(e) => {
          const input = e.target.value;
          // note: change event fires on user input,
          // not on direct change of input element value
          // (like done via rawInputValue state change, which in the background, updates the value via JavaScript),
          // so we won't have an infinite loop here
          setRawInputValue(input);

          const err = validateURL(input);
          if (!err) {
            const url = new URL(input);
            updateValidParsedURL(url);
            // setValidParsedURL(url);
            setError(null);
          } else {
            setError(err);
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoComplete="off"
        autoCorrect="off"
      ></input>
      {error ? (
        <ErrorArea errorText={error} />
      ) : (
        <NoteArea validParsedURL={validParsedURL.toString()} />
      )}
    </div>
  );
}

export default function InputURLsArea({
  validParsedURLVictim,
  setValidParsedURLVictim,
  validParsedURLAttacker,
  setValidParsedURLAttacker,
}: {
  validParsedURLVictim: URL;
  setValidParsedURLVictim: (value: URL) => void;
  validParsedURLAttacker: URL;
  setValidParsedURLAttacker: (value: URL) => void;
}) {
  useEffect(() => {
    // update URL hash on changes to target & attacker URL inputs
    const params = new URLSearchParams(window.location.hash.substring(1));
    params.set("target", encodeURIComponent(validParsedURLVictim.toString()));
    params.set(
      "attacker",
      encodeURIComponent(validParsedURLAttacker.toString()),
    );
    const newHash = "#" + params.toString();
    if (newHash !== window.location.hash) {
      history.replaceState(null, "", newHash);
    }
  }, [validParsedURLVictim, validParsedURLAttacker]);

  return (
    <div className="max-w-2xl mb-3 space-y-4">
      <URLInput
        title="Target URL"
        validParsedURL={validParsedURLVictim}
        setValidParsedURL={setValidParsedURLVictim}
      />
      <URLInput
        title="Attacker URL"
        validParsedURL={validParsedURLAttacker}
        setValidParsedURL={setValidParsedURLAttacker}
      />
    </div>
  );
}
