import React, { useContext, useState } from "react";
import "./style.css";
import folderImg from "../../assets/folder.png";
import { FaRegImage } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { saveAs } from "file-saver";
import { MdOutlineDelete } from "react-icons/md";

import ShowFullScreenImage from "../ShowFullScreenImage/showFullScreenImage";
import { FolderDetails, UserDetails } from "../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const List = ({ folderData }) => {
  const [showImage, setShowImage] = useState("");
  const { checkUserAlreadyLogin, userData } = useContext(UserDetails);
  const { loading, fetchFiles } = useContext(FolderDetails);
  const navigate = useNavigate();
  const [folder, setFolder] = useState(true);
  const downloadImage = (imglink, imageName) => {
    saveAs(imglink, imageName);
  };

  const deleteFolderImage = async (event, _id, type, imageURL="") => {
    event.stopPropagation();
    console.log(_id);
    if (type === "folder") {
      await axios
        .delete(`/api/folder?id=${_id}&path=${imageURL}`)
        .then((response) => {
          fetchFiles();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      const imageID = "storage" + imageURL.split("storage")[1].replace(/\.[^/.]+$/, "")
      await axios
        .delete(`/api/image?id=${_id}&imageID=${imageID}`)
        .then((response) => {
          fetchFiles();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <div id="listcards">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Details</th>
          </tr>
        </thead>

        {folderData.map((curr, id) => {
          let createdAt = "";
          if (curr.type === "folder") {
            createdAt = curr?.lastUpdate;
            const date = new Date(createdAt);
            const options = { day: "2-digit", month: "long", year: "numeric" };
            createdAt = date.toLocaleDateString("en-GB", options);
          } else {
            createdAt = curr?.ImageURls?.createdAt;
            const date = new Date(createdAt);
            const options = { day: "2-digit", month: "long", year: "numeric" };
            createdAt = date.toLocaleDateString("en-GB", options);
            // console.log(createdAt,curr.lastUpdate)
          }
          return (
            <React.Fragment key={id}>
              {curr.type === "folder" ? (
                <tbody onClick={() => navigate(curr.path)}>
                  <tr>
                    <td>
                      <div>
                        <img src={folderImg} id="folder-image" />
                        <p>{curr.FolderName}</p>
                      </div>
                    </td>
                    <td>
                      <p>MyStorage{curr.path}</p>
                    </td>
                    <td>
                      <div id="details">
                        <img src={userData.Profile} alt="ProfileDP" />
                        <p>Last Modified • {createdAt}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <MdOutlineDelete
                          onClick={(event) =>
                            deleteFolderImage(event, curr._id, "folder", curr.path)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  <tr
                    onDoubleClick={() =>
                      setShowImage({
                        image: curr.ImageURls.URL,
                        name: curr.ImageURls.ImageName,
                      })
                    }
                  >
                    <td>
                      <div>
                        {/* <FaRegImage /> */}
                        <img
                          src={curr.ImageURls.URL}
                          id="folder-image"
                          style={{
                            background: "white",
                            aspectRatio: 1,
                            objectFit: "cover",
                          }}
                        />
                        <p>{curr.ImageURls.ImageName}</p>
                      </div>
                    </td>
                    <td>
                      <p>MyStorage{curr.path !== "/" && curr.path}</p>
                    </td>
                    <td>
                      <div id="details">
                        <img src={userData.Profile} alt="ProfileDP" />
                        <p>Last Modified • {createdAt}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <FiDownload
                          onClick={() =>
                            downloadImage(curr.ImageURls.URL, curr.ImageURls.ImageName)
                          }
                        />
                        <MdOutlineDelete
                          onClick={(event) =>
                            deleteFolderImage(
                              event,
                              curr.ImageURls._id,
                              "image",
                              curr.ImageURls.URL
                            )
                          }
                        />

                        <MdOutlineZoomOutMap
                          onClick={() =>
                            setShowImage({
                              image: curr.ImageURls.URL,
                              name: curr.ImageURls.ImageName,
                            })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}
            </React.Fragment>
          );
        })}
      </table>
      <ShowFullScreenImage
        image={showImage}
        showImage={showImage}
        setShowImage={setShowImage}
      />
    </div>
  );
};

export default List;
