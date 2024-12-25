const { spawn } = require("child_process");
const http = require("http");
const httpProxy = require("http-proxy");
const net = require("net");

const JEKYLL_PORT = 4001;
const NEXT_PORT = 3000;
const COMBINED_PORT = 8080;

function spawnProcess(command, args, name) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    process.stdout.on("data", (data) => console.log(`${name}: ${data}`));
    process.stderr.on("data", (data) =>
      console.error(`${name} Error: ${data}`)
    );
    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${name} exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

function startJekyll() {
  console.log("Starting Jekyll (serving built files)...");
  return spawnProcess(
    "npx",
    ["http-server", "_site", "-p", JEKYLL_PORT, "--cors", "-a", "0.0.0.0"],
    "Jekyll"
  );
}

function startNext() {
  console.log("Starting Next.js (in production mode)...");
  return spawnProcess("npx", ["next", "start", "-p", NEXT_PORT], "Next.js");
}

function checkServiceAvailability(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
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
    socket.connect(port, "127.0.0.1");
  });
}

async function waitForServices() {
  console.log("Waiting for services to be available...");
  let attempts = 0;
  const maxAttempts = 30; // Максимальное количество попыток (30 секунд)

  while (attempts < maxAttempts) {
    const jekyllReady = await checkServiceAvailability(JEKYLL_PORT);
    const nextReady = await checkServiceAvailability(NEXT_PORT);

    if (jekyllReady && nextReady) {
      console.log("All services are available.");
      return;
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Services did not become available in time");
}

function createProxyServer() {
  const proxy = httpProxy.createProxyServer();
  const server = http.createServer((req, res) => {
    const jekyllTarget = `http://127.0.0.1:${JEKYLL_PORT}`;
    const nextTarget = `http://localhost:${NEXT_PORT}`;
    const nextSegments = ["/_next", "/api", "/assets", "/articles", "/laws"];

    if (nextSegments.some((segment) => req.url.startsWith(segment))) {
      proxy.web(req, res, { target: nextTarget }, (err) => {
        console.error("Error proxying to Next.js:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy error");
      });
    } else {
      proxy.web(req, res, { target: jekyllTarget }, (err) => {
        console.error("Error proxying to Jekyll:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy error");
      });
    }
  });

  return new Promise((resolve, reject) => {
    server.on("error", (error) => {
      console.error("Failed to start proxy server:", error);
      reject(error);
    });

    server.listen(COMBINED_PORT, "0.0.0.0", () => {
      console.log(
        `Combined prod server running on http://localhost:${COMBINED_PORT}`
      );
      resolve();
    });
  });
}

async function startProdMode() {
  try {
    // Сначала запускаем прокси-сервер
    await createProxyServer();
    console.log("Proxy server started successfully.");

    // Затем запускаем Jekyll и Next.js
    startJekyll();
    startNext();

    // Ждем, пока сервисы станут доступны
    await waitForServices();

    console.log("Production mode started successfully.");
    console.log(
      `You can now access your application at http://localhost:${COMBINED_PORT}`
    );
  } catch (error) {
    console.error("Failed to start production mode:", error);
    process.exit(1);
  }
}

startProdMode();
