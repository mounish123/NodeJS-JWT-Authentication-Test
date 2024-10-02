// const express = require('express');
// const app = express();

// const jwt = require('jsonwebtoken');
// const expressJwt = require('express-jwt');
// const bodyParser = require('body-parser');
// const path = require('path'); 

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
//     next();
// });

// const PORT = 3000;

// const secretKey = 'My super secret key';
// const jwtMW = expressJwt({
//     secret: secretKey,
//     algorithms: ['HS256']
// }).unless({ path: ['/api/login'] });

// let users = [{
//     id: 1,
//     username: 'fabio',
//     password: '123'
// },
// {
//     id:2,
//     username: 'nolasco',
//     password: '456'
// }];

// app.post('/api/login', (req,res) => {
//    const {username, password} = req.body;

//    for(let user of users){
//     if(username == user.username && password == user.password){
//         let token = jwt.sign({id: user.id, username: user.username}, secretKey, {expiresIn: '7d'});
//             res.json({
//                 success: true,
//                 err:  null,
//                 token
//             });
//             break;
//         }
//         else{
//             res.status(401).json({
//                 success: false,
//                 token: null,
//                 err: 'Username or password is incorrect'
//             });
//         }
//    }
// });

// app.get('/api/dashboard', jwtMW, (req,res) => {
//     // console.log(req);
//     res.json({
//         success: true,
//         myContent: 'Secret content that only logged in people can see.'
//     });
// });

// app.get('/', (req,res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });

// app.use(function(err, req, res, next) {
//     // console.log(err.name == 'unauthorizedError');
//     // console.log(err);
//     if(err.name === 'UnauthorizedError') { 
//         res.status(401).json({
//             success: false,
//             officialError: err,
//             err: 'Username or password is incorrect 2'
//         });
//     }
//     else{
//         next(err);
//     }
// });

// app.listen(PORT, () => {
//     console.log(`serving on port ${PORT}`);
// });


const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path'); 

const app = express();
const PORT = 3000;
const secretKey = 'My super secret key';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample users array
let users = [
    { id: 1, username: 'fabio', password: '123' },
    { id: 2, username: 'nolasco', password: '456' }
];

// Middleware to check JWT token
const checkJwt = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, err: 'Token is missing' });
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, err: 'Invalid token' });
        }
        req.user = decoded; // Save decoded user info for later use
        next();
    });
};

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
        res.json({ success: true, err: null, token });
    } else {
        res.status(401).json({ success: false, token: null, err: 'Username or password is incorrect' });
    }
});

app.get('/api/dashboard', checkJwt, (req, res) => {
    res.json({ success: true, myContent: 'Secret content that only logged in people can see.' });
});

app.get('/api/settings', checkJwt, (req, res) => {
    res.json({ success: true, myContent: 'This is a page for settings' });
});

app.get('/api/prices', checkJwt, (req, res) => {
    res.json({ success: true, myContent: 'this is the price $3.99' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
