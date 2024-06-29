const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const jekyllBuildDir = "_site"; // Стандартная директория сборки Jekyll
const nextBuildDir = "out"; // Стандартная директория сборки Next.js
const combinedBuildDir = "combined_build"; // Директория для объединенной сборки

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve();
    });
  });
}

async function combinedBuild() {
  try {
    // Шаг 1: Сборка Jekyll
    console.log("Building Jekyll...");
    await runCommand("npm-run-all build:js:deps build:js:app build:jekyll");

    // Шаг 2: Сборка Next.js
    console.log("Building Next.js...");
    await runCommand("next build");

    // Шаг 3: Создание директории для объединенной сборки
    console.log("Creating combined build directory...");
    await fs.ensureDir(combinedBuildDir);

    // Шаг 4: Копирование файлов Jekyll в объединенную директорию
    console.log("Copying Jekyll build...");
    await fs.copy(jekyllBuildDir, combinedBuildDir);

    // Шаг 5: Копирование файлов Next.js, не перезаписывая существующие
    console.log("Copying Next.js build...");
    await fs.copy(nextBuildDir, combinedBuildDir, { overwrite: true });

    console.log("Combined build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

combinedBuild();
