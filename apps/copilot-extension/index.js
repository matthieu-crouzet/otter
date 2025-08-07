
import { Octokit } from "@octokit/core";
import express from "express";
import { Readable } from "node:stream";

const app = express()

app.get("/", (req, res) => {
  res.send("Welcome to the Otter GitHub Copilot Extension!")
});

app.post("/", express.json(), async (req, res) => {
  // Identify the user, using the GitHub API token provided in the request headers.
  const tokenForUser = req.get("X-GitHub-Token");
  const octokit = new Octokit({ auth: tokenForUser });
  const user = await octokit.request("GET /user");
  console.log("User:", user.data.login);

  // Parse the request payload and log it.
  const payload = req.body;
  console.log("Payload:", payload);

  // Insert a special pirate-y system message in our message list.
  const messages = payload.messages;
  messages.unshift({
    role: "system",
    content: "You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.",
  });
  messages.unshift({
    role: "system",
    content: `Start every response with the user's name, which is @${user.data.login}`,
  });

  // Use Copilot's LLM to generate a response to the user's messages, with
  // our extra system messages attached.
  const copilotLLMResponse = await fetch(
    "https://api.githubcopilot.com/chat/completions",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${tokenForUser}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messages,
        stream: true,
      }),
    }
  );

  // Stream the response straight back to the user.
  Readable.from(copilotLLMResponse.body).pipe(res);
})

app.post("create-monorepo-with-app", express.json(), async (req, res) => {
  // Identify the user, using the GitHub API token provided in the request headers.
  const tokenForUser = req.get("X-GitHub-Token");
  const octokit = new Octokit({ auth: tokenForUser });
  const user = await octokit.request("GET /user");
  console.log("User:", user.data.login);

  // Parse the request payload and log it.
  const payload = req.body;
  console.log("Payload:", payload);

  // Insert a special pirate-y system message in our message list.
  const messages = payload.messages;
  messages.unshift({
    role: "system",
    content: "You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.",
  });
  messages.unshift({
    role: "system",
    content: 'To create a monorepo with an application, follow the steps outlined in the Otter documentation. \n'
      + `First run: npm create @o3r <repositoryName>\n`
      + `Then run: cd <repositoryName> && npm exec ng g application <applicationName>\n`
      + `If applicationName is not provided, use "frontend" as the default.\n`,
  });

  // Use Copilot's LLM to generate a response to the user's messages, with
  // our extra system messages attached.
  const copilotLLMResponse = await fetch(
    "https://api.githubcopilot.com/chat/completions",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${tokenForUser}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messages,
        stream: true,
      }),
    }
  );

  // Stream the response straight back to the user.
  Readable.from(copilotLLMResponse.body).pipe(res);
})

const port = Number(process.env.PORT || '3000')
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
});
