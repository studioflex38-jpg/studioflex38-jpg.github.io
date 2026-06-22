const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  try {
    const contentDir = path.join(process.cwd(), '_content');

    if (!fs.existsSync(contentDir)) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([])
      };
    }

    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

    const content = files.map(file => {
      const filePath = path.join(contentDir, file);
      const fileData = fs.readFileSync(filePath, 'utf8');
      const frontMatterMatch = fileData.match(/---([\s\S]*?)---/);

      if (!frontMatterMatch) return null;

      const yaml = frontMatterMatch[1];
      const obj = {};

      yaml.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();

        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(value) && value!== '') value = Number(value);

        obj[key] = value;
      });

      return obj;
    }).filter(Boolean);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(content)
    };

  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify([])
    };
  }
};
