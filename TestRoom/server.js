const express = require('express');
const users = require('./routes/users')
const posts = require('./routes/post')
const cookieParser = require('cookie-parser')
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.set('views', path.join(__dirname, 'views'));''
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/test', (req, res) => {
if(req.session.count){
    req.session.count++;
}else{
    req.session.count = 1
}

res.send(`hello  sent request ${req.session.count} times`)
})


app.get('/register', (req, res) => {
    let {name = "Anonymous"} = req.query;
    req.session.name = name;
    if (name == "Anonymous"){
        req.flash('error', "uiser registeration unsuccessfully!");
    }else{
        req.flash('success', "uiser registered successfull!");
    }
    res.redirect('/hello');
})

app.get('/hello', (req, res) => {
    let {name = "Anonymous"} = req.query;
    res.render('hello', {name: req.session.name})
})




// app.use(cookieParser("secretcode"));

// app.get('/getcookies', (req, res) => {
//     res.cookie("Great", "Cookie Sent!")
//     res.send('You got some cookies yeah')
// });

// app.get('/getsigned', (req, res) => {
//     res.cookie('madein', 'IN', {signed: true})
//     res.send('signed cookie sent');
// })

// app.get('/verify', (req, res) => {
//     console.log(req.signedCookies);
//     res.send('Verified')
// })

// app.get('/greet', (req, res) => {
//     let { name = 'anonymous '} = req.cookies;
//     res.send(`Hello ${name}`);
// })

// app.get('/', (req, res) => {
//     console.dir(req.cookies);
//     res.send('i am root');
// })

// app.use('/users', users);

// app.use('/post', posts);

app.listen(3000, () => {
    console.log("Server Running Successfully");
}) 