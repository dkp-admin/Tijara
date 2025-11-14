import React, { useEffect, useState } from "react";
import { Invoice } from "@axenda/zatca";
import { User } from "src/types/user";
import QRCode from "qrcode";

export default function OrderQR({
  order,
  user,
  companyContext,
}: {
  order: any;
  user: User;
  companyContext: any;
}) {
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        if (order?.zatcaQR && typeof order.zatcaQR === "string") {
          const qrImage = await QRCode.toDataURL(order.zatcaQR, {
            width: 200,
            margin: 1,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          setImageData(qrImage);
          return;
        }

        // Fallback: Generate QR using @axenda/zatca
        const invoice = new Invoice({
          sellerName: user?.company?.name?.en || companyContext?.name?.en,
          vatRegistrationNumber:
            user?.company?.vat?.docNumber || companyContext?.vat?.docNumber,
          invoiceTimestamp: order?.createdAt
            ? new Date(order?.createdAt)?.toISOString()
            : new Date()?.toISOString(),
          invoiceTotal: order?.payment?.total,
          invoiceVatTotal: order?.payment?.vatAmount || order?.payment?.vat,
        });

        const renderedQR = await invoice.render();
        setImageData(renderedQR);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQR();
  }, [order, user, companyContext]);

  if (!imageData) return null;
  return <img height={100} width={100} src={imageData} alt="QR Code" />;
}
