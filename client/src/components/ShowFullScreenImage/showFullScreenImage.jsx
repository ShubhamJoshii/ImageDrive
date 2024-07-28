import React, { useEffect, useRef, useState } from "react";
import "./FullScreenImg.css";
import { saveAs } from "file-saver";
import { FiDownload } from "react-icons/fi";
import { MdOutlineZoomInMap } from "react-icons/md";
const ShowFullScreenImage = ({ image, showImage, setShowImage }) => {
  const downloadImage = (imglink, imageName) => {
    saveAs(imglink, imageName);
  };
  
  const ref = useRef(null);
  const ref2 = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        ref2.current &&
        !ref2.current.contains(event.target)
      ) {
        setShowImage(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return (
    <>
      {image && (
        <div className="zoom-img">
          <div ref={ref2}>
            <FiDownload
              onClick={() => downloadImage(image.image, image.name)}
            />
            <MdOutlineZoomInMap onClick={() => setShowImage("")} />
          </div>
          <img src={image.image} ref={ref} />
        </div>
      )}
    </>
  );
};

export default ShowFullScreenImage;
