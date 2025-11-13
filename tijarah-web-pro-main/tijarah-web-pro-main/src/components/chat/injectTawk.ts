// @ts-nocheck
export default function injectTawk(
  visitorInfo: { name: string; email: string },
  embedURL: string
) {
  if (!window) {
    throw new Error("DOM is unavailable");
  }
  // @ts-ignore
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const tawk = document.getElementById("tawkId");
  if (tawk) {
    return window.Tawk_API;
  }

  Tawk_API.visitor = visitorInfo;

  window.Tawk_API.onLoad = function () {
    window.Tawk_API.setAttributes(
      {
        name: visitorInfo.name,
        email: visitorInfo.email,
      },
      function (error) {
        if (error) console.error("can not set tawk.to attribute", error);
      }
    );
  };

  const script = document.createElement("script");
  script.id = "tawkId";
  script.async = true;
  script.src = embedURL;
  script.charset = "UTF-8";
  script.setAttribute("crossorigin", "*");

  const first_script_tag = document.getElementsByTagName("script")[0];
  if (!first_script_tag || !first_script_tag.parentNode) {
    throw new Error("DOM is unavailable");
  }

  first_script_tag.parentNode.insertBefore(script, first_script_tag);
}
