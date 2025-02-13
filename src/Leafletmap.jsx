import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const activationUrl =
  "https://api.findofficers.com/hiring_test/get_activation_code";
const employeesUrl =
  "https://api.findofficers.com/hiring_test/get_all_employee";

const EmployeeMap = () => {
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef([]); // Store markers in a ref (prevents unnecessary re-renders)

  useEffect(() => {
    const initMap = L.map("map").setView([30.1575, 71.5249], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(initMap);
    setMap(initMap);

    return () => initMap.remove();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const activationRes = await fetch(activationUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!activationRes.ok) throw new Error("Failed to fetch activation code");
      const activationData = await activationRes.json();
      if (!activationData.activationCode)
        throw new Error("Activation code is missing");

      const employeesRes = await fetch(employeesUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activationCode: activationData.activationCode }),
      });

      if (!employeesRes.ok) throw new Error("Failed to fetch employees");
      const employeesData = await employeesRes.json();
      if (!Array.isArray(employeesData))
        throw new Error("Invalid employee data format");

      updateMapMarkers(employeesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMapMarkers = (employees) => {
    if (!map) return;

    // Remove previous markers from the map
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = []; // Clear marker storage

    // Add new markers
    employees.forEach((employee) => {
      if (employee.latitude && employee.longitude) {
        const lat = Number(employee.latitude);
        const lng = Number(employee.longitude);
        console.log("Adding marker at:", lat, lng);

        const marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            `<b>${employee.firstName} ${employee.lastName}</b><br>${employee.city}, ${employee.country}`
          );

        markersRef.current.push(marker); // Store marker reference
      }
    });
  };

  useEffect(() => {
    if (map) {
      fetchEmployees();
      const interval = setInterval(fetchEmployees, 30000);
      return () => clearInterval(interval);
    }
  }, [map]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        onClick={fetchEmployees}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          padding: "8px 12px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Refresh Employees
      </button>
      <div id="map" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
};

export default EmployeeMap;
