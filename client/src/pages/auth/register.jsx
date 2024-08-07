import React, { useContext, useState } from "react";
import axios from "axios";
import "./register.css";
import { toast } from "react-toastify";
import { NavLink, useNavigate } from "react-router-dom";
import { Oval } from "react-loader-spinner";
import { UserDetails } from "../../App";

const Register = () => {
  const [inputData, setInputData] = useState({
    Name: "",
    Email: "",
    Password: "",
    Confirm_Password: "",
  });

  const [lowerValidation, setLowerValidation] = useState(false);
  const [upperValidation, setupperValidation] = useState(false);
  const [numberValidation, setnumberValidation] = useState(false);
  const [specialValidation, setspecialValidation] = useState(false);
  const [lengthValidation, setLengthValidation] = useState(false);
  const [loadingShow, setloadingShow] = useState(false);

  const {checkUserAlreadyLogin, notification } = useContext(UserDetails);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputData({ ...inputData, [name]: value });
    handlePasswordValidation();
  };


  const handlePasswordValidation = (e) => {
    const password = inputData.Password;
    const lower = new RegExp("(?=.*[a-z])");
    const upper = new RegExp("(?=.*[A-Z])");
    const number = new RegExp("(?=.*[0-9])");
    const special = new RegExp("(?=.*[!@#$%^&*])");
    const length = new RegExp("(?=.{8,})");
    lower.test(password) ? setLowerValidation(true) : setLowerValidation(false);
    upper.test(password) ? setupperValidation(true) : setupperValidation(false);
    special.test(password)
      ? setspecialValidation(true)
      : setspecialValidation(false);
    number.test(password)
      ? setnumberValidation(true)
      : setnumberValidation(false);
    length.test(password)
      ? setLengthValidation(true)
      : setLengthValidation(false);
    // console.log(password?.includes(" "));
  };

  const handleInputEmail = (e) => {
    const { name, value } = e.target;
    const isValidInput = /^[A-Za-z\s]+$/.test(value[0]);
    if (isValidInput || value === "") {
      setInputData({ ...inputData, [name]: value });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    let a = document.getElementById("Password");
    let b = document.getElementById("Confirm_Password");
    if (
      inputData.Name &&
      inputData.Email &&
      inputData.Password === inputData.Confirm_Password &&
      lowerValidation &&
      upperValidation &&
      numberValidation &&
      specialValidation &&
      lengthValidation &&
      !inputData.Password?.includes(" ")
    ) {
      setloadingShow(true);
      await axios
        .post("/api/register", inputData)
        .then((response) => {
          if (response.data.result) {
            notification(response.data.message, "Success");
            navigate("/login");
          } else {
            notification(response.data.message, "Un-Success");
          }
          setloadingShow(false);
        })
        .catch((err) => {
          setloadingShow(false);
          console.log(err);
        });
    } else if (inputData.Password?.includes(" ")) {
      a.style.outline = "2px solid red";
      b.style.outline = "none";
      notification("Password does not include any white space", "Warning");
    } else if (lengthValidation) {
      a.style.outline = "2px solid red";
      b.style.outline = "none";
      notification(
        "Password length should be greater than and equal to 8",
        "Warning"
      );
    } else if (inputData.Password !== inputData.Confirm_Password) {
      a.style.outline = "2px solid red";
      b.style.outline = "2px solid red";
      notification("User Password and Confirm Password not Matched", "Warning");
    } else {
      a.style.outline = "none";
      b.style.outline = "none";
      notification("Please Fill Registration Form Properly", "Warning");
    }
  };

  return (
    <div className="Register">
      <div className="auth-inner">
        <h1 id="Register-text">Registration</h1>
        <form>
          <label>
            Fulll Name
            <input
              type="text"
              id="Name"
              name="Name"
              value={inputData.Name}
              placeholder="John"
              autofocus={true}
              className="input-value"
              onChange={handleChange}
            />
          </label>
          <label>
            Email Address
            <input
              type="email"
              id="Email"
              name="Email"
              value={inputData.Email}
              placeholder="me@example.com"
              autofocus={true}
              onChange={handleInputEmail}
              className="input-value"
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
              onChange={handleChange}
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              id="Confirm_Password"
              name="Confirm_Password"
              value={inputData.Confirm_Password}
              placeholder="Enter Confirm Password"
              className="input-value"
              onChange={handleChange}
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
            <button onClick={submit} className="submit-btn">
              Submit
            </button>
          )}
          <p>Already have an account? <NavLink to={"/login"}>Login here</NavLink></p>
        </form>
      </div>
    </div>
  );
};

export default Register;
