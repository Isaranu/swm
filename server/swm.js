/* Import mongojs module */
var mongojs = require("mongojs");
var swmdb = mongojs('swmdb');
var stddb = mongojs('stddb');

/* Import Promise module */
var Promise = require('promise');

/* Import  split-string */
var split = require('split-string');

var moment = require('moment');

/* Setup UDP protocol connection */
var dgram = require("dgram");
var server = dgram.createSocket("udp4");
var PORT = 5683;       /* udp port (DEFAULT: 5683) */

var {google} = require('googleapis');
var credential = require('./credential.json');

/* Set auth for google sheet */
var jwt = getJwt();
var apiKey = getApiKey();
var spreadsheetId = '1QvDJp9JV21R0z1uGcHnlVsumUHEmaYFE0lfHDzMuwj8';
const sheets = google.sheets({version: 'v4'});

var nbiot_port, nbiot_address;
var cliresp;
var d, ts, ts_pretty;

//var cnt, csq, device_id, flowrate, flowaccum;
var mode, device_id, month, day, hr, vol;
var orderJson = {remained:0, block_hrs:0};
var limit_vol, block_hrs;

var operation_mode = 'gsheets'; // 1. 'gsheets', 2. 'db'

/* Start event "listening" connection from IoT */
server.on("listening", function(){
    var address = server.address();
    console.log("Smart water meter protocol started at  " + address.port);
});

server.bind(PORT);

server.on("message", function (message, remote) {

    nbiot_port = remote.port;
    nbiot_address = remote.address;

    console.log('1. ' + nbiot_address + ":" + nbiot_port +' - incoming message = ' + message + ' | ' + message.length + ' bytes');
    parsedMsg = String(message);

    var splited_arr = split(parsedMsg, {separator:':'});
    month = splited_arr[0];
    day = splited_arr[1];
    hr = splited_arr[2];
    vol = splited_arr[3];
    device_id = splited_arr[4];

    switch(true){

      case operation_mode == 'gsheets':

        /* --- MODE : Google sheets operation --- */
        var convTimeFormat = new Promise(function(resolve, reject){
          var nowDate = new Date();
          var FullYear = nowDate.getFullYear();
          var rawDate = FullYear + '-' + month + '-' + day + ',' + hr + ':00:00';
          resolve(rawDate);
        });

        convTimeFormat.then(function(result){
          var convertedTime = moment(result).format('MMMM Do YYYY, h:mm:ss a');
          var convertedTime_unix = moment(result).unix()*1000; // set unix time to ms unit

          /* Record data to Google sheets */
          writeAppendToSheet("log!A1", convertedTime, vol, device_id);

          /* Record data to Database */
          recordVolData(convertedTime, convertedTime_unix, vol, device_id);

          clirep = new Buffer(JSON.stringify(orderJson));
          server.send(clirep, 0, clirep.length, nbiot_port, nbiot_address, function(err){
            if(err) return console.log(err);
            console.log('4. Process finished');
          });

          /* --- CLOSE about read after calculated ----
          //overWriteToSheet("dashboard!B1", String(device_id));
          //overWriteToSheet("dashboard!B2", Number(vol));
          //overWriteToSheet("dashboard!B3", String(convertedTime));

          var readConfig_arr = ['config!B1', 'config!B2'];
          var read_promise = [];

          for(var i in readConfig_arr){
            read_promise[i] = new Promise(function(resolve, reject){

              sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: readConfig_arr[i],
                auth: jwt,
                key: apiKey,
              }, function(err, result){
                if(err) return console.log(err);
                //console.log(result.data.values[0]);
                resolve(result.data.values[0]);
              });
            });
          }

          Promise.all(read_promise).then(function(alldataArr){

            console.log('>> Remained litre = ' + alldataArr[0] + ' litre');
            console.log('>> Block time = ' + alldataArr[1] + ' hr(s)');

            orderJson.remained = Number(alldataArr[0]);
            orderJson.block_hrs = Number(alldataArr[1]);

          });
          */

        });
        break;

      case operation_mode == 'db':

        /* --- MODE : Database --- */
        var std_promise = new Promise(function(resolve, reject){
        var std_col = stddb.collection('std');
            std_col.find({}, function(err, std_docs){
              console.log(std_docs[0]);
              if(err) return console.log('std data read error');
              resolve(std_docs[0]);
            });
          });

          std_promise.then(function(result){

            var control_vol = result.limit_litre;
            var remained_vol = control_vol - Number(vol);

            var resp_str = {REMAINED:"",BLOCK_HRS:String(result.block_hrs)};
            resp_str.REMAINED = String(remained_vol);

            clirep = new Buffer(JSON.stringify(resp_str));
            server.send(clirep, 0, clirep.length, nbiot_port, nbiot_address, function(err){
              if(err) console.log(err);
              console.log(JSON.stringify(resp_str));
              });

          });

        break;

        default:
          //..
      }

});

