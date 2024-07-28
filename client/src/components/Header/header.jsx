import React, { useContext, useEffect, useRef, useState } from "react";
import "./header.css";
import SearchBar from "../SearchBar/SearchBar";
import { LuLogIn, LuLogOut } from "react-icons/lu";
import { MdOutlineEdit } from "react-icons/md";
import { UserDetails } from "../../App";
import axios from "axios";
import convertBase64 from "../convertBase64";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const { checkUserAlreadyLogin, userData } = useContext(UserDetails);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAlreadyLogin();
  }, []);

  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowDetails(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const uploadImage = async (e) => {
    // console.log(e.target.files[0]);
    setImageUploading(true);
    const base64 = await convertBase64(e.target.files[0]);
    await axios
      .post("/api/updateProfileDP", { image: base64, folder: "ProfileImage" })
      .then(async (response) => {
        console.log(response.data);
        checkUserAlreadyLogin();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const logout = async () => {
    await axios
      .get("/api/logout")
      .then((response) => {
        console.log(response.data.message);
        checkUserAlreadyLogin();
        location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <header>
      <SearchBar />
      <div id="user">
        <img
          src={
            userData?.Profile ||
            "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
          }
          alt="Profile"
          onClick={() => setShowDetails(!showDetails)}
        />
        {showDetails && (
          <div id="userDetails" ref={ref}>
            {userData ? (
              <>
                <p>{userData?.Email}</p>
                <div id="profileImage">
                  <img
                    src={
                      userData?.Profile ||
                      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                    }
                    alt="Profile"
                  />
                  <label htmlFor="Profile">
                    <MdOutlineEdit />
                  </label>
                  <input
                    type="file"
                    name="Profile"
                    id="Profile"
                    onChange={uploadImage}
                  />
                </div>
                <h3>Hi, {userData?.Name}!</h3>
                <button onClick={logout}>
                  <LuLogOut />
                  <p>Sign out</p>
                </button>
              </>
            ) : (
              <>
                <h3>Hey, New User!</h3>
                <div id="profileImage">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                    alt="Profile"
                  />
                </div>
                <br />
                <button onClick={() => navigate("/login")}>
                  <LuLogIn />
                  <p>Login </p>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
