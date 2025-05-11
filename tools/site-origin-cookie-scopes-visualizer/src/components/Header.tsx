export default function Header() {
  return (
    <header className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        site, origin & cookie scopes visualizer 🕶
      </h1>
      <div className="space-y-2 text-gray-600 text-sm">
        <p>
          See the possible impact to the target web application when an attacker
          has control of a related URL (like a subdomain or sibling domain of
          the target app) that a victim could visit.
        </p>
        <p>
          How do cookie-based operations (and related attacks) change in their
          scope when cookie settings (attributes, name prefix) are changed? Try
          out for yourself below.
        </p>
        <details className="text-gray-400">
          <summary>Meaning of "control"</summary>
          <div className="mt-1">
            "Control" can mean several things, including:
            <ul className="list-disc ml-4">
              <li>
                probably the most common case, an XSS-type of attack with the
                ability to inject HTML and/or execute JavaScript code on the
                browser-side;
              </li>
              <li>
                <a href="https://labs.detectify.com/writeups/hostile-subdomain-takeover-using-heroku-github-desk-more/">
                  subdomain
                </a>{" "}
                <a href="https://canitakeyoursubdomain.name/">takeover</a>,
                which may even include server-side control of reading HTTP
                request headers (like <code>Cookie</code>) and issuing response
                headers (like <code>Set-Cookie</code>);
              </li>
              <li>
                an active network which could modify plaintext HTTP traffic,
                e.g., set a cookie through <code>http://bank.example</code>{" "}
                before it is redirected to <code>https://bank.example</code>.
              </li>
            </ul>
          </div>
        </details>
        <details className="text-gray-400">
          <summary>Top-level v.s. embedded content</summary>
          <div>
            <div className="mt-1">
              For simplicity, only direct top-level navigation is currently
              considered, so for embedded resources (like images or iframes),
              additional browser restrictions may apply.
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
