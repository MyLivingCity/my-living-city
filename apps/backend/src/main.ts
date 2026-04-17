import { readFile } from "fs";

readFile("./package.json", "utf-8", (err, data) => {
  if (err) throw err;

  console.log("Reading package.json");
  console.log(data);
});

console.log("Successfully ran backend entrypoint!");
