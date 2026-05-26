import { useState } from "react";
import axios from "axios";

function App() {

  const [file, setFile] = useState(null);

  const [data, setData] = useState([]);

  const [insight, setInsight] = useState("");

  const [loading, setLoading] = useState(false);


  // Upload Excel
  const handleUpload = async () => {

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {

      const res = await axios.post(
        "https://supply-chain-analyzer.onrender.com/upload",
        formData
      );

      setData(res.data);

      setInsight("");

    } catch (error) {

      console.log(error);

      alert("File upload failed");

    }

  };


  // Generate AI Insights
  const generateInsights = async () => {

    try {

      setLoading(true);

      const res = await axios.post(
        "https://supply-chain-analyzer.onrender.com/analyze",
        { data }
      );

      setInsight(res.data.answer);

      setLoading(false);

    } catch (error) {

      console.log(error);

      setLoading(false);

      alert("AI analysis failed");

    }

  };


  return (

    <div style={{ padding: "20px" }}>

      <h1>AI Supply Chain Analyzer</h1>


      {/* File Upload */}

      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <button
        onClick={handleUpload}
        style={{ marginLeft: "10px" }}
      >
        Upload
      </button>


      <hr />


      {/* Summary Cards */}

      {
        data.length > 0 && (

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "20px",
            }}
          >

            <div
              style={{
                border: "1px solid black",
                padding: "10px",
              }}
            >
              <h3>Total Products</h3>

              <p>{data.length}</p>
            </div>


            <div
              style={{
                border: "1px solid black",
                padding: "10px",
              }}
            >
              <h3>Low Stock Items</h3>

              <p>
                {
                  data.filter(
                    (item) => item.stock < 20
                  ).length
                }
              </p>
            </div>


            <div
              style={{
                border: "1px solid black",
                padding: "10px",
              }}
            >
              <h3>Total Inventory</h3>

              <p>
                {
                  data.reduce(
                    (total, item) =>
                      total + item.stock,
                    0
                  )
                }
              </p>
            </div>

          </div>

        )
      }


      {/* AI Button */}

      {
        data.length > 0 && (

          <button
            onClick={generateInsights}
            style={{
              marginBottom: "20px",
            }}
          >
            Generate AI Insights
          </button>

        )
      }


      {/* Loading */}

      {
        loading && (
          <p>Generating insights...</p>
        )
      }


      {/* Inventory Table */}

      {
        data.length > 0 && (

          <table border="1" cellPadding="10">

            <thead>

              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {
                data.map((item, index) => (

                  <tr key={index}>

                    <td>{item.product}</td>

                    <td>{item.stock}</td>

                    <td>
                      {
                        item.stock < 20
                          ? "Low Stock"
                          : "In Stock"
                      }
                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>

        )
      }


      {/* AI Insights */}

      {
        insight && (

          <div style={{ marginTop: "20px" }}>

            <h2>AI Insights</h2>

            <pre>{insight}</pre>

          </div>

        )
      }

    </div>

  );

}

export default App;