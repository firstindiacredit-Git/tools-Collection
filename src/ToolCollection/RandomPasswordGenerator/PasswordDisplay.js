import React, { useState } from "react";

function PasswordDisplay({ passwordList, onPasswordClick }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate the total number of pages
  const totalPages = Math.ceil(passwordList.length / itemsPerPage);

  // Get passwords for the current page
  const currentPasswords = passwordList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to handle page change
  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <h3 className="text-gray text-lg font-semibold mb-4">
        Stored Passwords:
      </h3>
      {currentPasswords.length > 0 ? (
        <>
          <table className="min-w-full bg-gray-800 border border-gray-600">
            <thead>
              <tr>
                <th className="border border-gray-600 px-4 py-2 text-left text-white">
                  #
                </th>
                <th className="border border-gray-600 px-4 py-2 text-left text-white">
                  Platform Name
                </th>
                <th className="border border-gray-600 px-4 py-2 text-left text-white">
                  Password
                </th>
              </tr>
            </thead>
            <tbody className="text-white">
              {currentPasswords.map((item, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="border border-gray-600 px-4 py-2">
                    {index + 1 + (currentPage - 1) * itemsPerPage}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {item.purpose}
                  </td>
                  <td
                    className="border border-gray-600 px-4 py-2 cursor-pointer"
                    onClick={() => onPasswordClick(item.password)} // Trigger refresh
                  >
                    {item.password}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-white bg-gray-600 rounded-md ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Previous
            </button>

            <span className="text-gray">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-white bg-gray-600 rounded-md ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray">No passwords saved yet.</p>
      )}
    </div>
  );
}

export default PasswordDisplay;
