// Klassendefinition. Die Klasse ist der Bauplan, 
// der alle relevanten Eigenschaften enthält.
// Nach der Deklaration wird mit dem reservierten Wort
// 'new' ein Objekt der Klasse instanziiert.

class Konto{
    constructor(){
        this.Iban
        this.Kontonummer
        this.Kontoart
        this.Anfangssaldo
        // Die IdKunde ist eine Eigenschaft von Konto.
        // Jedes Konto wird einem Kunden zugeordnet.
        this.IdKunde
    }
}

let konto 

class Kunde{
    constructor(){
        this.Mail
        this.Nachname
        this.Vorname
        this.Kennwort        
        this.IdKunde
        this.Geburtsdatum
        this.Adresse
        this.Telefonnummer
    }
}

// Deklaration und Instanziierung

let kunde = new Kunde()

// Initialisierung

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mysql = require('mysql')
const iban = require('iban')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

// Die Congig.js einbinden:

const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

// 20210208

const dbVerbindung = mysql.createConnection({
    host: '10.40.38.110', //130.255.124.99
    user: 'placematman',
    password: "BKB123456!",
    database: "dbn27"
})

dbVerbindung.connect()

// Die Kontotabelle wird angelegt.

dbVerbindung.connect(function(err){

    dbVerbindung.query("CREATE TABLE konto(iban VARCHAR(22), idKunde INT(11), kontoart VARCHAR(20), timestamp TIMESTAMP, PRIMARY KEY(iban));", function(err, result){
        if(err){
            if(err.code === "ER_TABLE_EXISTS_ERROR"){
                console.log("Die Tabelle konto existiert bereits.")
            }else{
                console.log("Es ist ein Fehler aufgetreten: " + err.code)
            }            
        }else{
            console.log("Tabelle konto erstellt.")    
        }        
    })
})


dbVerbindung.connect(function(err){

    dbVerbindung.query("CREATE TABLE kunde(idKunde INT(11), vorname VARCHAR(45), nachname VARCHAR(45), kennwort VARCHAR(45), mail VARCHAR(45), PRIMARY KEY(idKunde));", function(err, result){
        if(err){
            if(err.code === "ER_TABLE_EXISTS_ERROR"){
                console.log("Die Tabelle kunde existiert bereits.")
            }else{
                console.log("Es ist ein Fehler aufgetreten: " + err)
            }            
        }else{
            console.log("Tabelle kunde erstellt.")    
        }        
    })
})

// 20210808

// Wir brauchen eine neue Tabelle namens Kontobewegung
// Der Primärschlüssel ist: IBAN und Timestamp
// Die Eigenschaften sind: iban VARCHAR(22), betrag DECIMAL(15,2), verwendungszweck VARCHAR(140), timestamp Timestamp

dbVerbindung.connect(function(err){

    dbVerbindung.query("CREATE TABLE kontobewegung(iban VARCHAR(22), betrag DECIMAL(15,2), verwendungszweck VARCHAR(140), timestamp Timestamp, PRIMARY KEY(iban, timestamp), FOREIGN KEY (iban) REFERENCES konto(iban));", function(err, result){
        if(err){
            if(err.code === "ER_TABLE_EXISTS_ERROR"){
                console.log("Die Tabelle kontobewegung existiert bereits.")
            }else{
                console.log("Es ist ein Fehler aufgetreten: " + err)
            }            
        }else{
            console.log("Tabelle kontobewegung erstellt.")    
        }        
    })
})

kunde.Mail = "s150123@berufskolleg-borken.de"
kunde.Nachname = "N"
kunde.Vorname = "V"
kunde.Kennwort = "123"
kunde.IdKunde = 150129

dbVerbindung.connect(function(err){
    dbVerbindung.query("INSERT INTO kunde(idKunde,vorname,nachname,kennwort,mail) VALUES (" + kunde.IdKunde + ", '" + kunde.Vorname + "', '" + kunde.Nachname + "', '" + kunde.Kennwort + "','" + kunde.Mail + "');", function(err, result){
        if(err){         
            if(err.code == "ER_DUP_ENTRY")   
                console.log("Der Kunde mit der ID " + kunde.IdKunde + " existiert bereits.")
            else
                console.log("Es ist ein Fehler aufgetreten: " + err)
        }else{
            console.log("Kunde " + kunde.IdKunde + " erfogreich eingefügt.")    
        }        
    })            
})

const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Server lauscht auf Port %s', server.address().port)    
})

// Beim Aufrufen der Startseite wird die 
// app.get('/' ...) abgearbeitet.