async function recordVolData(_convertedTime, _convertedTime_unix, _vol, _device_id){
  await recordVolDataAwait(_convertedTime, _convertedTime_unix, _vol, _device_id);
}

function recordVolDataAwait(_convertedTime, _convertedTime_unix, _vol, _device_id){
  return new Promise(function(resolve, reject){

    d = new Date();
    ts = d.getTime();

    var swmdb_col = swmdb.collection(String(_device_id));
    swmdb_col.insert({

      /* Dataset */
      metertime: _convertedTime,
      metertime_ts: _convertedTime_unix,
      vol: Number(_vol),
      ts: Number(ts),
      ts_pretty: moment(d).format('MMMM Do YYYY, h:mm:ss a')

    },function(err){
      if(err) return console.log(err);
      console.log('3. Recorded in Database');
    });
  });
}

function getJwt() {
  return new google.auth.JWT(
    credential.client_email, null, credential.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
}

function getApiKey() {
  return "AIzaSyAD1bKKfFI1xTBdelGHanXbRiwBQBLh9lA";
}

function writeAppendToSheet(_range, _convertedTime, _vol, _device_id){

    /* Get current server timestamp */
    var servertime = moment(new Date()).format('MMMM Do YYYY, h:mm:ss a');

    /* Set data row */
  	var row = ["Meter time = ", String(_convertedTime), "Volume = ", Number(_vol), String(_device_id), "Server push time = ", servertime];

    /* Start append to sheets */
    sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: _range,
      auth: jwt,
      key: apiKey,
      valueInputOption: 'RAW',
      resource: {values: [row]}
    }, function(err, result) {
      if (err) {
        throw err;
      }
      else {
        console.log('2. [GOOGLE SHEETS] : Updated sheet: ' + result.data.updates.updatedRange);
      }
  });
}

function overWriteToSheet(_range, _val){

    /* Start over write to sheets */
    sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: _range,
      auth: jwt,
      key: apiKey,
      valueInputOption: 'RAW',
      resource: {values: [[_val]]}
    }, function(err, result) {
      if (err) {
        throw err;
      }
      else {
        //console.log(result);
        //console.log('Updated sheet: ' + result.data.updates.updatedRange);
      }
    });
}

function readFromSheet(_range){

    /* Start read from specific cell on sheet */
    sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: _range,
      auth: jwt,
      key: apiKey,
    }, function(err, result){
      if(err) return console.log(err);
      console.log(result.data.values[0]);
      return result.data.values[0];
    });

}

/*
async function recordFlowData(_cnt, _csq, _device_id, _flowrate, _flowaccum){
  await recordFlowDataAwait(_cnt, _csq, _device_id, _flowrate, _flowaccum);
}

function recordFlowDataAwait(_cnt, _csq, _device_id, _flowrate, _flowaccum){
  return new Promise(function(resolve, reject){

      d = new Date();
      ts = d.getTime();

      var swmdb_collection = swmdb.collection(_device_id);
      swmdb_collection.insert({

        cnt: Number(_cnt),
        csq: Number(_csq),
        device_id: String(_device_id),
        flowrate: Number(_flowrate),
        flowaccum: Number(_flowaccum),
        ts: Number(ts),
        ts_pretty: moment(d).format('MMMM Do YYYY, h:mm:ss a')

      },function(err){
        if(err){
          console.log(err);

          clirep = new Buffer('db write error');
          server.send(clirep, 0, clirep.length, nbiot_port, nbiot_address, function(err){
            if(err) console.log(err);
            console.log('db write error');

          });
        }else {

          clirep = new Buffer('200 OK - Record completed');
          server.send(clirep, 0, clirep.length, nbiot_port, nbiot_address, function(err){
            if(err) console.log(err);
            //console.log('200 OK - Record completed');
          });

        }
      });

  });
}
*/

//--- For chart render ---

/* TIME FRAME Offset Unix timestamp */
var timeframeOffset = [
  -900000,       // Last 15 mins.  = timeframeModemode 0
  -3600000,      // Last 1 hr.     = timeframeModemode 1
  -86400000,     // Last 24 hrs    = timeframeModemode 2
  -259200000,    // Last 3 days    = timeframeModemode 3
  -604800000,    // Last 7 days    = timeframeModemode 4
  -2678400000,   // Last 1 month   = timeframeModemode 5
  -8035200000,   // Last 3 months  = timeframeModemode 6
  -16070400000,  // Last 6 months  = timeframeModemode 7
  -32140800000   // Last 1 year    = timeframeModemode 8
];
var rangeMode;

