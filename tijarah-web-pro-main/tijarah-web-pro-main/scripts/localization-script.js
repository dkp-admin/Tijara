const fs = require("fs");

const fetchData = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function downloadFile() {
  let url = `https://qa-k8s.tisostudio.com/language-pack?app=web`;
  const res = await fetchData(url, {
    method: "GET",
  });

  const data = await res.json();

  fs.writeFile(
    "assets/translations/en.json",
    JSON.stringify(data["en"]),
    "utf8",
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("Added to en.json");
    }
  );

  fs.writeFile(
    "assets/translations/ar.json",
    JSON.stringify(data["ar"]),
    "utf8",
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("Added to ar.json");
    }
  );

  fs.writeFile(
    "assets/translations/ur.json",
    JSON.stringify(data["ur"]),
    "utf8",
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("Added to ur.json");
    }
  );
}

downloadFile();
