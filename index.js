const fs = require("fs");
const csvParser = require("csv-parser");

const SOURCE_FILE_NAME = "source.txt";
const TARGET_FILE_NAME = "🐯 한국어__어휘__Retro's Beginner Vocabulary Sentences.txt";

const result = [];


// 1. parse out the bolded word from the expression and add it to the Korean Word field
// 2. hit some API requesting a translation of the word and add it to the Word Meaning Field
// 3. hit some API requesting a translation of the expressiong and add it to the Expression Meaning Field

// We'll add the audio within Anki later -> but if we did it here, could possibly randomize which 
// voice we pick, which would be fun
const handleData = function (data) {
	

	result.push(data);
}

fs.createReadStream(SOURCE_FILE_NAME)
  .pipe(csvParser({
    separator: "\t",
  }))
  .on("data", handleData)
  .on("end", () => {
    console.log(result);
  });
