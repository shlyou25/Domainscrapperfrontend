import { useState, useEffect } from "react";

const messages = [
  "🔍 Fetching domains...",
  "🧠 Analyzing page structure...",
  "📡 Extracting domain list...",
  "⚡ Filtering valid domains...",
  "🛡️ Removing duplicates...",
  "🚀 Almost done...",
];

const App = () => {
  const [url, setUrl] = useState("");
  const [startUrl, setStartUrl] = useState("");
  const [endUrl, setEndUrl] = useState("");
  const [paginationMode, setPaginationMode] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  // rotating loader messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleScrape = async () => {
    if (!paginationMode && !url) {
      return alert("Enter URL");
    }

    if (paginationMode && (!startUrl || !endUrl)) {
      return alert("Enter start & end URL");
    }

    try {
      setLoading(true);
      setData(null);
      setMessageIndex(0);

      const res = await fetch(
        "https://mission-locations-officials-lone.trycloudflare.com/scrape",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            paginationMode,
            startUrl,
            endUrl,
          }),
        }
      );

      const result = await res.json();
      setData(result);
    } catch {
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center p-6">

      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
         Domain Scraper
      </h1>

      {/* Card */}
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-2xl">

        {/* Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-700">
            {paginationMode ? "Pagination Range (Start → End)" : "Website URL"}
          </span>

          <button
            onClick={() => setPaginationMode(!paginationMode)}
            className={`w-14 h-7 flex items-center rounded-full p-1 transition ${paginationMode ? "bg-blue-600" : "bg-gray-300"
              }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${paginationMode ? "translate-x-7" : ""
                }`}
            />
          </button>
        </div>

        {/* Inputs */}
        {!paginationMode ? (
          <input
            type="text"
            placeholder="Enter website URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="w-full border px-4 py-2 rounded-lg mb-4"
          />
        ) : (
          <div className="flex flex-col gap-3 mb-4">
            <input
              type="text"
              placeholder="Start URL (page 1)"
              value={startUrl}
              onChange={(e) => setStartUrl(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="End URL (page N)"
              value={endUrl}
              onChange={(e) => setEndUrl(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleScrape}
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-medium transition ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Processing..." : "Scrape Domains"}
        </button>
      </div>

      {/* Loader */}
      {loading && (
        <div className="mt-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">
            {messages[messageIndex]}
          </p>
        </div>
      )}

      {/* Results */}
      {data && !data.error && (
        <div className="mt-6 w-full max-w-5xl">
          <h2 className="text-lg font-semibold mb-3">
            Total Domains: {data.total}
          </h2>

          <div className="overflow-auto bg-white shadow rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">Domain</th>
                  <th className="p-3 text-right">Redirect</th>
                </tr>
              </thead>

              <tbody>
                {data.results?.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-2">
                      <a
                        href={`http://${item.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item.domain}
                      </a>
                    </td>

                    <td className="p-2 text-right">
                      <a
                        href={item.finalUrl || `http://${item.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item.finalUrl || `http://${item.domain}`}
                      </a>
                    </td>

                    {/* <td className="p-3">
                      <span
                        className={`font-semibold ${item.status === 200
                          ? "text-green-600"
                          : "text-red-500"
                          }`}
                      >
                        {item.status === 200 ? "Success" : "Failed"}
                      </span>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error */}
      {data?.error && (
        <p className="mt-6 text-red-500 font-semibold">
          {data.error}
        </p>
      )}
    </div>
  );
};

export default App;
