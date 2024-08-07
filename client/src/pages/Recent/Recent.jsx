import React, { useContext, useEffect, useState } from "react";
import "./Recent.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import { PiListBold } from "react-icons/pi";
import { MdGridView } from "react-icons/md";
import Grid from "../../components/fileStructure/grid";
import List from "../../components/fileStructure/list";

import axios from "axios";
import { UserDetails } from "../../App";
import { NavLink, useLocation } from "react-router-dom";
import { Oval } from "react-loader-spinner";
const Recent = () => {
  const [fileStructure, setFileStructure] = useState(() => {
    const temp = localStorage.getItem("fileStructure") || "grid";
    return temp;
  });
  const [folderData, setFolderData] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const { checkUserAlreadyLogin, userData } = useContext(UserDetails);

  const handleStruture = () => {
    fileStructure === "grid"
      ? setFileStructure("list")
      : setFileStructure("grid");
  };

  useEffect(() => {
    fetchFiles();
  }, [userData, location]);

  const fetchFiles = async () => {
    if (userData?._id) {
      setLoading(true);
      await axios
        .get(`/api/recentPhotos`)
        .then((response) => {
          setFolderData(response.data.folderData);
        })
        .catch((err) => {})
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    localStorage.setItem("fileStructure", fileStructure);
  }, [fileStructure]);

  return (
    <div id="content-inner">
      <h2>My Image Storage</h2>
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
              {folderData?.length > 0 ? (
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

export default Recent;
