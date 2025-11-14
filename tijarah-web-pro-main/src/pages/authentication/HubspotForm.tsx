// components/forms/HubspotForm.tsx
import React, { useEffect } from "react";
declare global {
  interface Window {
    hbspt: any;
  }
}

const HubspotContactForm = ({
  region,
  portalId,
  formId,
  scriptSrc,
  cotainerID,
}: {
  region: string;
  portalId: string;
  formId: string;
  scriptSrc: string;
  cotainerID: string;
}) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = scriptSrc;
    document.body.appendChild(script);

    script.addEventListener("load", () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          region: region,
          portalId: portalId,
          formId: formId,
          target: `#${cotainerID}`,
        });
      }
    });
  }, []);

  return (
    <div>
      <div id={cotainerID}></div>
    </div>
  );
};

export default HubspotContactForm;
