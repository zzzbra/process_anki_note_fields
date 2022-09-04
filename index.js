const fs = require("fs");
const csvParser = require("csv-parser");

const SOURCE_FILE_NAME = "source.txt";
const TARGET_FILE_NAME = "🐯 한국어__어휘__Retro's Beginner Vocabulary Sentences.txt";

// Field Names
const KOREAN_EXPRESSION = "Korean Expression";
const EXPRESSION_MEANING = "Expression Meaning";
const KOREAN_WORD = "Korean Word";
const WORD_MEANING = "Word Meaning";

const result = [];
let failCount = 0;

const getWord = function (data) {
	const rBoldTag = /<b>(.*?)<\/b>/gi;
	const koreanWord = rBoldTag.exec(data[KOREAN_EXPRESSION]);
	data[KOREAN_WORD] = koreanWord[1];
}

// only call once
const flag = true;

const getTranslation = function (data, sourceField = KOREAN_WORD, targetField = WORD_MEANING) {
	if (flag) {
		// Make Google translate request here
		
		flag = false;
	}
}

// [x] parse out the bolded word from the expression and add it to the Korean Word field
// [ ] hit some API requesting a translation of the word and add it to the Word Meaning Field
// [ ] hit some API requesting a translation of the expressiong and add it to the Expression Meaning Field

// We'll add the audio within Anki later -> but if we did it here, could possibly randomize which 
// voice we pick, which would be fun
const handleData = function (data) {
	getWord(data);

	result.push(data);
}

fs.createReadStream(SOURCE_FILE_NAME)
  .pipe(csvParser({
    separator: "\t",
  }))
  .on("data", handleData)
  .on("end", () => {
    // console.log(result);
		console.log('first: ', result[0]);
  });