const express = require('express');
const app = express();
var chartport = 4000;

app.get('/', function(req, res){
  res.send('OK');
});

app.get('/getdata/:device_id/:rangemode', function (req, res) {

  var getdataStr = JSON.stringify(req.params);
  var getdataJson = JSON.parse(getdataStr);

  var nowDate = new Date();
  var nowTS = nowDate.getTime();
  var effRange = nowTS + timeframeOffset[Number(getdataJson.rangemode)];

  var swmdb_col = swmdb.collection(getdataJson.device_id);
  swmdb_col.find({$and:[{ts:{$gt:effRange}},{/* 2nd criteria */}]}, function(err, docs){
    if(err) return res.send(err);

    docs = docs.reverse();
    var dataset = [];
    //var cnt_log=[], csq_log=[], flowrate_log=[], flowaccum_log=[];
    var metertime_log = [], metertime_ts_log = [], vol_log = [], capperc_log = [], csq_log = [], ts_log = [], ts_pretty_log = [];

    for(var i in docs){
      metertime_log.push({x:moment(new Date(Number(docs[i].ts))).format('MM DD YY HH:mm:ss'),y:String(docs[i].metertime)});
      metertime_ts_log.push({x:moment(new Date(Number(docs[i].ts))).format('MM DD YY HH:mm:ss'),y:Number(docs[i].metertime_ts)});
      vol_log.push({x:moment(new Date(Number(docs[i].ts))).format('MM DD YY HH:mm:ss'),y:Number(docs[i].vol)});
      capperc_log.push({x:moment(new Date(Number(docs[i].ts))).format('MM DD YY HH:mm:ss'),y:Number(docs[i].capperc)});
      csq_log.push({x:moment(new Date(Number(docs[i].ts))).format('MM DD YY HH:mm:ss'),y:Number(docs[i].csq)});
      ts_log.push({x:moment(new Date(Number(docs[i].ts))).format('MM DD YY HH:mm:ss'),y:Number(docs[i].ts)});
      ts_pretty_log.push({x:moment(new Date(Number(docs[i].ts))).format('MM DD YY HH:mm:ss'),y:String(docs[i].ts_pretty)});
    }

    dataset.push({
      metertime: metertime_log,
      metertime_ts: metertime_ts_log,
      vol: vol_log,
      capperc: capperc_log,
      csq: csq_log,
      ts: ts_log,
      ts_pretty: ts_pretty_log
    });

    res.jsonp(dataset[0]);

  });

});

app.get('/resetdb/:device_id', function(req, res){
    var resetdbStr = JSON.stringify(req.params);
    var resetdbJson = JSON.parse(resetdbStr);

    device_id = resetdbJson.device_id;

    var resetdb_col = swmdb.collection(String(device_id));
    resetdb_col.remove({}, function(err){
      if(err) return res.send(err);
      res.send('reset database of ' + device_id + ' completed !');
    });

});

app.get('/readstd', function(req, res){

  var readstd_col = stddb.collection('std');
      readstd_col.find({}, function(err, docs){
        if(err) return res.send(err);
        console.log(docs[0]);
        res.send(docs[0]);
      });

});

app.get('/setstd/:litre/:blockhrs', function(req, res){

  var setstdStr = JSON.stringify(req.params);
  var setstdJson = JSON.parse(setstdStr);

  var setlitre = setstdJson.litre;
  var setblockhrs = setstdJson.blockhrs;

  var setstd_col = stddb.collection('std');
      setstd_col.update({},{$set:{

        limit_litre: Number(setlitre),
        block_hrs: Number(setblockhrs)

      }}, function(err){
          if(err) return res.send(err);
          res.send('set new standard OK');
      });

});

app.listen(chartport, function () {
  console.log('Start chart data render port at : ' + chartport);
});

//------------ Take Control ----------
/*
const express = require('express');
const app = express();
var controlPort = 4002;

app.get('/on', function(req, res){
  clirep = new Buffer('on');
  server.send(clirep, 0, clirep.length, nbiot_port, nbiot_address, function(err){
    if(err) console.log(err);
    console.log('on');
  });

  res.send('set ON');
});

app.get('/off', function(req, res){
  clirep = new Buffer('off');
  server.send(clirep, 0, clirep.length, nbiot_port, nbiot_address, function(err){
    if(err) console.log(err);
    console.log('off');
  });

  res.send('set OFF');
});

app.listen(controlPort, function(){
  console.log('Test control start listen request at port ' + controlPort);
});
*/
