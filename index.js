const mysql = require("mysql");
const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const iniparser = require("iniparser");
const config_db = iniparser.parseSync("./DB.ini");

const app = express();
app.set("view engine", "ejs");
app.set(express.static("views"));
const mysql_conn = mysql.createConnection({
  host: config_db["dev"]["host"],
  user: config_db["dev"]["user"],
  password: config_db["dev"]["password"],
  database: config_db["dev"]["database"],
});

mysql_conn.connect((err) => {
  if (!err) console.log("Connected with database");
  else console.log(`Can't connect to database ${JSON.stringify(err)}`);
});

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.listen(3000, () => console.log("Server listening"));

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/gold", (req, res) => {
  mysql_conn.query("SELECT * FROM book", (err, lignes, champs) => {
    if (!err) {
      console.log(lignes);
      res.send(lignes);
    }
  });
});

app.get("/gold/:id", (req, res) => {
  let critere = req.params.id;
  console.log("ID = " + critere);
  mysql_conn.query(
    "SELECT * FROM book WHERE id = ?",
    [critere],
    (err, lignes, champs) => {
      if (!err) {
        console.log(lignes);
        res.send(lignes);
      }
    }
  );
});

app.get("/search/", (req, res) => {
  let critere = "%" + req.query.msgSearch + "%";
  console.log("Find this : " + critere);
  mysql_conn.query(
    "SELECT * FROM book WHERE message LIKE ?",
    [critere],
    (err, lignes, champs) => {
      if (!err) {
        console.log(lignes);
        res.send(lignes);
      }
    }
  );
});

app.delete("/gold/delete/:id", (req, res) => {
  let critere = req.params.id;
  console.log("ID = " + critere);
  mysql_conn.query(
    "DELETE FROM book WHERE id = ?",
    [critere],
    (err, lignes, champs) => {
      if (!err) {
        console.log("Effacement terminé");
        res.send("Effacement terminé");
      } else {
        console.log("Erreur lors de l'effacement");
        res.send("Erreur effacement : " + JSON.stringify(err));
      }
    }
  );
});

app.post("/gold", (req, res) => {
  let msgName = req.body.name;
  let msgMsg = req.body.msg;
  let msgNote = req.body.note;
  console.log(
    `Ajout msg ID de ${msgName} contenant ${msgMsg} et noté $ {msgNote}`
  );
  let requeteSQL = "INSERT INTO book (name, message, evaluation) VALUES";
  requeteSQL = requeteSQL + `('${msgName}', '${msgMsg}', ${msgNote})`;
  console.log("Requete : " + requeteSQL);
  mysql_conn.query(requeteSQL, (err, lignes, champs) => {
    if (!err) {
      console.log("Insertion terminé");
      res.send("Insertion terminé");
    } else {
      console.log("Erreur lors de l'enregistrment");
      res.send("Erreur ajout : " + JSON.stringify(err));
    }
  });
});
