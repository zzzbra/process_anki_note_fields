const fs = require("fs");
const csvParser = require("csv-parser");

const SOURCE_FILE_NAME = "source.txt";
const TARGET_FILE_NAME = "🐯 한국어__어휘__Retro's Beginner Vocabulary Sentences.txt";

const result = [];

fs.createReadStream(SOURCE_FILE_NAME)
  .pipe(csvParser({
    separator: "\t",
    // escape: "\\"
  }))
  .on("data", (data) => {
    result.push(data);
  })
  .on("end", () => {
    console.log(result);
  });
