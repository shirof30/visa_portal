const next = require("next");
const http = require("http");

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res);
  }).listen(port, "0.0.0.0", () => {
    console.log("Next.js running on port", port);
  });
});