app.get('/',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']
    
    if(idKunde){
        console.log("Kunde ist angemeldet als " + idKunde)
        res.render('index.ejs', {                              
        })
    }else{
        res.render('login.ejs', {                    
        })    
    }
})

app.get('/login',(req, res, next) => {         
    res.cookie('istAngemeldetAls', '')       
    res.render('login.ejs', {                    
    })
})

app.get('/login',(req, res, next) => {   
    res.render('login.ejs', {                    
    })
})

// app.post() wird abgearbeitet, wenn der 
// Button gedrückt wird.

app.post('/',(req, res, next) => {   

    // Der Wert aus dem Input mit dem 
    // name = 'idKunde' wird über die
    // Anfrage (req) an den Server gesendet und
    // zugewiesen an eine Konstante namens
    // idKunde.

    const idKunde = req.body.idKunde
    const kennwort = req.body.kennwort

    // Wenn der Wert von idKunde gleich dem Wert der
    // Eigenschaft IdKunde von kunde ist UND
    // wenn der Wert von kennwort gleich dem Wert der
    // Eigenschaft Kennwort von kunde ist, dann
    // werden die Anweisungen im Rumpf der 
    // if-Kontrollstruktur ausgeführt.

    if(idKunde == kunde.IdKunde && kennwort == kunde.Kennwort){
        console.log("Der Cookie wird gesetzt: " + idKunde)
        res.cookie('istAngemeldetAls', idKunde)
        res.render('index.ejs', {                    
        })
    }else{
        console.log("Der Cookie wird gelöscht")
        res.cookie('istAngemeldetAls','')
        res.render('login.ejs', {                    
        })
    }
})

app.get('/impressum',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']
    
    if(idKunde){
        console.log("Kunde ist angemeldet als " + idKunde)
        res.render('impressum.ejs', {                              
        })
    }else{
        res.render('login.ejs', {                    
        })    
    }
})

// Die app.get() wird abgearbeitet, wenn die Seite im Browser aufgerufen wird.

app.get('/kontoAnlegen',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']
    
    if(idKunde){
        console.log("Kunde ist angemeldet als " + idKunde)
        res.render('kontoAnlegen.ejs', { 
            meldung : ""                             
        })
    }else{
        res.render('login.ejs', {                    
        })    
    }
})

// Die Funktion wird abgearbeitet, wenn der Button gedrückt wird.

app.post('/kontoAnlegen',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']    
    if(idKunde){

// Von der Klasse Konto wird ein Objekt namens konto 
// instanziiert.

        konto = new Konto()
   
// Nach der Deklaration und der Instanziierung kommt die
// Initialisierung. Das heißt, dass konkrete Eigenschafts-
// werte dem Objekt zugewiesen werden.        
   
        konto.Kontonummer = req.body.kontonummer
        konto.Kontoart = req.body.kontoart
        konto.IdKunde = idKunde 
        console.log(idKunde)

        const bankleitzahl = "27000000"
        const laenderkennung = "DE"

        konto.Iban = iban.fromBBAN(laenderkennung, bankleitzahl + " " + req.body.kontonummer)
        
        console.log(konto.Iban)

        // Einfügen von kontonummer in die Tabelle konto (SQL)
       
        dbVerbindung.connect(function(err){

            dbVerbindung.query("INSERT INTO konto(iban, idKunde, kontoart, timestamp) VALUES ('" + konto.Iban + "'," + kunde.IdKunde + ",'" + konto.Kontoart + "', NOW());", function(err, result){
                if(err){         
                    if(err.code == "ER_DUP_ENTRY")   
                        console.log("Das Konto " + konto.Iban + " existiert bereits.")
                    else
                        console.log("Es ist ein Fehler aufgetreten: " + err)
                }else{
                    console.log("Konto " + kunde.IdKunde + " erfolgreich eingefügt.")    
                }
            })            
        })

        console.log("Kunde ist angemeldet als " + idKunde)
        res.render('kontoAnlegen.ejs', {                              
           meldung : "Das Konto " + konto.Iban + " wurde erfolgreich angelegt." 
        })
    }else{
        res.render('login.ejs', {                    
        })    
    }
})

app.get('/profilBearbeiten',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']
    
    if(idKunde){
        console.log("Kunde ist angemeldet als " + idKunde)
        
        // ... dann wird kontoAnlegen.ejs gerendert.
        
        res.render('profilBearbeiten.ejs', {    
            meldung : ""                          
        })
    }else{
        res.render('login.ejs', {                    
        })    
    }
})

