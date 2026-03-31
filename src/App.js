import { useState } from "react";

const App = () => {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    if (!url) return alert("Please enter URL");

    try {
      setLoading(true);
      setData(null);

      const res = await fetch("http://localhost:5001/scrape", {
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
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleScrape}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Scrape
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p className="mt-6 text-blue-600 font-medium animate-pulse">
          Scraping domains... ⏳
        </p>
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
                    <td className="p-3 font-medium">{item.domain}</td>

                    <td className="p-3 break-all">
                      {item.finalUrl ? (
                        <a
                          href={item.finalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.finalUrl}
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