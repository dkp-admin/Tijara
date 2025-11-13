import React, { useRef, useState, useEffect } from "react";
import { Camera, Upload, Image as ImageIcon, CheckCircle } from "lucide-react";

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showUploadStatus, setShowUploadStatus] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch((e) => {
          setError("Failed to play video stream: " + e.message);
        });
      };
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      setError("");
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);
      setPermission(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError("Error accessing camera: " + errorMessage);
      setPermission(false);
      console.error("Camera error:", err);
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCaptures((prev) => [...prev, imageData]);
  };

  const uploadImages = async () => {
    if (captures.length === 0) return;

    setShowUploadStatus(true);
    setIsUploading(true);

    const formData = new FormData();
    captures.forEach((capture, index) => {
      const byteString = atob(capture.split(",")[1]);
      const mimeString = capture.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      formData.append(`image${index}`, blob, `capture${index}.jpg`);
    });

    try {
      // const response = await fetch(
      //   "https://webhook.site/d0f185be-2b2d-4c02-9b33-b43ee90776eb",
      //   {
      //     method: "POST",
      //     body: formData,
      //   }
      // );
      // console.log(response.status);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // if (response.ok) {
      setUploadSuccess(true);
      setIsUploading(false);
      // setTimeout(() => {
      //   setShowUploadStatus(false);
      //   setIsUploading(false);
      //   setUploadSuccess(false);
      //   setCaptures([]);
      // }, 3000);
      // }
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Upload failed. Please try again." + (error as Error).message);
      setIsUploading(false);
    }
  };

  // if (!isMobile) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
  //       <div className="p-8 text-center">
  //         <Camera className="w-16 h-16 mx-auto mb-4" />
  //         <h1 className="mb-2 text-2xl font-bold">Mobile Device Required</h1>
  //         <p className="text-gray-400">Please access this application from your mobile phone to use the camera features.</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (showUploadStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
        <div className="p-8 text-center">
          {isUploading ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <h2 className="text-xl font-semibold">Uploading Images...</h2>
              <p className="mt-2 text-gray-400">
                Please wait while we process your images
              </p>
            </>
          ) : uploadSuccess ? (
            <div className="relative">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-ripple"></div>
              <h2 className="text-xl font-semibold text-green-500">
                Image uploaded successfully!
              </h2>
              <h3 className="text-gray-400">
                Stock Inward processing. Check back later.
              </h3>
              {/* <button
                onClick={() => {
                  setShowUploadStatus(false);
                  setUploadSuccess(false);
                }}
                className="px-6 py-2 mt-4 text-white bg-green-500 rounded-lg"
              >
                Back to Camera
              </button> */}
            </div>
          ) : (
            <>
              <div className="mb-4 text-red-500">
                <p>{error || "Something went wrong"}</p>
              </div>
              <button
                onClick={() => setShowUploadStatus(false)}
                className="px-6 py-2 bg-blue-500 rounded-lg"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {!permission ? (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <Camera className="w-16 h-16 mb-4 text-white" />
          <button
            onClick={startCamera}
            className="px-6 py-3 font-semibold text-white bg-blue-500 rounded-lg"
          >
            Allow Camera Access
          </button>
          {error && (
            <p className="px-4 mt-4 text-center text-red-500">{error}</p>
          )}
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="object-cover w-full h-full"
          />

          {error && (
            <div className="absolute top-0 left-0 right-0 p-2 text-center text-white bg-red-500">
              {error}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {/* Preview Button */}
              <button
                className="relative flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full"
                onClick={() => captures.length > 0 && setShowUploadStatus(true)}
              >
                {captures.length > 0 ? (
                  <img
                    src={captures[captures.length - 1]}
                    alt="Last capture"
                    className="object-cover w-10 h-10 rounded-full"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                )}
                {captures.length > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full -top-2 -right-2">
                    {captures.length}
                  </span>
                )}
              </button>

              {/* Capture Button */}
              <button
                onClick={captureImage}
                className="flex items-center justify-center w-16 h-16 bg-white border-4 border-blue-500 rounded-full"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full" />
              </button>

              {/* Upload Button */}
              <button
                onClick={uploadImages}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  captures.length > 0 ? "bg-green-500" : "bg-gray-700"
                }`}
                disabled={captures.length === 0}
              >
                <Upload className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
