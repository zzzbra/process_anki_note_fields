require('dotenv').config();
const fs = require("fs");
const { parse, transform, stringify } = require("csv");
const { Translate } = require('@google-cloud/translate').v2;
const {
	// PROJECT_ID,
	// LOCATION,
	SOURCE_FILE_NAME,
	TARGET_FILE_NAME,
	KOREAN_EXPRESSION,
	EXPRESSION_MEANING,
	EXPRESSION_AUDIO,
	KOREAN_WORD,
	WORD_MEANING,
	PICTURE,
	// WORD_AUDIO,
	// CREDENTIALS,
} = require('./constants');

/**
 * Parser set up
 */
const parserOptions = {
	columns: true,
	delimiter: "\t",
};
const parser = parse(parserOptions, function (err, records) {
	if (err) {
		console.error("Parsing Error:", err);
	} else {
		console.log("Num records parsed:", records.length);
	}
})

/**
 * Korean Word extraction
 */
const getWord = function (data) {
	const rBoldTag = /<b>(.*?)<\/b>/gi;
	const koreanWord = rBoldTag.exec(data[KOREAN_EXPRESSION]);
	data[KOREAN_WORD] = koreanWord[1];
	return data;
}

const wordTransformer = transform(function (record) {
	return getWord(record)
}, function (err, output) {
	if (err) {
		console.error("Transformer Error:", err);
	}
	return output
});

/**
 * Move image from audio field (if there is one)
 * 
 * Ideally would detect if there _is_ any image in any of the fields, and then move it to the image
 * field
 */
const moveImage = function (data) {
	const rImgTag = /(<img.*?\>)/g;
	const img = rImgTag.exec(data[EXPRESSION_AUDIO]);
	if (img?.length) {
		data[PICTURE] = img[1];
		data[EXPRESSION_AUDIO] = data[EXPRESSION_AUDIO].replace(rImgTag, "");
	}
	console.log({ data });
	return data;
}

const imageTransformer = transform(function (record) {
	return moveImage(record)
}, function (err, output) {
	if (err) {
		console.error("Transformer Error:", err);
	}
	return output
});

/**
 * Translation stuff
 * 
 * TODO: investigate use of Client Lib instead, or v3
 */
const translate = new Translate({
	credentials: JSON.parse(process.env.CREDENTIALS),
	projectId: JSON.parse(process.env.CREDENTIALS).project_id,
});

async function translateText(text) {
	try {
		const [translation] = await translate.translate(text, 'en');
		return translation;
	} catch (error) {
		console.error('GOOGLE API ERROR:', error)
	}
}

const setTranslation = async function (data, sourceField = KOREAN_WORD, targetField = WORD_MEANING) {
	const translation = await translateText(data[sourceField]);
	data[targetField] = translation;
	return data;
}

// Using this 'done' callback was what I had been missing for ages
const dataFetcher = transform(async function (record, done) {
	let recordWithTranslation = record;
	recordWithTranslation = await setTranslation(record, KOREAN_WORD, WORD_MEANING);
	recordWithTranslation = await setTranslation(record, KOREAN_EXPRESSION, EXPRESSION_MEANING);
	done(null, recordWithTranslation);
}, function (err, output) {
	if (err) console.error("Data Fetcher Transformer Error:", err);
	return output;
});

const columns = [
	'Node ID',
  'Korean Word',
  'Word Meaning',
  'Word Audio',
  'Korean Expression',
  'Expression Meaning',
  'Expression Audio',
  'Picture',
  'Hint',
  'Sort',
  'Tags'
];
const stringifier = stringify({ delimiter: "\t" });

const readStream = fs.createReadStream(SOURCE_FILE_NAME);
const writeStream = fs.createWriteStream(TARGET_FILE_NAME);

readStream
	.pipe(parser)
	.pipe(wordTransformer)
	.pipe(imageTransformer)
	.pipe(dataFetcher)
	.pipe(stringifier)
	.pipe(writeStream)
	.on("end", () => console.log('Finished'));

