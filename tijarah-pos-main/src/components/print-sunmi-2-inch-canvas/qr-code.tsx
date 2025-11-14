import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import fs from "react-native-fs";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";

export default function QRCodeComponent({
  onChange,
  qrData,
}: {
  onChange: any;
  qrData: string;
}) {
  const captureRef = useRef() as any;
  const [base64String, setBase64String] = useState(null);

  useEffect(() => {
    (async () => {
      if (captureRef.current) {
        const imageUri = await captureRef.current.capture({
          result: "tmpfile",
          width: 1000,
        });
        const base64: any = await fs.readFile(imageUri, "base64");
        setBase64String(base64);
      }
    })();
  }, [captureRef.current]);

  useEffect(() => {
    if (base64String) {
      onChange(base64String);
    }
  }, [base64String]);

  return (
    <ViewShot
      ref={captureRef}
      style={{
        position: "absolute",
        alignItems: "center",
        backgroundColor: "#fff",
        maxWidth: 400,
        direction: "ltr", // Disable automatic RTL flip
      }}
    >
      {qrData !== "" && (
        <View style={{ alignItems: "center" }}>
          <QRCode size={170} value={qrData} />
          <View style={{ height: 25 }} />
        </View>
      )}
    </ViewShot>
  );
}
