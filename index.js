//      Módulos Necessários
//          Express: fast, unopinionated, minimalist web framework for node.
const express = require('express');
//          Path: provides utilities for working with file and directory paths.
const path = require('path');
//          Handlebars: a Handlebars view engine for Express which doesn't suck.
const handlebars = require('express-handlebars');
//          Body-Parser: parse incoming request bodies in a middleware, available under the req.body property.
const bodyParser = require('body-parser');
//          Connect-Flash: special area of the session used for storing messages. 
const flash = require('connect-flash');
//          Session: create a session middleware with the given options.
var session = require('express-session');
//          Chamando o Express.
const app = express();
//          Passport: lets you authenticate using a username and password.
const Passport = require('passport');
//      Arquivos Externos
//          Arquivo de Rotas Administrativas
const admin = require("./routes/admin");
//          Arquivo de Rotas de Usuário
const user = require("./routes/user");
//          Arquivo de Conexão com o Banco de Dados
const connection = require("./database/db");
//          Arquivo de Modelo de Usuário
const userModel = require("./database/User");
//          Arquivo de Configuração de Autenticação
require("./config/auth")(Passport);

//          Configurações de Pastas no Servidor
global.appRoot = path.resolve(__dirname);
app.set('config', path.join(__dirname, 'config'));
app.set('controller', path.join(__dirname, 'controller'));
app.set('database', path.join(__dirname, 'database'));
app.set('helpers', path.join(__dirname, 'helpers'));
app.set('middleware', path.join(__dirname, 'middleware'));
app.set('resources', path.join(__dirname, 'resources'));
app.set('routes', path.join(__dirname, 'routes'));
app.set('views', path.join(__dirname, 'views'));


//      Configurações
//          Configuração de Sessão
app.use(session({
    secret: "#p47h0l0g1s74s!",
    resave: true,
    saveUninitialized: true
}));
//          Configuração do Banco de Dados
connection.authenticate().then(() => {
        console.log("A aplicação está conectada ao banco de dados.");
    })
    .catch((err) => {
        console.log("Houve um erro ao se conectar com o banco de dados. Este foi: " + err);
    });
//          Configuração do Passport
app.use(Passport.initialize());
app.use(Passport.session());
//          Configuração do Flash
app.use(flash());
//          Criando um Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});
//          Configuração do Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//          Configuração do HandleBars
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}));
app.set('view engine', 'handlebars');
//          Configurações de Arquivos Estáticos
app.use(express.static(path.join(__dirname, "public")));
//          Configuração das Fotos Privadas
app.use('/images', express.static(__dirname + '/resources/'));

//      Rotas
app.get('/', (req, res) => {
    res.render("user/camps");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.use('/user', user);
app.use('/admin', admin);

//      Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log("O servidor da aplicação PathoSpotter-Labeling está online.");
});
