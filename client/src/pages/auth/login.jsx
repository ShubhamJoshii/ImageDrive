import React, { useContext, useEffect, useState } from "react";
import "./login.css";
import axios from "axios";
import { toast } from "react-toastify";
import { NavLink, useNavigate } from "react-router-dom";
import { Oval } from "react-loader-spinner";
import {UserDetails} from "../../App"

const Login = () => {
  const [inputData, setInputData] = useState({
    Email: "",
    Password: "",
  });
  const [loadingShow, setloadingShow] = useState(false);

  const {checkUserAlreadyLogin, notification } = useContext(UserDetails);
  const navigate = useNavigate();


  const submit = async (e) => {
    e.preventDefault();
    if (
      inputData.Email &&
      inputData.Password.length >= 8 &&
      !inputData.Password.includes(" ")
    ) {
      setloadingShow(true);
      await axios
        .post("/api/login", inputData)
        .then((response) => {
          if (response.data.result) {
            notification(response.data.message, "Success");
            setTimeout(() => {
              // checkUserAlreadyLogin();
              navigate("/");
            }, 1000);
          } else {
            notification(response.data.message, "Un-Success");
          }
          setTimeout(() => {
            setloadingShow(false);
          }, 1000);
        })
        .catch((err) => {
          setloadingShow(false);
        });
    } else if (inputData.Password.includes(" ")) {
      notification(
        "User Password is does not Include any white space",
        "Warning"
      );
    } else if (inputData.Password.length < 8) {
      notification("Entered Password is less then 8", "Warning");
    }
  };

  const handleInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputData({ ...inputData, [name]: value });
  };

  return (
    <div className="login">
      <div className="auth-inner">
        <h1 id="login-text">Log In</h1>
        <form onSubmit={submit}>
          <label>
            Email Address
            <input
              type="email"
              id="Email"
              name="Email"
              placeholder="me@example.com"
              autoFocus={true}
              value={inputData.Email}
              className="input-value"
              onChange={handleInput}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              id="Password"
              name="Password"
              value={inputData.Password}
              placeholder="Enter Password"
              className="input-value"
              onChange={handleInput}
              required
            />
          </label>

          {loadingShow ? (
            <Oval
              height="26"
              width=""
              color="white"
              wrapperStyle={{}}
              wrapperClass="submit-btn-loading"
              visible={true}
              ariaLabel="oval-loading"
              secondaryColor="white"
              strokeWidth={8}
              strokeWidthSecondary={8}
            />
          ) : (
            <input type="submit" value="Submit" className="submit-btn" />
          )}
          <p>Dont have an account? <NavLink to={"/register"}>Register</NavLink></p>
        </form>
      </div>
    </div>
  );
};

export default Login;
