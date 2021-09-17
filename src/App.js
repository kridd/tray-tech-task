import { useEffect, useState } from "react";
import { ImageList } from "./components/ImageList";
import { Loading } from "./components/Loading";
import { LOADING, ERRORING, SELECT_SHIPS, ALL_CLEAR } from "./consts";
import "./mock-server/server"; // Mocked the server for now, as had CORS issues accessing the API

import "./App.css";

function App() {
  const [status, setStatus] = useState(LOADING);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageList, setImageList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setStatus(LOADING);

      try {
        const images = await fetch("/api/get-ships/")
          .then((response) => response.json())
          .then((data) => data.challenge);

        if (!images.length) {
          // NOTE: If the response doesn't come back as we expect, let's try again.
          // We know the API is flaky, and we should expect it to be malformed, rather
          // then the data be changed.
          fetchData();
          return;
        }

        setImageList(images);
        setStatus(SELECT_SHIPS);
      } catch (error) {
        console.warn("There's been an error:", error);
        console.warn("Retrying fetch ships");
        fetchData();
        // NOTE: We retry here because we expect there to be intermittent issues
        // with the server response that clear quickly.
        // However, we should look to escape this loop because we don't want
        // to spam the server if there are genuine issues (and get stuck in an infinite loop).
        // I've chosen to take that risk here because we have no way of knowing which it
        // is at the moment, and we don't want to present the user with an error message.
        // TODO: Add a timeout before retrying, add a threshold of retries before exiting.
      }
    };

    fetchData();
  }, []);

  const selectImages = (url) => {
    if (!selectedImages.includes(url)) {
      setSelectedImages([...selectedImages, url]);
      return;
    }

    setSelectedImages([...selectedImages.filter((item) => item !== url)]);
  };

  const submit = async () => {
    setStatus(LOADING);
    try {
      const { valid } = await fetch("/api/check-ships", {
        method: "POST",
        body: JSON.stringify({ ships: selectedImages }),
      })
        .then((response) => response.json())
        .then((data) => data);
      console.log({ valid });
      // TODO: If the entry is invalid, we should show the user a message to let them know what's happened.
      setStatus(valid ? ALL_CLEAR : SELECT_SHIPS);
    } catch (error) {
      console.error(error);
      // TODO: We should ideally show a message to the user to let them know
      // they can try to resubmit, or silently retry the request as we have with the get request.
      setStatus(SELECT_SHIPS);
    }
  };

  return (
    <div className="App">
      {status === ERRORING && (
        <p>There's been a problem, let's try again later</p>
      )}

      {status === LOADING && <Loading />}

      {status === SELECT_SHIPS ? (
        <>
          <ImageList
            imageList={imageList}
            selectedImages={selectedImages}
            selectImages={selectImages}
          />
          {selectedImages.length > 0 && (
            <button onClick={submit}>Continue</button>
          )}
        </>
      ) : null}

      {status === ALL_CLEAR && <p>⚓️ Welcome aboard</p>}
    </div>
  );
}

export default App;
