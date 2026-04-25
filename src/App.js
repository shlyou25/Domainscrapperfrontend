"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const messages = [
  "🔍 Fetching domains...",
  "🧠 Analyzing page structure...",
  "📡 Extracting domain list...",
  "⚡ Filtering valid domains...",
  "🛡️ Removing duplicates...",
  "🚀 Almost done...",
];

const TLD_OPTIONS = ["com", "org", "net", "ai", "io", "xyz"];

const App = () => {
  const [url, setUrl] = useState("");
  const [startUrl, setStartUrl] = useState("");
  const [endUrl, setEndUrl] = useState("");
  const [paginationMode, setPaginationMode] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [search, setSearch] = useState("");

  // ✅ NEW: multi-select filter
  const [selectedTLDs, setSelectedTLDs] = useState([]);

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
        "https://domainscrapper-backend.onrender.com/scrape",
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

  const getTLD = (domain) => domain.split(".").pop();

  const toggleTLD = (tld) => {
    setSelectedTLDs((prev) =>
      prev.includes(tld)
        ? prev.filter((item) => item !== tld)
        : [...prev, tld]
    );
  };

  const processedData = data?.results
    ?.map((item) => ({
      ...item,
      tld: getTLD(item.domain),
    }))
    ?.filter((item) => {
      const matchSearch = item.domain
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchTLD =
        selectedTLDs.length === 0
          ? true
          : selectedTLDs.includes(item.tld);

      return matchSearch && matchTLD;
    });

  const downloadExcel = () => {
    const exportData = processedData.map((item) => ({
      Domain: item.domain,
      Redirect: item.finalUrl || item.domain,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Domains");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, "domains.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
        Domain Scraper
      </h1>

      {/* INPUT CARD */}
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-700">
            {paginationMode
              ? "Pagination Range (Start → End)"
              : "Website URL"}
          </span>

          <button
            onClick={() => setPaginationMode(!paginationMode)}
            className={`w-14 h-7 flex items-center rounded-full p-1 transition ${
              paginationMode ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
                paginationMode ? "translate-x-7" : ""
              }`}
            />
          </button>
        </div>

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
              placeholder="Start URL"
              value={startUrl}
              onChange={(e) => setStartUrl(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="End URL"
              value={endUrl}
              onChange={(e) => setEndUrl(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
        )}

        <button
          onClick={handleScrape}
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-medium ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Processing..." : "Scrape Domains"}
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="mt-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">
            {messages[messageIndex]}
          </p>
        </div>
      )}

      {/* RESULTS */}
      {data && !data.error && (
        <div className="mt-10 max-w-7xl mx-auto flex gap-6">

          {/* SIDEBAR FILTER */}
          <div className="w-64 bg-white shadow-xl rounded-2xl p-5 border h-fit sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Extensions</h3>
              <button
                onClick={() => setSelectedTLDs([])}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear
              </button>
            </div>

            <div className="space-y-3">
              {TLD_OPTIONS.map((tld) => (
                <label
                  key={tld}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedTLDs.includes(tld)}
                    onChange={() => toggleTLD(tld)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-gray-700 group-hover:text-blue-600">
                    .{tld}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* MAIN TABLE */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h2 className="text-xl font-semibold">
                Domains ({processedData?.length})
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search domain..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg text-sm"
                />

                <button
                  onClick={downloadExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  ⬇ Export Excel
                </button>
              </div>
            </div>

            <div className="overflow-auto bg-white shadow-xl rounded-2xl border">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Domain</th>
                    <th className="p-3 text-right">Redirect</th>
                  </tr>
                </thead>

                <tbody>
                  {processedData?.map((item, i) => (
                    <tr
                      key={i}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium text-blue-600">
                        <a
                          href={`http://${item.domain}`}
                          target="blank"
                        >
                          {item.domain}
                        </a>
                      </td>

                      <td className="p-3 text-right text-blue-600">
                        <a
                          href={item.finalUrl || `http://${item.domain}`}
                          target="blank"
                        >
                          {item.finalUrl || item.domain}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {processedData?.length === 0 && (
                <p className="p-4 text-center text-gray-500">
                  No results found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {data?.error && (
        <p className="mt-6 text-red-500 text-center">
          {data.error}
        </p>
      )}
    </div>
  );
};

export default App;