import React, { useEffect, useState } from "react";
import Fuse from "fuse.js";

const Apiexample = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "Hiring_TestID",
    order: "asc",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const activationUrl =
    "https://api.findofficers.com/hiring_test/get_activation_code";
  const employeesUrl =
    "https://api.findofficers.com/hiring_test/get_all_employee";

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const activationRes = await fetch(activationUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        // console.log(activationRes);

        if (!activationRes.ok)
          throw new Error("Failed to fetch activation code");

        const activationData = await activationRes.json();
        if (!activationData.activationCode)
          throw new Error("Activation code is missing");
        // console.log(activationData);

        const activationCode = activationData.activationCode;
        // console.log(activationCode);

        const employeesRes = await fetch(employeesUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activationCode }),
        });

        if (!employeesRes.ok) {
          const errorText = await employeesRes.text();
          throw new Error(`Failed to fetch employees: ${errorText}`);
        }

        const employeesData = await employeesRes.json();
        if (!Array.isArray(employeesData))
          throw new Error("Invalid employee data format");

        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployees();
  }, []);

  // Sorting function
  const handleSort = (key) => {
    let order = "asc";
    if (sortConfig.key === key && sortConfig.order === "asc") {
      order = "desc";
    }

    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      if (a[key] === b[key]) return 0;

      return order === "asc"
        ? a[key]
            .toString()
            .localeCompare(b[key].toString(), undefined, { numeric: true })
        : b[key]
            .toString()
            .localeCompare(a[key].toString(), undefined, { numeric: true });
    });

    setFilteredEmployees(sortedEmployees);
    setSortConfig({ key, order });
  };

  // Function to show sorting arrow
  const getSortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.order === "asc" ? "▲" : "▼";
    }
    return "";
  };

  // Search function using Fuse.js
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredEmployees(employees);
      return;
    }

    const fuse = new Fuse(employees, {
      keys: ["Hiring_TestID", "firstName", "lastName", "city", "country"],
      threshold: 0.3,
    });

    const result = fuse.search(query).map(({ item }) => item);
    setFilteredEmployees(result);
    setCurrentPage(1); // Reset to first page after search
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div style={styles.container}>
      {/* Button linking to another website */}
      <a
        href="https://www.example.com"
        target="_blank"
        rel="noopener noreferrer"
        style={styles.externalLinkButton}
      >
        Create Employee
      </a>

      <h1 style={styles.header}>Employees List</h1>

      {/* Search Bar */}
      <div style={styles.searchWrapper}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search..."
          style={styles.searchInput}
        />
      </div>

      {loading && <p style={styles.loadingText}>Loading...</p>}
      {error && <p style={styles.errorText}>{error}</p>}

      {!loading && !error && filteredEmployees.length > 0 ? (
        <>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th
                  style={styles.tableHeaderCell}
                  onClick={() => handleSort("Hiring_TestID")}
                >
                  TestID {getSortArrow("Hiring_TestID")}
                </th>
                <th
                  style={styles.tableHeaderCell}
                  onClick={() => handleSort("firstName")}
                >
                  Name {getSortArrow("firstName")}
                </th>
                <th style={styles.tableHeaderCell}>Employee ID</th>
                <th style={styles.tableHeaderCell}>Email</th>
                <th style={styles.tableHeaderCell}>Phone</th>
                <th
                  style={styles.tableHeaderCell}
                  onClick={() => handleSort("city")}
                >
                  City {getSortArrow("city")}
                </th>
                <th
                  style={styles.tableHeaderCell}
                  onClick={() => handleSort("country")}
                >
                  Country {getSortArrow("country")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((employee) => (
                <tr key={employee.Hiring_TestID} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    {employee.Hiring_TestID || "N/A"}
                  </td>
                  <td style={styles.tableCell}>
                    {employee.firstName + " " + employee.lastName || "N/A"}
                  </td>
                  <td style={styles.tableCell}>
                    {employee.employeeID || "N/A"}
                  </td>
                  <td style={styles.tableCell}>{employee.email || "N/A"}</td>
                  <td style={styles.tableCell}>
                    {employee.phoneNumber || "N/A"}
                  </td>
                  <td style={styles.tableCell}>{employee.city || "N/A"}</td>
                  <td style={styles.tableCell}>{employee.country || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={styles.paginationControls}>
            <button
              style={styles.paginationButton}
              disabled={currentPage === 1}
              onClick={prevPage}
            >
              Previous
            </button>
            <span style={styles.paginationText}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              style={styles.paginationButton}
              disabled={currentPage === totalPages}
              onClick={nextPage}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        !loading && <p style={styles.noDataText}>No employees found</p>
      )}
    </div>
  );
};

// Styles as an object
const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f4f4f4",
    maxWidth: "1200px",
    margin: "auto",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    position: "relative",
  },
  externalLinkButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    textDecoration: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
  header: {
    textAlign: "center",
    fontSize: "50px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  },
  searchWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },
  searchInput: {
    padding: "10px",
    width: "300px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
    outline: "none",
  },
  loadingText: {
    textAlign: "center",
    color: "#777",
  },
  errorText: {
    textAlign: "center",
    color: "red",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  tableHeader: {
    backgroundColor: "#e0e0e0",
  },
  tableHeaderCell: {
    padding: "12px",
    textAlign: "left",
    cursor: "pointer",
    borderBottom: "1px solid #ddd",
    fontWeight: "bold",
    color: "#333",
  },
  tableRow: {
    textAlign: "center",
    borderBottom: "1px solid #ddd",
  },
  tableCell: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    color: "#555",
  },
  paginationControls: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
  },
  paginationButton: {
    padding: "8px 16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    margin: "0 10px",
  },
  paginationText: {
    fontSize: "16px",
    color: "#555",
  },
  noDataText: {
    textAlign: "center",
    color: "#777",
  },
};

export default Apiexample;
