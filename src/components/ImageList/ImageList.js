import "./ImageList.css";

export const ImageList = ({ imageList, selectedImages, selectImages }) => (
  <div className="image-list">
    {imageList.map((image) => (
      <button
        className={`image-item ${
          selectedImages.includes(image) ? "selected" : ""
        }`}
        onClick={() => selectImages(image)}
        key={image}
      >
        <img src={`/assets/ship-detection/${image}`} alt="" />
      </button>
    ))}
  </div>
);
