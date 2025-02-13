import React, { useState } from "react";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    employeeID: "",
    designation: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch activation code
      const activationRes = await fetch(
        "https://api.findofficers.com/hiring_test/get_activation_code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!activationRes.ok) throw new Error("Failed to fetch activation code");

      const activationData = await activationRes.json();
      if (!activationData.activationCode)
        throw new Error("Activation code is missing");

      const activationCode = activationData.activationCode;

      // Prepare employee data
      const employeeData = { ...formData, activationCode };

      // Post employee data
      const response = await fetch(
        "https://api.findofficers.com/hiring_test/add_employee",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employeeData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert("Employee added successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          employeeID: "",
          designation: "",
          city: "",
          country: "",
          latitude: "",
          longitude: "",
        });
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("Failed to add employee. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        position: "relative",
      }}
    >
      {/* Button placed outside the parent */}
      <button
        style={{
          position: "fixed",
          top: "30px",
          right: "30px",
          padding: "10px 16px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontSize: "14px",
          cursor: "pointer",
          textDecoration: "none",
          zIndex: 1000, // To make sure it's on top of other elements
        }}
        onClick={() =>
          (window.location.href = "https://apifetching-rosy.vercel.app/")
        } // Replace with your link
      >
        All Employees List
      </button>

      <div
        style={{
          padding: "20px",
          maxWidth: "600px",
          width: "100%",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#333",
          }}
        >
          Add New Employee
        </h1>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {Object.keys(formData).map((key, index) => {
            if (index % 2 === 0) {
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    gap: "15px",
                    flexDirection: "row",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      flex: 1,
                    }}
                  >
                    <label
                      style={{
                        fontWeight: "600",
                        color: "#555",
                        textTransform: "capitalize",
                      }}
                    >
                      {key.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                      required
                      style={{
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        fontSize: "16px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  {Object.keys(formData)[index + 1] && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        flex: 1,
                      }}
                    >
                      <label
                        style={{
                          fontWeight: "600",
                          color: "#555",
                          textTransform: "capitalize",
                        }}
                      >
                        {Object.keys(formData)[index + 1].replace(
                          /([A-Z])/g,
                          " $1"
                        )}
                      </label>
                      <input
                        type="text"
                        name={Object.keys(formData)[index + 1]}
                        value={formData[Object.keys(formData)[index + 1]] || ""}
                        onChange={handleChange}
                        required
                        style={{
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #ddd",
                          fontSize: "16px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
          <button
            type="submit"
            style={{
              padding: "12px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "20px",
              transition: "background-color 0.3s",
            }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
