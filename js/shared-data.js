export const files = {
    "index.html": `<html>
  <head>
  </head>
  <body>
  </body>
  </html>`,
  };
  export let outputCode=[];

  //Defining Snippets
  export const mySnippets={
    html:[
      {name:"html Template",code:`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  </head>
  <body>
      
  </body>
  </html>`},
  {name:"form",code:`<form action="/submit" method="post">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name">
      <br>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email">
      <br>
      <input type="submit" value="Submit">
  </form>
    `},
    {name:"table",code:`<table>
      <thead>
          <tr>
              <th></th>
              <th></th>
              <th></th>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td></td>
              <td></td>
              <td></td>
          </tr>
          <tr>
              <td></td>
              <td></td>
              <td></td>
          </tr>
      </tbody>
  </table>
  
      `}
    ],
    css:[{name:"reset",code:`* {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
  }
      `},
      {name:"centering element",code:`.center {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
  }
        `},
      {name:"responsive grid",code:`.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
}
.grid-item {
    background-color: #ccc;
    padding: 20px;
    text-align: center;
}
        `}],
    js:[{name:"event Listeners",code:`document.getElementById('myButton').addEventListener('click', function() {
    alert('Button clicked!');
});
      `},
    {name:"fetch api",code:`fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
  `},
{name:"Array map",code:`const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(number => number * 2);
console.log(doubled); // [2, 4, 6, 8, 10]
`}]
  }