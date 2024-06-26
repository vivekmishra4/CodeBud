const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const admin = require("firebase-admin");
const serviceAccount = require("./codebudproject-firebase-adminsdk-wa00b-982731a169.json");
const projects = {};
const creators = {};
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "start-colab":
        ws.projectId = data.projectId;
        ws.username = data.username;
        ws.userId = data.userId;
        ws.projectName = data.projectName;
        creators[data.projectId] = data.username;
        projects[ws.projectId] = projects[ws.projectId] || {};
        break;
      case "join-colab":
        if (data.projectId == "" || projects[data.projectId] == undefined) {
          ws.send(
            JSON.stringify({ type: "projectinvalid", content: "join-colab" })
          );
          break;
        }
        ws.projectId = data.projectId;
        ws.username = data.username;
        ws.userId = data.userId;
        ws.projectName = data.projectName;
        sendExistingFiles(ws, ws.projectId);
        break;
      case "chat":
        if (data.projectId == "" || creators[ws.projectId] == undefined) {
          ws.send(JSON.stringify({ type: "projectinvalid", content: "chat" }));
          break;
        }
        broadcast(
          ws.projectId,
          JSON.stringify({
            type: "chat",
            message: data.message,
            username: ws.username,
          })
        );
        break;
      case "file":
        if (data.projectId == "" || creators[ws.projectId] == undefined) {
          ws.send(JSON.stringify({ type: "projectinvalid", content: "file" }));
          break;
        }
        if (data.filename) {
          projects[ws.projectId] = projects[ws.projectId] || {};
          projects[ws.projectId][data.filename] = data.content;
          broadcast(
            ws.projectId,
            JSON.stringify({
              type: "file",
              filename: data.filename,
              content: data.content,
            })
          );
        } else {
          console.error(`Invalid file data: ${JSON.stringify(data)}`);
        }
        // projects[ws.projectId].files[data.filename]=data.content;
        // broadcast(ws.projectId, JSON.stringify({ type: 'file', filename: data.filename, content: data.content }));
        break;
      case "close-colab":
        if (data.projectId == "" || projects[ws.projectId] == undefined) {
          ws.send(
            JSON.stringify({ type: "projectinvalid", content: "close-colab" })
          );
          break;
        }
        if (ws.username == creators[ws.projectId]) {
          saveFilesToFirebase(ws.projectId,ws.projectName, projects[ws.projectId]).then(() => {
            delete projects[ws.projectId];
            delete creators[ws.projectId];
          });
        } else {
          ws.projectId = "";
        }
        ws.close();
        break;
      case "close-connection":
        break;
      case "open-project":
        if (data.projectId == "") {
          ws.send(
            JSON.stringify({ type: "projectinvalid", content: "close-colab" })
          );
          
        }
        break;
      case "rename-project":
        ws.projectName = data.projectName;
        broadcast(ws.projectId, JSON.stringify({
          type: "rename-project",
          newName:data.newName
        }));
        break;
      case "rename-file":
        projects[ws.projectId][data.newName]=projects[ws.projectId][data.oldName];
        projects[ws.projectId][data.oldName]=null;
        broadcast(ws.projectId, JSON.stringify({
          type: "rename-file",
          oldName: data.oldName,
          newName:data.newName
        }));
        break;
      case "delete-file":
        projects[ws.projectId][data.oldName]=null;
        broadcast(ws.projectId, JSON.stringify({
          type: "delete-file",
          fileName:data.fileName
        }));
        
      default:
        console.error(`Unknown message type: ${data.type}`);
    }
  });
});
function sendExistingFiles(ws, projectId) {
  if (projects[projectId]) {
    Object.keys(projects[projectId]).forEach((filename) => {
      const content = projects[projectId][filename];
      ws.send(JSON.stringify({ type: "file", filename, content }));
    });
  }
}
function broadcast(projectId, message) {
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.projectId === projectId
    ) {
      client.send(message);
    }
  });
}
async function saveFilesToFirebase(projectId,projectName, files) {
  const projectRef = db.collection(userId).doc(projectId);
  const filesRef = projectRef.collection("files");
  const batch = db.batch();
  await projectRef.set({ projectName }, { merge: true });
  Object.keys(files).forEach((filename) => {
    if (filename && typeof filename === "string") {
      const fileRef = filesRef.doc(filename);
      batch.set(fileRef, { content: files[filename] });
      console.log("saved", filename);
    } else {
      console.error(`Invalid filename: ${filename}`);
    }
  });

  await batch.commit();
  console.log("Files saved to Firebase");
}
server.listen(3000, () => {
  console.log("Server is listening on http://localhost:3000");
});
