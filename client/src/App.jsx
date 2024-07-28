import "./App.css";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import Home from "./pages/Home/Home";
import Recent from "./pages/Recent/Recent";
const UserDetails = createContext();

function App() {
  const [userData, setUserData] = useState(null);
  const checkUserAlreadyLogin = async () => {
    await axios
      .get("/api/home")
      .then((result) => {
        if (result.status) {
          // console.log(result.data.data);
          setUserData(result.data.data);
        }
      })
      .catch(() => {});
  };

  return (
    <UserDetails.Provider
      value={{ checkUserAlreadyLogin, userData, setUserData }}
    >
      <Router>
        <ToastContainer />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/myStorage" element={<Home />} />
            <Route path="/recent" element={<Recent />} />
            <Route path="*" element={<Home />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
        </Routes>
      </Router>
    </UserDetails.Provider>
  );
}

export default App;
export { UserDetails };