app.post('/profilBearbeiten',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']
    
    if(idKunde){
        console.log("Kunde ist angemeldet als " + idKunde)
        
        kunde.Telefonnummer = req.body.telefonnummer
        kunde.Mail = req.body.mail
        kunde.Adresse = req.body.adresse
        kunde.Nachname = "Schmidt"
        kunde.Kennwort = req.body.kennwort
        
        res.render('profilBearbeiten.ejs', {                              
            meldung : "Die Stammdaten wurden geändert."
        })
    }else{
        // Die login.ejs wird gerendert 
        // und als Response
        // an den Browser übergeben.
        res.render('login.ejs', {                    
        })    
    }
})

app.get('/ueberweisen',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']
    
    if(idKunde){
        console.log("Kunde ist angemeldet als " + idKunde)
        
        // ... dann wird kontoAnlegen.ejs gerendert.
        
        res.render('ueberweisen.ejs', {    
            meldung : ""                          
        })
    }else{
        res.render('login.ejs', {                    
        })    
    }
})

app.post('/ueberweisen',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']
    
    if(idKunde){
        console.log("Kunde ist angemeldet als " + idKunde)
        
        // Das Zielkonto und der Betrag wird aus dem Formular entgegengenommen.

        let zieliban = req.body.zieliban
        let betrag = req.body.betrag
        



        /*
        // Der aktuelle Anfangssaldo wird aus der Datenbank ausgelesen

        dbVerbindung.connect(function(err){

            dbVerbindung.query("SELECT anfangssaldo FROM konto WHERE iban = '" + zielkontonummer + "';", function(err, result){
                if(err){
                    console.log("Es ist ein Fehler aufgetreten: " + err)
                }else{
                    console.log("Tabelle erstellt bzw. schon existent.")    
                }        
            })
        })
        */


        //ToDo: Saldo um den Betrag reduzieren mit einem SQL-UPDATE.

        dbVerbindung.connect(function(err){

            dbVerbindung.query("UPDATE konto SET anfangssaldo = anfangssaldo + " + betrag + " WHERE iban = '" + zielkontonummer + "' ;", function(err, result){
                if(err){
                    console.log("Es ist ein Fehler aufgetreten: " + err)
                }else{
                    console.log("Tabelle erstellt bzw. schon existent.")                     
                }        
            })
        })


        //ToDo: Betrag beim Zielkonto gutschreiben mit einem SQL-UPDATE.

        // Umsetzung mit einer gemeinsamen relationalen Datenbank.

        res.render('ueberweisen.ejs', {                              
            meldung : "Die Überweisung wurde erfolgreich ausgeführt."
        })
    }else{
        // Die login.ejs wird gerendert 
        // und als Response
        // an den Browser übergeben.
        res.render('login.ejs', {                    
        })    
    }
})

app.get('/kontoAbfragen',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']
    
    dbVerbindung.connect(function(err){

        dbVerbindung.query("SELECT anfangssaldo FROM konto WHERE idKunde = '" + idKunde + "';", function(err, result){
            if(err){
                console.log("Es ist ein Fehler aufgetreten: " + err)
            }else{
                if(result[0] != null)
                    console.log("Kontostand wurde erfolgreich abgefragt. Der Kontostand ist: " + result[0].anfangssaldo)                                     
            }        
        })
    })


    if(idKunde){
        console.log("Kunde ist angemeldet als " + idKunde)
        res.render('kontoAbfragen.ejs', { 
            meldung : "Hallo"                             
        })
    }else{
        res.render('login.ejs', {                    
        })    
    }
})


app.get('/zinsrechnung',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']


    if(idKunde){
        console.log("Kunde ist angemeldet als " + idKunde)
        res.render('zinsrechnung.ejs', { 
            meldung : "Hallo"                             
        })
    }else{
        res.render('login.ejs', {                    
        })    
    }
})


app.post('/zinsrechnung',(req, res, next) => {   

    let idKunde = req.cookies['istAngemeldetAls']
    
    if(idKunde){
        console.log("Kunde ist angemeldet als " + idKunde)
        var kapital = req.body.startkapital
        console.log("Kapital: " + kapital)
        var zinssatz = req.body.zinssatz
        console.log("Zinsssatz: " + zinssatz)
        var laufzeit = req.body.laufzeit
        console.log("Laufzeit: "+ laufzeit)

        var jahr;
        for (jahr = 0; jahr < laufzeit ; jahr++)
        {
            kapital = kapital * zinssatz / 100 + parseFloat(kapital)
            console.log("E-Kapital:" + kapital)
        }

        res.render('zinsrechnung.ejs', {                              
            meldung : "Die Zinsen wurden berechnet. Endkapital:" + kapital 
        })
    }else{
        // Die login.ejs wird gerendert 
        // und als Response
        // an den Browser übergeben.
        res.render('login.ejs', {                    
        })    
    }
})