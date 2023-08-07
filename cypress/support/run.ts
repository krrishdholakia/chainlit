import { join } from "path";
import { execSync, spawn } from "child_process";
import sh from 'shell-exec'
import { readdirSync, existsSync, unlinkSync } from "fs";

const ROOT = process.cwd();
const CHAINLIT_DIR = join(ROOT, "src");
const E2E_DIR = join(ROOT, "cypress/e2e");

function kill(port, method = "TCP") {
  if (process.platform === 'win32') {
    return sh('netstat -nao')
      .then(res => {
        const { stdout } = res
        if (!stdout) return res

        const lines = stdout.split('\n')
        // The second white-space delimited column of netstat output is the local port,
        // which is the only port we care about.
        // The regex here will match only the local port column of the output
        const lineWithLocalPortRegEx = new RegExp(`^ *${method.toUpperCase()} *[^ ]*:${port}`, 'gm')
        const linesWithLocalPort = lines.filter(line => line.match(lineWithLocalPortRegEx))

        const pids = linesWithLocalPort.reduce((acc, line) => {
          const match = line.match(/(\d*)\w*(\n|$)/gm)
          return match && match[0] && !acc.includes(match[0]) ? acc.concat(match[0]) : acc
        }, [])

        return sh(`TaskKill /F /PID ${pids.join(' /PID ')}`)
      })
  }

  return sh(`lsof -nPi :${port}`)
    .then(res => {
      const { stdout } = res
      if (!stdout)  return Promise.reject(`No process running on port ${port}`)
      return sh(
        `lsof -i ${method === 'udp' ? 'udp' : 'tcp'}:${port} | grep ${method === 'udp' ? 'UDP' : 'LISTEN'} | awk '{print $2}' | xargs kill -9`
      )
    })
}

function cleanLocalData(testDir: string) {
  if (existsSync(join(testDir, ".chainlit/chat_files"))) {
    execSync("rm -rf .chainlit/chat_files", {
      encoding: "utf-8",
      cwd: testDir,
      env: process.env,
      stdio: "inherit",
    });
  }
  if (existsSync(join(testDir, ".chainlit/chat.db"))) {
    unlinkSync(join(testDir, ".chainlit/chat.db"));
  }
}

export async function runChainlitForTest(test_name: string, mode: string) {
  try {
    await kill(8000)
  } catch (e) {
    console.log(e)
  }
  return new Promise((resolve, reject) => {

    const dir = join(E2E_DIR, test_name);
    let file = "main.py"
    if (mode === "async") file = "main_async.py"
    if (mode === "sync") file = "main_sync.py"

    cleanLocalData(dir);

    // Headless + CI mode
    const options = [
      "run",
      "-C",
      CHAINLIT_DIR,
      "chainlit",
      "run",
      file,
      "-h",
      "-c",
    ];

    const server = spawn("poetry", options, {
      cwd: dir,
    });

    server.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      if (data.toString().includes("Your app is available at")) {
        resolve(server);
      }
    });

    server.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    server.on("error", (error) => {
      reject(error.message);
    });

    server.on("exit", function (code) {
      reject("child process exited with code " + code);
    });
  });
}

runChainlitForTest(process.argv[2], process.argv[3])
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
