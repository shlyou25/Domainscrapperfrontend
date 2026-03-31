import { useState, useEffect } from "react";

const messages = [
  "🔍 Fetching domains...",
  "🧠 Analyzing page structure...",
  "📡 Extracting domain list...",
  "⚡ Filtering valid domains...",
  "🛡️ Removing duplicates & junk...",
  "🚀 Almost done... optimizing accuracy...",
];

const App = () => {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  // 🔄 Rotate messages
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [loading]);

  const handleScrape = async () => {
    if (!url) return alert("Please enter URL");

    try {
      setLoading(true);
      setData(null);
      setMessageIndex(0);

      const res = await fetch("https://domainscrapping.onrender.com/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const result = await res.json();
      setData(result);
    } catch (err) {
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Domain Scraper Tool
      </h1>

      {/* Input Box */}
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-2xl">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter website URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />

          <button
            onClick={handleScrape}
            disabled={loading}
            className={`px-5 py-2 rounded-lg transition text-white ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Processing..." : "Scrape"}
          </button>
        </div>
      </div>

      {/* 🔥 ADVANCED LOADER */}
      {loading && (
        <div className="mt-8 flex flex-col items-center gap-4">

          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

          {/* Dynamic message */}
          <p className="text-blue-600 font-medium text-lg transition-all duration-500">
            {messages[messageIndex]}
          </p>

          {/* Progress dots */}
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></span>
          </div>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="mt-6 w-full max-w-5xl">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            Total Domains: {data.total}
          </h2>

          <div className="overflow-auto bg-white shadow rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Domain</th>
                  <th className="p-3 text-left">Redirect URL</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {data?.results?.map((item, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium">
                      <a
                        href={`http://${item.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item.domain}
                      </a>
                    </td>

                    <td className="p-3 break-all">
                      {item.finalUrl || item.domain ? (
                        <a
                          href={item.finalUrl || `http://${item.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.finalUrl || `http://${item.domain}`}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="p-3">
                      {item.status === 200 ? (
                        <span className="text-green-600 font-semibold">
                          Success
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold">
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;