const { exec } = require("child_process");

const combinedBuildDir = "combined_build"; // Директория с объединенной сборкой
const port = 3000; // Порт, на котором будет запущен сервер

function runServer() {
  const command = `npx http-server ${combinedBuildDir} -p ${port} -c-1`;

  console.log(`Starting server for combined build on port ${port}...`);

  const serverProcess = exec(command);

  serverProcess.stdout.on("data", (data) => {
    console.log(data);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  serverProcess.on("close", (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

runServer();
