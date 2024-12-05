import React, { useState } from 'react';
import axios from 'axios';

const API_KEY = process.env.REACT_APP_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

const SearchBar = ({ onStockSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      try {
        const response = await axios.get(`${BASE_URL}/search`, {
          params: {
            q: query,
            token: API_KEY,
          },
        });

        if (response.data.result) {
          setSuggestions(response.data.result.slice(0, 5)); // Show top 5 suggestions
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching stock suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (symbol) => {
    setSearchQuery(symbol);
    setSuggestions([]);
    onStockSelect(symbol);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="form-control"
        placeholder="Search for a stock (e.g., AAPL, TSLA)"
        value={searchQuery}
        onChange={handleInputChange}
      />
      {suggestions.length > 0 && (
        <ul className="list-group mt-2">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.symbol}
              className="list-group-item list-group-item-action"
              onClick={() => handleSuggestionClick(suggestion.symbol)}
            >
              {suggestion.description} ({suggestion.symbol})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
