# Web-Based Code Editor

## Overview

The primary objective of this project is to develop an intuitive and versatile web-based code editor specifically designed for HTML, CSS, and JavaScript. The editor aims to provide a seamless and efficient coding environment for developers, with features like real-time collaboration, live preview, syntax auto-completion, and intelligent code suggestions.

The project leverages web technologies like HTML, CSS, JavaScript for the frontend, and Node.js with Firebase for the backend to ensure smooth performance and reliable real-time features.

## Features

- **Syntax Auto-Completion**: Assists users by suggesting code as they type, improving speed and accuracy.
- **Intelligent Code Suggestions**: Provides helpful suggestions for improving the quality and efficiency of code.
- **Live Preview**: Displays real-time results as users write HTML, CSS, and JavaScript, allowing instant feedback.
- **Real-Time Collaboration**: Multiple users can work on the same code simultaneously using WebSocket and Firebase Realtime Database.
- **Integrated Chat**: Facilitates communication between collaborators within the editor itself.
- **Offline Accessibility**: Users can continue coding even without an internet connection, with changes synced when the connection is restored.
- **Customizable Interface**: Users can personalize their coding environment with theme, layout, and settings preferences.
- **File Management**: Upload, download, rename, delete, and organize project files efficiently.
- **Code Snippet Library**: A collection of reusable code snippets for quick reference and insertion.
- **Search Functionality**: Easily find specific lines or keywords within your code.

## Technologies Used

### Frontend:
- **HTML, CSS, JavaScript**: Vanilla implementation for the core frontend logic and UI design.

### Backend:
- **Node.js**: Handles server-side functionality.
- **WebSocket**: Enables real-time collaboration between users.
- **Firebase Realtime Database**: Manages real-time data and user sessions.
- **Firebase Authentication**: Provides secure user authentication and authorization.

## Screenshots

Below are some sample screenshots of the key sections of the app:

<table>
  <tr>
    <td align="center">
      <strong>Editor Interface</strong><br>
      Main coding environment.<br>
      <img src="/assets/editor-dark.png" alt="Editor Interface" width="350">
    </td>
  </tr>
  <tr>
     <td align="center">
      <strong>Real-Time Collaboration</strong><br>
      Multiple users working together.<br>
      <img src="/assets/collaboration.png" alt="Real-Time Collaboration" width="350">
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Live Preview</strong><br>
      Immediate feedback of code.<br>
      <img src="/assets/live-output.png" alt="Live Preview" width="350">
    </td>
  </tr>
</table>

## Installation

### Prerequisites
- **Node.js**: Ensure you have Node.js installed on your system.
- **Firebase**: You need a Firebase project set up with Realtime Database and Authentication.

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/web-code-editor.git
2. Naviagte to project directory:
   ```bash
   cd web-code-editor
3.Install Dependencies:
   ```bash
   npm install

4.Set up Firebase:
  - Create a Firebase project and enable Realtime Database, Firestore and Authentication.
  - Create a .env file in the root directory and add your Firebase credentials.
    
5.Start the development server:
  ```bash
    npm start
