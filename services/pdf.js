const puppeteer = require('puppeteer');

async function generatePdf(website, pages) {
  const options = {
    ignoreHTTPSErrors: true,
  };

  if (
    !(process.env.NODE_ENV === 'production') &&
    !(process.env.NODE_ENV === 'staging')
  ) {
    options.args = ['--no-sandbox', '--disable-setuid-sandbox'];
  }

  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  const calculatePercentage = (value, total) => {
    if (total > 0) {
      return ((value / total) * 100).toFixed(2) + '%';
    }
    return '0.00%';
  };
  const formatDate = (date) => {
    if (date) {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    return 'Never';
  };

  const content = `
      <html>
        <head>
          <title>PDF Content</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 40px; }
            h1, h2 { color: #333; }
            .container {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
            }
            .text-section, .stats-section {
                flex: 1;
                padding-right: 20px;
            }
            .image-section {
                flex: 1;
            }
            img {
                width: 100%;
                height: auto;
                max-height: 150px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                word-wrap: break-word; /* Allows text to break and wrap onto the next line */
                vertical-align: top; /* Aligns content at the top of the cell */
            }
            th {
                background-color: #f2f2f2;
            }
            .url-cell {
                max-width: 100px; /* Sets a maximum width for URL cells */
            }
            </style>
        </head>
        <body>
          <h1>Website Evaluation Report</h1>
          <div class="container">
            <div class="text-section">
              <p><strong>URL:</strong> ${website.url}</p>
              <p><strong>Status:</strong> ${website.status}</p>
              <p><strong>Last Evaluated:</strong> ${formatDate(
                website.lastEvaluated,
              )}</p>
            </div>
            <div class="image-section">
              ${
                website.previewImage
                  ? `<img src="${website.previewImage}" alt="Preview Image">`
                  : '<p>No image available</p>'
              }
            </div>
          </div>
          <div class="stats-section">
            <h2>Overall Statistics</h2>
            <table>
              <tr><td>Pages without Errors</td><td>${
                website.stats.pagesWithoutErrors
              } (${calculatePercentage(
                website.stats.pagesWithoutErrors,
                website.stats.evaluatedPages,
              )})</td></tr>
              <tr><td>Pages with Errors</td><td>${
                website.stats.pagesWithErrors
              } (${calculatePercentage(
                website.stats.pagesWithErrors,
                website.stats.evaluatedPages,
              )})</td></tr>
              <tr><td>Pages with A Errors</td><td>${
                website.stats.pagesWithAErrors
              } (${calculatePercentage(
                website.stats.pagesWithAErrors,
                website.stats.evaluatedPages,
              )})</td></tr>
              <tr><td>Pages with AA Errors</td><td>${
                website.stats.pagesWithAAErrors
              } (${calculatePercentage(
                website.stats.pagesWithAAErrors,
                website.stats.evaluatedPages,
              )})</td></tr>
              <tr><td>Pages with AAA Errors</td><td>${
                website.stats.pagesWithAAAErrors
              } (${calculatePercentage(
                website.stats.pagesWithAAAErrors,
                website.stats.evaluatedPages,
              )})</td></tr>
              <tr><td>Evaluated Pages</td><td>${
                website.stats.evaluatedPages
              }</td></tr>
            </table>
          </div>
        </body>
      </html>
    `;

  await page.setContent(content, {
    waitUntil: 'networkidle0',
  });
  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();

  return pdf;
}

module.exports = {
  generatePdf,
};
