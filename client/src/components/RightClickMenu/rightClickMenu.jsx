import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ContextMenuTrigger,
  ContextMenu,
  ContextMenuItem,
} from "rctx-contextmenu";
import "./RightClickMenu.css";
import { MdCreateNewFolder } from "react-icons/md";
import { LuFileUp } from "react-icons/lu";
import axios from "axios";
import { useLocation } from "react-router-dom";
import convertBase64 from "../convertBase64";
import { FolderDetails, UserDetails } from "../../App";

const RightClickMenu = ({ showRightClickMenu, setRightClickMenu }) => {
  const [popUp, setpopUp] = useState(null);
  const [folderName, setFolderName] = useState("Untitled folder");
  const ref = useRef(null);
  const ref2 = useRef(null);
  const location = useLocation();
  const { checkUserAlreadyLogin, notification } = useContext(UserDetails);
  const { fetchFiles } = useContext(FolderDetails);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setRightClickMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref2.current && !ref2.current.contains(event.target)) {
        // setRightClickMenu(false);
        setpopUp(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref2]);

  const fileInputRef = useRef(null);

  const handleLabelClick = () => {
    fileInputRef.current.click();
  };

  const createFolder = async (e) => {
    e.preventDefault();
    await axios
      .post("/api/createFolder", {
        path: location.pathname,
        folderName,
      })
      .then((response) => {
        notification(response.data.message, "Success");
        setpopUp(null)
        fetchFiles();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const uploadImage = async (e) => {
    e.preventDefault();
    const base64 = await convertBase64(e.target.files[0]);
    const name = e.target.files[0].name;
    console.log(name);
    await axios
      .post("/api/uploadImage", {
        path: location.pathname,
        image: base64,
        ImageName: name,
      })
      .then((response) => {
        console.log(response.data);
        notification(response.data.message, "Success");
        fetchFiles();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <ContextMenu id="my-context-menu-1" className="RightClickMenu">
        <ContextMenuItem onClick={() => setpopUp("New Folder")}>
          <MdCreateNewFolder />
          <p>New Folder</p>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleLabelClick}>
          <LuFileUp />
          <p>File Upload</p>
        </ContextMenuItem>
      </ContextMenu>
      <input
        type="file"
        ref={fileInputRef}
        name="Image2"
        id="Image2"
        accept="image/*"
        onChange={uploadImage}
      />

      {showRightClickMenu && (
        <div className="RightClickMenu" ref={ref}>
          <div>
            <MdCreateNewFolder />
            <p>New Folder</p>
          </div>
          <div onClick={handleLabelClick}>
            <LuFileUp />
            <p>File Upload</p>
          </div>
        </div>
      )}

      {popUp === "New Folder" && (
        <div id="New-Folder">
          <form ref={ref2} onSubmit={createFolder}>
            <h1>New folder</h1>
            <input
              type="text"
              name="FolderName"
              id="FolderName"
              accept="image/*"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
            <div>
              <input
                type="button"
                value="Cancel"
                onClick={() => setpopUp(null)}
              />
              <input type="submit" value="Create" />
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default RightClickMenu;
