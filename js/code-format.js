import { currentFile,getFileType } from "./store-online.js";
const htmlTags = [
  "html",
  "head",
  "title",
  "body",
  "script",
  "style",
  "div",
  "span",
  "h1",
  "h2",
  "h3",
  "p",
  "a",
  "img",
];
const cssProperties = [
  "color",
  "background",
  "margin",
  "padding",
  "border",
  "font-size",
  "width",
  "height",
];
const jsKeywords = [
  "function",
  "var",
  "let",
  "const",
  "if",
  "else",
  "for",
  "while",
  "return",
];

const textarea = document.querySelector("#code-input");
const autocompleteContainer = document.getElementById("autocomplete-container");

textarea.addEventListener("input", function (e) {
  if (e.target.value.trim() == "") {
    return;
  }
  autocompleteContainer.style.display = "block";
  const cursorPosition = textarea.selectionStart;
  const value = textarea.value.substring(0, cursorPosition);
  const suggestions = getSuggestions(value,getFileType(currentFile));
  showSuggestions(suggestions, textarea, cursorPosition);
});

textarea.addEventListener("keydown", function (e) {
  if (e.key === "ArrowDown") {
    const firstSuggestion = autocompleteContainer.querySelector(
      ".autocomplete-suggestion"
    );
    if (firstSuggestion) {
      firstSuggestion.focus();
    }
    e.preventDefault();
  } else if (e.key === "Tab") {
    const firstSuggestion = autocompleteContainer.querySelector(
      ".autocomplete-suggestion"
    );
    if (firstSuggestion) {
      insertSuggestion(
        textarea,
        firstSuggestion.textContent,
        textarea.selectionStart
      );
    }
    e.preventDefault();
  }
});                                                   
function getSuggestions(value, id) {
  const lastWord = value.split(/\s+/).pop();
  let suggestions = [];
  if (id === "html") {
    suggestions = htmlTags.filter((tag) => tag.startsWith(lastWord));
  } else if (id === "css") {
    suggestions = cssProperties.filter((prop) => prop.startsWith(lastWord));
  } else if (id === "js") {
    suggestions = jsKeywords.filter((keyword) => keyword.startsWith(lastWord));
  }
  if(suggestions.length==1&&suggestions[0]==lastWord){
    autocompleteContainer.style.display = "none";
    return;
  }

  return suggestions;
}

function showSuggestions(suggestions, textarea, cursorPosition) {
  autocompleteContainer.innerHTML = "";
  if (suggestions.length > 0) {
    const cancelButton = document.createElement("div");
    cancelButton.classList.add("autocomplete-cancel");
    cancelButton.textContent = "✖";
    cancelButton.addEventListener("click", function () {
      autocompleteContainer.style.display = "none";
    });
    autocompleteContainer.appendChild(cancelButton);

    suggestions.forEach((suggestion) => {
      const div = document.createElement("div");
      div.classList.add("autocomplete-suggestion");
      div.tabIndex = 0; // Make div focusable
      div.textContent = suggestion;
      div.addEventListener("click", function () {
        insertSuggestion(textarea, suggestion, cursorPosition);
      });
      div.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          insertSuggestion(textarea, suggestion, cursorPosition);
        }
      });
      autocompleteContainer.appendChild(div);
    });
    

    // Calculate cursor position
    const rect = textarea.getBoundingClientRect();
    const lineHeight = 20; // Adjust as needed
    const lines = textarea.value.substr(0, cursorPosition).split("\n");
    const topOffset = rect.top + lines.length * lineHeight;
    const leftOffset = rect.left + lines[lines.length - 1].length * 8; // Assuming average character width is 8px

    autocompleteContainer.style.top = `${topOffset}px`;
    autocompleteContainer.style.left = `${leftOffset}px`;
    autocompleteContainer.style.width = `${textarea.clientWidth}px`;
  } else {
    autocompleteContainer.style.display = "none";
  }
}

function insertSuggestion(textarea, suggestion, cursorPosition) {
  const value = textarea.value;
  const beforeCursor = value.substring(0, cursorPosition);
  const afterCursor = value.substring(cursorPosition);
  const lastWordStart = beforeCursor.lastIndexOf(
    beforeCursor.split(/\s+/).pop()
  );

  const newValue = value.substring(0, lastWordStart) + suggestion + afterCursor;
  textarea.value = newValue;

  const newCursorPosition = lastWordStart + suggestion.length;
  textarea.setSelectionRange(newCursorPosition, newCursorPosition);

  autocompleteContainer.innerHTML = "";
  autocompleteContainer.style.display = "none";
  textarea.focus();
}
textarea.addEventListener("keydown", (e) => {
    if (e.key === "<") {
      e.preventDefault();
      insertPairedCharacters(">", e.key);
    } else if (e.key === "{") {
      e.preventDefault();
      insertPairedCharacters("}", e.key);
    } else if (e.key === "(") {
      e.preventDefault();
      insertPairedCharacters(")", e.key);
    } else if (e.key === "[") {
      e.preventDefault();
      insertPairedCharacters("]", e.key);
    }
  });
  
  function insertPairedCharacters(closingChar, openingChar) {
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const textAfterCursor = textarea.value.substring(cursorPosition);
    textarea.value =
      textBeforeCursor + openingChar + closingChar + textAfterCursor;
    moveCursor(cursorPosition + 1);
  }
  
  function moveCursor(position) {
    textarea.setSelectionRange(position, position);
    textarea.focus();
  }