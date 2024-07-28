import React, { useContext, useState } from "react";
import "./style.css";
import folderImg from "../../assets/folder.png";
import { FaRegImage } from "react-icons/fa";
import ShowFullScreenImage from "../ShowFullScreenImage/showFullScreenImage";
import { UserDetails } from "../../App";
import { useNavigate } from "react-router-dom";

const Grid = ({folderData}) => {
  const [showImage, setShowImage] = useState("");
  const { checkUserAlreadyLogin, userData } = useContext(UserDetails);
  const navigate = useNavigate();
  
  return (
    <>
    {
      folderData.map((curr)=>{
        let createdAt = curr?.ImageURls?.createdAt;
        const date = new Date(createdAt);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        createdAt = date.toLocaleDateString('en-GB', options);
        // console.log(createdAt);
        return(
          <>
            {curr.type === "folder" ? (
              <div id="folder" onClick={()=>navigate(curr.path)}>
                <div id="gridcards">
                  <div id="folder-name">
                    <p>{curr.FolderName}</p>
                  </div>
                  <img src={folderImg} id="folder-image" />
                </div>
              </div>
            ) : (
              <div id="gridcards">
                <div>
                  <FaRegImage />
                  <p>{curr.ImageURls.ImageName}</p>
                </div>
                <img
                  src={curr.ImageURls.URL}
                  alt={curr.ImageURls.ImageName}
                  id="Stored-image"
                  onClick={() =>
                    setShowImage({image:curr.ImageURls.URL, name:curr.ImageURls.ImageName})
                  }
                />
                <div id="details">
                  <img src={userData.Profile} />
                  <p>You created • {createdAt}</p>
                </div>
              </div>
            )}
          </>
        )
      })
    }
    <ShowFullScreenImage
      image={showImage}
      showImage={showImage}
      setShowImage={setShowImage}
    />
    </>
  );
};

export default Grid;
