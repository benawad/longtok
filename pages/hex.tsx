import Layout from "../components/Layout";
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
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".webm",
  });
  return (
    <Layout title="TikTok Long Video Converter">
      <div style={{ display: "flex" }}>
        <div style={{ margin: "auto" }}>
          <div style={{ marginTop: 20 }}>
            This only supports webm videos currently, if your video is in
            another format,{" "}
            <a href="http://letmegooglethat.com/?q=convert+to+webm">
              convert it first
            </a>
            .
          </div>
          {!loading ? (
            <div {...getRootProps({ style: { padding: 40 } })}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
              )}
            </div>
          ) : (
            <div>loading... (this will take a little bit)</div>
          )}
          {downloaded && (
            <div>
              conversion and download complete (make sure to upload the video
              using TikTok's website NOT the app)
            </div>
          )}
          {err && <div>Error: {err}</div>}
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;
