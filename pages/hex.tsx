import Layout from "../components/Layout";
import "tailwindcss/tailwind.css";
import { useDropzone } from "react-dropzone";
import { useCallback, useReducer } from "react";
import { saveAs } from "file-saver";

function intToHex(n: number) {
  const hex = (n & 0xff).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

function hexToInt(hex: string) {
  return parseInt(hex, 16);
}

function changeHexValuesInPlace(uint8arr: Uint8Array) {
  const s1 = ["2a", "d7", "b1"];
  let s1Done = false;
  const s2 = ["44", "89"];
  const newHex = ["88", "40", "B0", "7D", "B0", "00"];

  const len = uint8arr.length;

  for (let i = 0; i < len; i++) {
    const hex = intToHex(uint8arr[i]);
    if (!s1Done) {
      if (
        s1[0] === hex &&
        i + 2 < len &&
        s1[1] === intToHex(uint8arr[i + 1]) &&
        s1[2] === intToHex(uint8arr[i + 2])
      ) {
        s1Done = true;
        i += 2;
      }
      continue;
    }

    if (
      s2[0] === hex &&
      i + 1 + 6 < len &&
      s2[1] === intToHex(uint8arr[i + 1])
    ) {
      newHex.forEach((h, k) => {
        const val = hexToInt(h);
        uint8arr[i + 2 + k] = val;
      });
      break;
    }
  }
}

const initialState = { loading: false, downloaded: false, err: "" };
type State = typeof initialState;

type Action =
  | { type: "CONVERSION_INIT" }
  | { type: "CONVERSION_DONE" }
  | { type: "CONVERSION_ERROR"; payload: string };

const flagsReducer = (state: State, action: Action) => {
  switch (action.type) {
    case "CONVERSION_INIT":
      return {
        ...state,
        loading: true,
        downloaded: false,
      };
    case "CONVERSION_DONE":
      return {
        ...state,
        loading: false,
        downloaded: true,
      };
    case "CONVERSION_ERROR":
      return {
        ...state,
        loading: false,
        err: action.payload,
      };
    default:
      throw new Error();
  }
};

const IndexPage = () => {
  const [flags, dispatchFlags] = useReducer(flagsReducer, initialState);
  const onDrop = useCallback(async ([f]: File[]) => {
    dispatchFlags({ type: "CONVERSION_INIT" });
    try {
      const arrBuff = await f.arrayBuffer();
      console.log(arrBuff.byteLength);
      const uint8arr = new Uint8Array(arrBuff);
      changeHexValuesInPlace(uint8arr);
      saveAs(
        new Blob([uint8arr], {
          type: "octet/stream",
        }),
        "tiktok" + f.name
      );
      console.log("save complete");
      dispatchFlags({ type: "CONVERSION_DONE" });
    } catch (err) {
      console.log(err);
      dispatchFlags({ type: "CONVERSION_ERROR", payload: err.message });
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".webm",
  });
  return (
    <Layout title="TikTok Long Video Converter">
      <h1 className="text-4xl mt-8 mb-6">LongTok</h1>
      <ul>
        <li className="mb-4">
          There is a way to upload videos longer than 1 minute to TikTok: &nbsp;
          <a
            className="text-blue-800"
            href="https://www.tiktok.com/@nathan_ham/video/6917287908621749509?lang=en"
          >
            proof
          </a>
        </li>
        <li>
          1. &nbsp;
          <a
            className="text-blue-800"
            href="http://letmegooglethat.com/?q=convert+to+webm"
          >
            Convert your video to webm format
          </a>{" "}
          (if you know how to use ffmpeg, you can do:{" "}
          <code className="bg-gray-200 p-1">
            ffmpeg -i myvideo.mov output.webm
          </code>
          )
        </li>
        <li>
          2.
          {!flags.loading ? (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button className="mb-4 mr-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none">
                upload webm video
              </button>
            </div>
          ) : (
            <div>loading... (this will take a little bit)</div>
          )}
          {flags.downloaded && <div>conversion and download complete</div>}
          {flags.err && <div>Error: {flags.err}</div>}
        </li>
        <li>3. Upload the new video to TikTok's website (NOT the app)</li>
      </ul>
      <div className="mt-32">
        <div>
          <a
            className="text-blue-800"
            href="https://github.com/benawad/longtok"
          >
            View source code for this website
          </a>
        </div>
        <div>
          <a className="text-blue-800" href="https://www.tiktok.com/@benawad">
            Made by Ben Awad
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;
