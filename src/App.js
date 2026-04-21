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

const App = () => {
  const [url, setUrl] = useState("");
  const [startUrl, setStartUrl] = useState("");
  const [endUrl, setEndUrl] = useState("");
  const [paginationMode, setPaginationMode] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedTLD, setSelectedTLD] = useState("all");

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
        "https://domainscrapping.onrender.com/scrape",
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
  const processedData = data?.results
    ?.map((item) => ({
      ...item,
      tld: getTLD(item.domain),
    }))
    ?.filter((item) => {
      const matchSearch = item.domain
        .toLowerCase()
        .includes(search.toLowerCase());

      const allowedTLDs = ["com", "org", "net", "ai", "io", "xyz"];

      const matchTLD =
        selectedTLD === "all"
          ? true
          : selectedTLD === "others"
            ? !allowedTLDs.includes(item.tld)
            : item.tld === selectedTLD;

      return matchSearch && matchTLD;
    });
  const tlds = [
    "all",
    ...new Set(data?.results?.map((d) => getTLD(d.domain))),
  ];


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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Domain Scraper
      </h1>
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-2xl">
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
      {loading && (
        <div className="mt-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">
            {messages[messageIndex]}
          </p>
        </div>
      )}
      {data && !data.error && (
        <div className="mt-8 w-full max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">

            <h2 className="text-xl font-semibold">
              Domains ({processedData?.length})
            </h2>

            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Search domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              />
              <select
                value={selectedTLD}
                onChange={(e) => setSelectedTLD(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              >
                {tlds.map((tld, i) => (
                  <option key={i} value={tld}>
                    {tld.toUpperCase()}
                  </option>
                ))}
              </select>
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
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left">Domain</th>
                  <th className="p-3 text-right">Redirect</th>
                </tr>
              </thead>
              <tbody>
                {processedData?.map((item, i) => (
                  <tr
                    key={i}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium text-blue-600">
                      <a
                        href={`http://${item.domain}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.domain}
                      </a>
                    </td>
                    <td className="p-3 text-right text-blue-600">
                      <a
                        href={item.finalUrl || `http://${item.domain}`}
                        target="_blank"
                        rel="noreferrer"
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
      )}
      {data?.error && (
        <p className="mt-6 text-red-500 font-semibold">
          {data.error}
        </p>
      )}
    </div>
  );
};

export default App;
