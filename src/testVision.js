
// process.env.GOOGLE_APPLICATION_CREDENTIALS = '../config/google-vision-key.json';
const vision = require('@google-cloud/vision');
// Creates a client
const client = new vision.ImageAnnotatorClient();

async function run() {
  const [result] = await client.labelDetection('./test.jpg');
  const labels = result.labelAnnotations;

  console.log('Labels:');
  labels.forEach(label => console.log(label.description));
}

run();