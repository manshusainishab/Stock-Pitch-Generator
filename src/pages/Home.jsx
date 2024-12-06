import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Context } from "../index";
import { IoLogOut } from "react-icons/io5";
import { confirmAlert } from "react-confirm-alert";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import SearchBar from "../components/SearchBar";
import {
  fetchStockMetrics,
  fetchStockHistory,
  fetchRelatedNews,
} from "../services/stockService";
import axios from "axios";
import { toast } from "react-toastify";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Home() {

    const { isAuthenticated, setIsAuthenticated } = useContext(Context);
    const navigateTo = useNavigate();
  const [selectedStock, setSelectedStock] = useState("");
  const [stockMetrics, setStockMetrics] = useState(null);
  const [stockHistory, setStockHistory] = useState(null);
  const [stockNews, setStockNews] = useState([]);
  const [isGraphGenerated, setIsGraphGenerated] = useState(false);
  const [isNewsFetched, setIsNewsFetched] = useState(false);
  const [stockPitch, setStockPitch] = useState("");

  const handleStockSelect = async (symbol) => {
    setSelectedStock(symbol);
    setIsGraphGenerated(false);
    setStockHistory(null);
    setStockNews([]);
    setIsNewsFetched(false);
    setStockPitch("");

    const metrics = await fetchStockMetrics(symbol);
    setStockMetrics(metrics);
  };

  const handleGenerateGraph = async () => {
    if (selectedStock) {
      const history = await fetchStockHistory(selectedStock);
      setStockHistory(history);
      setIsGraphGenerated(true);
    }
  };

  const handleFetchNews = async () => {
    if (selectedStock) {
      const news = await fetchRelatedNews(selectedStock);
      setStockNews(news);
      setIsNewsFetched(true);
    }
  };

  const generateStockPitch = () => {
    if (!stockMetrics || !stockHistory || !stockNews) return;

    const { marketCap, peRatio, eps, dividendYield } = stockMetrics;
    const priceGrowth =
      stockHistory.prices[stockHistory.prices.length - 1] -
      stockHistory.prices[0];
    const growthPotential =
      priceGrowth > 0
        ? "positive growth potential"
        : "negative growth potential";

    let risks = [];
    stockNews.forEach((news) => {
      if (news.headline.includes("decline") || news.headline.includes("drop")) {
        risks.push(
          `Risk: Potential decline in stock price due to negative news: ${news.headline}`
        );
      }
    });

    const pitch = `
  Stock: ${selectedStock}
  
  1. Financial Overview:
  - Market Capitalization: ${marketCap}
  - P/E Ratio: ${peRatio}
  - Earnings Per Share (EPS): ${eps}
  - Dividend Yield: ${dividendYield}

  1. Based on the financial data, ${selectedStock} shows a ${
      peRatio > 20 ? "high" : "moderate"
    } P/E ratio, indicating that it is 
  ${
    peRatio > 20 ? "potentially overvalued" : "reasonably valued"
  } in the current market. The earnings per share (EPS) 
  of ${eps} suggests that the company is ${
      eps > 3
        ? "generating strong profits"
        : "facing some profitability challenges"
    }. 
  The dividend yield of ${dividendYield}% reflects the company’s approach to returning value to shareholders, which is 
  ${
    dividendYield > 1 ? "attractive" : "relatively low"
  } for income-seeking investors.

  2. Growth Potential:
  ${
    growthPotential
      ? `The stock has shown ${growthPotential}, indicating strong momentum in the market.`
      : "The stock is currently experiencing mixed performance with no clear growth trend."
  }
  
  With the company's ongoing innovation in [insert relevant sector/technology], there is significant potential for growth. 
  However, market fluctuations or external factors like [insert specific influences, e.g., global demand, tech trends] could affect 
  this trajectory in the near future.

  3. Risks:
  ${
    risks.length > 0
      ? `Some of the key risks include:\n- ${risks.join("\n- ")}`
      : "Currently, there are no significant risks identified."
  }
  Key factors to monitor include potential changes in [market trends, regulations, etc.] or any emerging challenges in the 
  company's core business areas.
  
  #Conclusion:
  In conclusion, while ${selectedStock} presents a ${
      peRatio > 20 ? "risky" : "promising"
    } investment opportunity, it’s 
  important to keep an eye on [market trends, economic conditions] for any potential shifts in the company's growth 
  trajectory.
`;

    setStockPitch(pitch);
  };

  const chartData = stockHistory
    ? {
        labels: stockHistory.dates,
        datasets: [
          {
            label: "Stock Price",
            data: stockHistory.prices,
            borderColor: "rgba(75,192,192,1)",
            fill: false,
          },
        ],
      }
    : null;

    const handleLogout = () => {
        confirmAlert({
          title: "Confirm to log out",
          message: "Are you sure you want to log out?",
          buttons: [
            {
              label: "Yes",
              onClick: async () => {
                try {
                  const response = await axios.get(
                    "http://localhost:8000/api/v1/user/logout",
                    {
                      withCredentials: true,
                    }
                  );
    
                  if (response.status === 200) {
                    console.log("loggedOut")
                    toast.success(response.data.message);
                    setIsAuthenticated(false);
                    navigateTo("/login");
                  }
                } catch (err) {
                  toast.error(err.response?.data?.message || "Logout failed");
                }
              },
              style: {
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "8px 16px",
                fontSize: "14px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              },
            },
            {
              label: "No",
              onClick: () => console.log("Logout canceled"),
              style: {
                backgroundColor: "#f44336",
                color: "white",
                padding: "8px 16px",
                fontSize: "14px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              },
            },
          ],
        });
      };
      //
    
     

  return (
    <>
      <div className="App container mt-5">
        <h1 className="text-center">Stock Pitch Generator</h1>
        <div className="logoutBtnDiv" title="Logout">
              <button className="logoutBtn btn" onClick={handleLogout}>
                <IoLogOut />
              </button>
            </div>
        <SearchBar onStockSelect={handleStockSelect} />
        {selectedStock && (
          <div className="mt-4">
            <h3>Selected Stock: {selectedStock}</h3>
            {stockMetrics ? (
              <div>
                <p>
                  <strong>Market Cap:</strong> {stockMetrics.marketCap}
                </p>
                <p>
                  <strong>P/E Ratio:</strong> {stockMetrics.peRatio}
                </p>
                <p>
                  <strong>EPS:</strong> {stockMetrics.eps}
                </p>
                <p>
                  <strong>Dividend Yield:</strong> {stockMetrics.dividendYield}
                </p>
              </div>
            ) : (
              <p>Loading stock metrics...</p>
            )}

            <button
              className="btn btn-primary mt-4"
              onClick={handleGenerateGraph}
            >
              Generate Graph
            </button>

            {isGraphGenerated && stockHistory ? (
              <div>
                <h4>Historical Performance:</h4>
                {chartData && <Line data={chartData} />}
              </div>
            ) : (
              <p>Click the button to generate the graph.</p>
            )}

            <button className="btn btn-info mt-4" onClick={handleFetchNews}>
              Fetch Stock News
            </button>

            {isNewsFetched && stockNews.length > 0 ? (
              <div className="mt-4">
                <h4>Related News:</h4>
                <ul>
                  {stockNews.map((news, index) => (
                    <li key={index}>
                      <a
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {news.headline}
                      </a>
                      <p>{news.summary}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : isNewsFetched ? (
              <p>No News available about this company recently</p>
            ) : (
              <p>Click On Fetch Stock News To Generate Past 2 Days News</p>
            )}

            <button
              className="btn btn-warning mt-4"
              onClick={generateStockPitch}
            >
              Generate Stock Pitch
            </button>

            {stockPitch && (
              <div className="mt-4">
                <h4>Generated Stock Pitch:</h4>
                <pre>{stockPitch}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
