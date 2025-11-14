const fs = require("fs");
const converter = require("json-2-csv");

const localJsonFile = require("../assets/translations/ar.json");
const localKeys = Object.keys(localJsonFile);
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function downloadFile() {
  let url = `https://qa-k8s.tisostudio.com/language-pack?app=web`;
  const res = await fetch(url, {
    method: "GET",
  });

  const data = await res.json();
  const remoteKeys = Object.keys(data?.en);

  let en = [];
  localKeys.map((val) => {
    if (!remoteKeys.includes(val)) {
      en.push({ key: val, english: val });
    }
  });

  converter.json2csv(en, (err, csv) => {
    if (err) {
      throw err;
    }

    fs.writeFileSync("./scripts/unique.csv", csv);
  });
}

downloadFile();
