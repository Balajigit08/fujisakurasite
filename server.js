const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    // Redirect old and bare domains to the new canonical www domain
    const host = req.headers.host;
    if (host === 'fujisakuradev.in' || host === 'www.fujisakuradev.in' || host === 'fujisakuratech.com') {
      res.writeHead(301, {
        Location: `https://www.fujisakuratech.com${req.url}`,
      });
      res.end();
      return;
    }

    handle(req, res);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;

    console.log(
      `> Server ready on port ${process.env.PORT || 3000}`
    );
  });
});