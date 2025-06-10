const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'src', 'fonts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const regularFont = fs.readFileSync('./Roboto-Regular.ttf');
const boldFont = fs.readFileSync('./Roboto-Bold.ttf');

const regularBase64 = regularFont.toString('base64');
const boldBase64 = boldFont.toString('base64');

fs.writeFileSync(
  path.join(outputDir, 'roboto.js'),
  `export const RobotoRegular = "${regularBase64}";\n` +
  `export const RobotoBold = "${boldBase64}";\n`
);

console.log('Шрифты успешно конвертированы в Base64 и сохранены в src/fonts/roboto.js');