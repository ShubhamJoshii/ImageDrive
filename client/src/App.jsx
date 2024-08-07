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
const FolderDetails = createContext();

function App() {
  const [userData, setUserData] = useState(null);
  const [folderData, setFolderData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const notification = (notiText, type) => {
    if (type === "Success") {
      toast.success(notiText, {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else if (type === "Un-Success") {
      toast.error(notiText, {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      toast.warn(notiText, {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const fetchFiles = async () => {
    if (userData?._id) {
      setLoading(true);
      await axios
        .get(`/api/fetchStorage?path=${location.pathname}`)
        .then((response) => {
          setFolderData(response.data.folderData);
        })
        .catch((err) => {})
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <UserDetails.Provider
      value={{ checkUserAlreadyLogin, userData, setUserData, notification }}
    >
      <FolderDetails.Provider value={{ folderData, setFolderData, loading, fetchFiles }}>
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
      </FolderDetails.Provider>
    </UserDetails.Provider>
  );
}

export default App;
export { UserDetails, FolderDetails };
