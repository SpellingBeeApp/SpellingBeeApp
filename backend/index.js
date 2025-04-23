// const express = require("express");
// const app = express();
// const port = 3000;

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });




const express = require('express')
const app = express();
const port = 5000;

app.use((req, res, next) => {
    let body = ''

    req.on('end', () => {
        const userName = body.split('=')[1]
        if (userName) {
            req.body = { name: userName }
        }
        next()
    })

    req.on('data', chunk => {
        body += chunk;
    })
})

// middleware function take a callback with three arguments
app.use((req, res, next) => {
    if (req.body) {
        return res.send('<h1>' + req.body.name + '</h1>')
    }
    res.send('<form method="POST"><input type="text" name="username"><button>Create User</button></input></form>')

})
// testing

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
