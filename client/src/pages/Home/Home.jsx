import React, { useContext, useEffect, useState } from "react";
import "./Home.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import { PiListBold } from "react-icons/pi";
import { MdGridView } from "react-icons/md";
import Grid from "../../components/fileStructure/grid";
import List from "../../components/fileStructure/list";

import axios from "axios";
import { FolderDetails, UserDetails } from "../../App";
import { NavLink, useLocation } from "react-router-dom";
import { Oval } from "react-loader-spinner";
const Home = () => {
  const [fileStructure, setFileStructure] = useState(() => {
    const temp = localStorage.getItem("fileStructure") || "grid";
    return temp;
  });

  const location = useLocation();
  const { checkUserAlreadyLogin, userData } = useContext(UserDetails);
  const { folderData, setFolderData,loading,  fetchFiles  } = useContext(FolderDetails);

  const handleStruture = () => {
    fileStructure === "grid"
      ? setFileStructure("list")
      : setFileStructure("grid");
  };

  useEffect(() => {
    fetchFiles();
  }, [userData, location]);

  useEffect(() => {
    localStorage.setItem("fileStructure", fileStructure);
  }, [fileStructure]);

  return (
    <div id="content-inner">
      <h2>My Image Storage</h2>
      <div id="LinkAndStructure">
        <div>
          {location.pathname === "/" ? (
            <NavLink to={"/"}>.../Home</NavLink>
          ) : (
            <>
              {location.pathname.split("/").map((curr, id) => {
                let link = location.pathname.split(`/${curr}`)[0] + `/${curr}`;
                // console.log(curr, link);
                return (
                  <NavLink to={curr === "" ? "/" : link} key={id}>
                    <>{curr === "" ? ".../Home" : "/" + curr}</>
                  </NavLink>
                );
              })}
            </>
          )}
        </div>

        <div id="structure">
          <div
            className={fileStructure === "list" ? "active" : ""}
            onClick={handleStruture}
          >
            <PiListBold />
          </div>
          <div
            className={fileStructure === "grid" ? "active" : ""}
            onClick={handleStruture}
          >
            <MdGridView />
          </div>
        </div>
      </div>
      {userData ? (
        <>
          {loading ? (
            <div>
              <Oval
                height="40"
                width="40"
                color="black"
                wrapperStyle={{ justifyContent: "center" }}
                wrapperClass=""
                visible={true}
                ariaLabel="oval-loading"
                secondaryColor="black"
                strokeWidth={4}
                strokeWidthSecondary={4}
              />
            </div>
          ) : (
            <>
              {folderData.length > 0 ? (
                <div className={fileStructure}>
                  {fileStructure === "grid" ? (
                    <>
                      <Grid folderData={folderData} />
                    </>
                  ) : (
                    <>
                      <List folderData={folderData} />
                    </>
                  )}
                </div>
              ) : (
                <div id="NoFileFound">
                  <h1>No File Found</h1>
                  <p>Create New Folder or Upload File</p>
                  <p>By Using 'New' button or right click</p>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <p style={{ fontSize: "14px", textAlign: "center" }}>
          Sorry,the <b>Image Storage</b> is restricted to registered users only.
          Please <NavLink to={"/register"}>register</NavLink> or{" "}
          <NavLink to={"/login"}>login</NavLink> to continue.
        </p>
      )}
    </div>
  );
};

export default Home;
