const { spawn } = require("child_process");
const http = require("http");
const httpProxy = require("http-proxy");
const net = require("net");
const fs = require("fs");

const JEKYLL_PORT = 4001;
const NEXT_PORT = 3000;
const COMBINED_PORT = 8080;

function startJekyll() {
  const jekyll = spawn("bundle", [
    "exec",
    "jekyll",
    "serve",
    "--port",
    JEKYLL_PORT,
    "--baseurl",
    "",
    "--host",
    "0.0.0.0",
  ]);

  jekyll.stdout.on("data", (data) => {
    console.log(`Jekyll: ${data}`);
  });

  jekyll.stderr.on("data", (data) => {
    console.error(`Jekyll Error: ${data}`);
  });

  jekyll.on("close", (code) => {
    console.log(`Jekyll process exited with code ${code}`);
  });
}

function startNext() {
  const next = spawn("npx", ["next", "dev", "-p", NEXT_PORT]);

  next.stdout.on("data", (data) => {
    console.log(`Next.js: ${data}`);
  });

  next.stderr.on("data", (data) => {
    console.error(`Next.js Error: ${data}`);
  });

  next.on("close", (code) => {
    console.log(`Next.js process exited with code ${code}`);
  });
}

function checkServiceAvailability(port, host) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function createProxyServer() {
  const proxy = httpProxy.createProxyServer();

  const server = http.createServer((req, res) => {
    const jekyllTarget = `http://0.0.0.0:${JEKYLL_PORT}`;
    const nextTarget = `http://localhost:${NEXT_PORT}`;
    const nextSegments = ["/_next", "/api", "/assets", "/articles", "/laws"];

    if (nextSegments.some((segment) => req.url.startsWith(segment))) {
      console.log("Proxying to Next.js", req.url);
      proxy.web(req, res, { target: nextTarget }, (err) => {
        console.error("Error proxying to Next.js:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy error");
      });
    } else {
      console.log("Proxying to Jekyll", req.url);
      proxy.web(req, res, { target: jekyllTarget }, (err) => {
        console.error("Error proxying to Jekyll:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy error");
      });
    }
  });

  server.listen(COMBINED_PORT, () => {
    console.log(
      `Combined dev server running on http://localhost:${COMBINED_PORT}`
    );
  });
}

function getContentType(ext) {
  const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  return contentTypes[ext] || "application/octet-stream";
}

async function startDevMode() {
  console.log("Starting Jekyll...");
  startJekyll();

  console.log("Starting Next.js...");
  startNext();

  console.log("Waiting for services to be available...");
  while (
    !(await checkServiceAvailability(JEKYLL_PORT, "0.0.0.0")) ||
    !(await checkServiceAvailability(NEXT_PORT, "localhost"))
  ) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("Services are available. Setting up proxy server...");
  createProxyServer();
}

startDevMode().catch((error) => {
  console.error("Failed to start development mode:", error);
  process.exit(1);
});
