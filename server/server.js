const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const admin = require("firebase-admin");
const serviceAccount = require("./codebudproject-firebase-adminsdk-wa00b-7122805778.json");
const { type } = require("os");
const projects = {};
const creators = {};
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
 databaseURL: "https://codebudproject-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const rtdb = admin.database();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("connected");
  ws.send(JSON.stringify({type:"connected"}));
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
        console.log("start-colab");
        ws.send(JSON.stringify({ type: "colab", content: "creator" }));
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
        console.log("join-colab");
        ws.send(JSON.stringify({ type: "colab", content: "yes" }));
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
      case "project":
        getProject(data.projectId);
        break;
      case "projects":
        getProjects(ws.userId);
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
          
          saveProjectToFirebase(
            ws.userId,
            ws.projectId,
            ws.projectName,
            projects[ws.projectId]
          ).then(() => {
            delete projects[ws.projectId];
            delete creators[ws.projectId];
            broadcast(
              ws.projectId,
              JSON.stringify({
                type: "colabClosed",
                content: "Colab closed by Creator",
              })
            );
          });
        } else {
          ws.projectId = "";
        }
        break;
      case "close-connection":
        ws.close();
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
        broadcast(
          ws.projectId,
          JSON.stringify({
            type: "rename-project",
            newName: data.newName,
          })
        );
        break;
      case "rename-file":
        projects[ws.projectId][data.newName] =
          projects[ws.projectId][data.oldName];
        projects[ws.projectId][data.oldName] = null;
        broadcast(
          ws.projectId,
          JSON.stringify({
            type: "rename-file",
            oldName: data.oldName,
            newName: data.newName,
          })
        );
        console.log("Renamed");
        break;
      case "delete-file":
        projects[ws.projectId][data.oldName] = null;
        broadcast(
          ws.projectId,
          JSON.stringify({
            type: "delete-file",
            fileName: data.fileName,
          })
        );

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
async function saveProjectToFirebase(userId, projectId, projectName, files) {
  try {
    await saveProjectMetaToFirebase(userId, projectId, projectName);
    await saveProjectFilesToFirestore(userId, projectId, files);
    console.log("Project saved successfully");
  } catch (error) {
    console.error("Error saving project:", error);
  }
}

async function saveProjectMetaToFirebase(userId, projectId, projectName) {
  const projectMetaRef = rtdb.ref(`users/${userId}/projects/${projectId}`);
  await projectMetaRef.set({ projectName });
  console.log("Project metadata saved to Firebase Realtime Database");
}
async function saveProjectFilesToFirestore(userId, projectId, files) {
  const projectRef = db.collection(userId).doc(projectId);
  const filesRef = projectRef.collection("files");
  const batch = db.batch();

  Object.keys(files).forEach((filename) => {
    if (filename && typeof filename === "string") {
      const fileRef = filesRef.doc(filename);
      batch.set(fileRef, { content: files[filename] });
      console.log("Saved:", filename);
    } else {
      console.error(`Invalid filename: ${filename}`);
    }
  });

  await batch.commit();
  console.log("Files saved to Firestore");
}
async function getAllProjects(userId) {
  try {
    const projectsRef = rtdb.ref(`users/${userId}/projects`);
    const snapshot = await projectsRef.once("value");

    if (snapshot.exists()) {
      const projects = snapshot.val();
      return projects;
    } else {
      console.log("No projects found for user:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving projects:", error);
    throw error;
  }
}

// Example usage
const userId = "1234";

getAllProjects(userId)
  .then((projects) => {
    if (projects) {
      console.log("Projects retrieved:", projects);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

async function getAllFiles(userId, projectId) {
  try {
    const filesRef = db.collection(userId).doc(projectId).collection("files");
    const snapshot = await filesRef.get();

    if (snapshot.empty) {
      console.log("No files found for project:", projectId);
      return null;
    }

    const files = {};
    snapshot.forEach((doc) => {
      files[doc.id] = doc.data().content;
    });

    return files;
  } catch (error) {
    console.error("Error retrieving files:", error);
    throw error;
  }
}


const projectId = "project123";

getAllFiles(userId, projectId)
  .then((files) => {
    if (files) {
      console.log("Files retrieved:", files);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

server.listen(3000, () => {
  console.log("Server is listening on http://localhost:3000");
});
