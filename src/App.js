import React, { useState } from 'react';
import Results from './Results';

function App() {
  const [csvData, setCsvData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const parsedData = parseCsv(text);
        setCsvData(parsedData);
        setIsSubmitted(true);
      };
      reader.readAsText(file);
    }
  };

  const parseCsv = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1);

    return rows.map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index]?.replace(/"/g, '') || '';
        return obj;
      }, {});
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Strong-Stats
      </h1>

      {!isSubmitted ? (
        <div className="w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700">
          <form className="flex flex-col items-center gap-4">
            <label className="block w-full text-center">
              <span className="text-sm font-medium mb-2">Upload Workout CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-500
                  file:transition file:duration-300
                  file:cursor-pointer"
              />
            </label>
            <button
              type="submit"
              onClick={() => setIsSubmitted(true)}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-500 
                rounded-lg font-semibold transition hover:from-purple-500 hover:to-pink-400
                shadow-md hover:shadow-lg"
            >
              Analyze Workouts
            </button>
          </form>
        </div>
      ) : (
        <Results data={csvData} />
      )}
    </div>
  );
}

export default App;