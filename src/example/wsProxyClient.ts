import WebSocket from "ws";
import readline from "readline";

const ws = new WebSocket("ws://localhost:8080");

ws.on("error", console.error);

ws.on("open", function open() {
  // Create a readline interface to take user input from the console.
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });
  rl.prompt();

  // Listen for each line of user input.
  rl.on("line", (line) => {
    // Trim the input and skip if it's empty.
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      rl.prompt();
      return;
    }

    // Split the input into parts: first part is the command, the rest are arguments.
    const [request, ...args] = trimmedLine.split(" ");
    const message = JSON.stringify({
      request,
      args: JSON.parse(args.join(" ")),
    });
    ws.send(message);
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("Exiting");
    process.exit(0);
  });
});

ws.on("message", function message(data) {
  console.log("received: %s", data);
});
