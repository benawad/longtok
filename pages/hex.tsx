import Layout from "../components/Layout";
import "tailwindcss/tailwind.css";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { saveAs } from "file-saver";

function byteToHexString(uint8arr: Uint8Array) {
  let hexStr = "";
  for (var i = 0; i < uint8arr.length; i++) {
    let hex = (uint8arr[i] & 0xff).toString(16);
    hex = hex.length === 1 ? "0" + hex : hex;
    hexStr += hex;
  }

  return hexStr.toUpperCase();
}

function hexStringToByte(str: string) {
  if (!str) {
    return new Uint8Array();
  }

  var a = [];
  for (var i = 0, len = str.length; i < len; i += 2) {
    a.push(parseInt(str.substr(i, 2), 16));
  }

  return new Uint8Array(a);
}

const IndexPage = () => {
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [err, setErr] = useState("");
  const onDrop = useCallback(async ([f]: File[]) => {
    setLoading(true);
    setDownloaded(false);
    try {
      const arrBuff = await f.arrayBuffer();
      console.log(arrBuff.byteLength);
      let s = byteToHexString(new Uint8Array(arrBuff));
      console.log(s.length);
      const i1 = s.indexOf("2AD7B1");
      console.log({ i1 });
      const i2 = s.indexOf("4489", i1);
      console.log({ i2 });
      const newS = s.slice(0, i2 + 4) + "8840B07DB000" + s.slice(i2 + 4 + 12);
      console.log(newS.length);
      saveAs(
        new Blob([hexStringToByte(newS)], { type: "octet/stream" }),
        "tiktok" + f.name
      );
      console.log("save complete");
      setLoading(false);
      setDownloaded(true);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setErr(err.message);
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
          {!loading ? (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button className="mb-4 mr-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none">
                upload webm video
              </button>
            </div>
          ) : (
            <div>loading... (this will take a little bit)</div>
          )}
          {downloaded && <div>conversion and download complete</div>}
          {err && <div>Error: {err}</div>}
        </li>
        <li>3. Upload the new video to TikTok's website (NOT the app)</li>
      </ul>
    </Layout>
  );
};

export default IndexPage;
