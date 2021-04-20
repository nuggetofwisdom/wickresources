//Very useful website: https://www.gabrielgambetta.com/client-server-game-architecture.html

const HTTP = require("http");
const WebSocket = require("ws");

const UPDATE_TIME = 5; // in frames per second

class Player {
  constructor(ws, id) {
    this.x = 0;
    this.y = 0;
    this.ws = ws; // WebSocket connection
    this.id = id;
    ws.player = this;
  }
}

var players = {}; //A list of all the players
//This is a dictionary. The key will be the players' unique IDs,
//and the values will be the players themselves

var requestQueue = [];
//Instead of processing each request as they're made,
//only actually process them a few times per second
//Put them in a queue for processing when it is time

//This is a utility function that sends data to all the clients
function sendToAllPlayers(dat) {
  if (typeof dat === "object") dat = JSON.stringify(dat);

  for (let pid in players) {
    players[pid].ws.send(dat);
  }
}

//This function handles information sent from a client
function handleRequest(player, req) {
  if (req === "disconnect") {
    delete players[player.id];
    
    sendToAllPlayers({ type: "player_disconnected", id: player.id });
    return;
  }

  if (req === "connection") {
    sendToAllPlayers({ type: "player_connected", id: player.id });
    return;
  }

  if (req.type === "position") {
    player.x = +req.x; //unary plus operator converts things into numbers
    player.y = +req.y;
    return;
  }
}

var lastUpdate = 0;
//This function handles all the requests in the request queue
function handleRequests() {
  //get the time since the last update
  var now = Date.now();
  var dt = (now - lastUpdate) / 1000;
  lastUpdate = now;

  //console.log("Update");

  for (let req of requestQueue) {
    //console.log(req);
    handleRequest(req[0], req[1]);
  }

  //clear request queue
  requestQueue = [];

  //send the positions of all the players to every player, if there are any
  //to check if there are any players, check if the player list has keys
  //using .length on the player list won't work because length only works on numbered arrays
  //it is not an array, so it will not work.
  if (Object.keys(players).length > 0) {
    var posData = [];
    for (let i in players) {
      let player = players[i];
      let id = player.id;
      posData.push({
        id: id,
        x: player.x,
        y: player.y,
      });
    }

    sendToAllPlayers({ type: "positions", positions: posData, dt: dt });

    //i need to give the client the server update timestep for entity interpolation
    //entity interpolation is used to make movement look smooth, despite
    //the positions only updating a few times per second. this works by
    //simulating what happened for the player between server updates
    //in the client by interpolating the player's position, which is why
    //i must send the dt to the client
  }

  setTimeout(handleRequests, 1000 / UPDATE_TIME);
  //Not using setInterval, since if it takes longer than usual to run the function,
  //the function might execute while setInterval already ran the function again
  //overlapping the two's execution :O
}

///////////////////
// Create Server //
///////////////////

/*
//I will create an HTTP server which the WebSocket server will use for connecting...
//I think only HTTP server
const https = HTTP.createServer((req, res) => {
  res.statusCode = 400;
  res.end("This is the HTTP server for the websocket. There is nothing here in terms of HTTP content.");
});

https.listen(8080, () => {
  console.log("HTTP server running at port 8080");
})*/

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", function(ws) { //When someone connections
  //Player limit, up to 4 people 
  if (Object.keys(players).length >= 4) {
    console.log("Server full!");
    ws.close(1013, "Server is full -- max of 4 players"); //code 1013 means "Try Again Later"
    return;
  }

  console.log("New socket opened");

  //Generate random identifier ID for the player
  var id = Math.floor(Math.random() * 99999);
  var player = new Player(ws, id);
  players[id] = player;

  ws.on("message", function(msg) { //When the server receives a message from client
    var json;

    try {
      json = JSON.parse(msg);
    } catch(err) {
      console.log("Invalid json data from " + id);
      return;
    }

    requestQueue.push([player, json]);
  })

  ws.on("close", function() { //When the player disconnects
    console.log("Socket closed");
    requestQueue.push([player, "disconnect"]);
  })

  //Tell all other clients a new player joined
  requestQueue.push([player, "connection"]);

  //Send client's ID and other players' ids and position to the client
  var posData = [];

  for (let i in players) {
    let p = players[i];
    if (p.id === id) continue; //ignore own client

    posData.push({
      id: p.id,
      x: p.x,
      y: p.y
    });
  }

  var initData = {
    type: "init",
    id: id,
    players: posData
  }

  //console.log(initData);
  ws.send(JSON.stringify(initData));
});

wss.on("listening", function() {
  console.log("Websocket server listening on port 8080");

  lastUpdate = Date.now();
  handleRequests();
})
