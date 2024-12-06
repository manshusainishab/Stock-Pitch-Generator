import React, { useContext, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Context } from "./index";
import axios from "axios";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://stock-pitch-genrator-backend.onrender.com/api/v1/user/me",
          { withCredentials: true }
        );
        setIsAuthenticated(true);
        setUser(response.data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setUser({});
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={!isAuthenticated ? <Login /> : <Home />}
          ></Route>
          <Route path="/userpage" element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Routes>
        <ToastContainer position="top-center" />
      </Router>
    </>
  );
}

export default App;
