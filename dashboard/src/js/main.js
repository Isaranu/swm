/* ############# Generate widget ############# */
/* TIME FRAME Offset Unix timestamp
	Last 60 sec. 		> MODE = -1
  Last 15 mins.   > MODE = 0
	Last 1 hr. 			> MODE = 1
	Last 24 hrs 		> MODE = 2
	Last 3 days			> MODE = 3
	Last 7 days			> MODE = 4
	Last 1 month		> MODE = 5
	Last 3 months		> MODE = 6
	Last 6 months		> MODE = 7
	Last 1 year			> MODE = 8
*/

var YearFormat = "MMMM/YYYY";
var sixMonthsFormat = "MMMM/YYYY";
var threeMonthsFormat = "MMMM/YYYY";
var MonthFormat = "MMMM/YYYY";
var SevenDayFormat = "MM DD YY HH:mm:ss";
var ThreeDayFormat = "MM DD YY HH:mm:ss";
var twentyFourHourFormat = "HH:mm:ss";
var HourFormat = "HH:mm:ss";
var fifthteenMinFormat = "HH:mm:ss";
var sixtySecFormat = "HH:mm:ss";

var YearObj = [newMonths(-11),newMonths(-10),newMonths(-9),newMonths(-8),newMonths(-7),newMonths(-6),newMonths(-5),newMonths(-4),newMonths(-3),newMonths(-2),newMonths(-1),newMonths(0)];
var sixMonthObj = [newMonths(-5),newMonths(-4),newMonths(-3),newMonths(-2),newMonths(-1),newMonths(0)];
var threeMonthObj = [newMonths(-2),newMonths(-1),newMonths(0)];
var MonthObj = [newMonths(-1), newMonths(0)];
var sevenDayObj = [newDate(-6),newDate(-5),newDate(-4),newDate(-3),newDate(-2),newDate(-1),newDate(0)];
var threeDayObj = [newDate(-2),newDate(-1),newDate(0)];
var twentyFourHourObj = [newHours(-24),newHours(-20),newHours(-16),newHours(-12),newHours(-8),newHours(-4),newHours(0)];
var hourObj = [newMinutes(-60),newMinutes(-50),newMinutes(-40),newMinutes(-30),newMinutes(-20),newMinutes(-10),newMinutes(0)];
var fifthteenMinObj = [newMinutes(-15),newMinutes(-10),newMinutes(-5),newMinutes(0)];
var sixtySecObj = [newSeconds(-60),newSeconds(-50),newSeconds(-40),newSeconds(-30),newSeconds(-20),newSeconds(-10),newSeconds(0)];

var fifthteenMinObj_str = [newMinutesString(-15),newMinutesString(-10),newMinutesString(-5),newMinutesString(0)];

function newMonths(months){
  return moment().add(months, 'months');
}

function newDate(days){
  return moment().add(days, 'days');
}

function newHours(hours){
  return moment().add(hours, 'hours');
}

function newMinutes(minutes){
  return moment().add(minutes, 'minutes');
}

function newSeconds(seconds){
  return moment().add(seconds, 'seconds');
}

function newMinutesAgo(_mins){
  var timeMachine_min = moment().add(_mins, 'minutes');
  var now = new Date();
  return moment(timeMachine_min, now).fromNow();
}

/*-----------------------------------------------*/
function newMonthsString(months){
  return moment().add(months, 'months').format(MonthFormat);
}

function newDateString(days){
  return moment().add(days, 'days').format(DayFormat);
}

function newHoursString(hours){
  return moment().add(hours, 'hours').format(HourFormat);
}

function newMinutesString(minutes){
  return moment().add(minutes, 'minutes').format(fifthteenMinFormat);
}

function newSecondsString(seconds){
  return moment().add(seconds, 'seconds').format(SecFormat);
}

function regenRelativeTime(){
  YearObj = [newMonths(-11),newMonths(-10),newMonths(-9),newMonths(-8),newMonths(-7),newMonths(-6),newMonths(-5),newMonths(-4),newMonths(-3),newMonths(-2),newMonths(-1),newMonths(0)];
  sixMonthObj = [newMonths(-5),newMonths(-4),newMonths(-3),newMonths(-2),newMonths(-1),newMonths(0)];
  threeMonthObj = [newMonths(-2),newMonths(-1),newMonths(0)];
  MonthObj = [newMonths(-1), newMonths(0)];
  sevenDayObj = [newDate(-6),newDate(-5),newDate(-4),newDate(-3),newDate(-2),newDate(-1),newDate(0)];
  threeDayObj = [newDate(-2),newDate(-1),newDate(0)];
  twentyFourHourObj = [newHours(-24),newHours(-20),newHours(-16),newHours(-12),newHours(-8),newHours(-4),newHours(0)];
  hourObj = [newMinutes(-60),newMinutes(-50),newMinutes(-40),newMinutes(-30),newMinutes(-20),newMinutes(-10),newMinutes(0)];
  fifthteenMinObj = [newMinutes(-15),newMinutes(-10),newMinutes(-5),newMinutes(0)];
  sixtySecObj = [newSeconds(-60),newSeconds(-50),newSeconds(-40),newSeconds(-30),newSeconds(-20),newSeconds(-10),newSeconds(0)];
}

var rangeMode = 2; // 24 hrs ago
//var volume_canvas = document.getElementById('volume_chart').getContext('2d');
//var capperc_canvas = document.getElementById('capperc_chart').getContext('2d');

var volume_solar_chart = document.getElementById('volume_solar_chart').getContext('2d');
var total_vol_solar_chart = document.getElementById('total_vol_solar_chart').getContext('2d');
//var solar_power_chart = document.getElementById('solar_power_chart').getContext('2d');
//var battery_voltage_chart = document.getElementById('battery_voltage_chart').getContext('2d');

var setdata_updated_solar_calendar = [];

var supercap_chart, solar_chart;
var supercap_options, solar_options;

var volume_datasets = {
  label: 'ปริมาตรของน้ำที่ไหลผ่าน Sensor ไปแล้ว (ลิตร)',
  fill: true,
  backgroundColor: 'rgba(66,134,244,0.3)',
  borderColor: 'rgb(66, 134, 244)',
  data: []
};

var capperc_datasets = {
  label: '% Capacitor voltage',
  fill: true,
  backgroundColor: 'rgba(247, 99, 86, 0.3)',
  borderColor: 'rgb(247, 99, 86)',
  data: []
};

var volume_solar_datasets = {
  label: 'อัตราการไหลของน้ำ (มิลลิลิตรต่อวินาที)',
  fill: true,
  backgroundColor: 'rgba(130, 246, 255, 0)',
  borderColor: 'rgb(130, 246, 255)',
  data: []
};

var total_vol_solar_datasets = {
  label: 'ปริมาตรสะสมของน้ำที่ไหลผ่าน (ลิตร)',
  fill: true,
  backgroundColor: 'rgba(188, 89, 249, 0.5)',
  borderColor: 'rgb(188, 89, 249)',
  data: []
};
/*
var solar_power_datasets = {
  label: 'Solar power (Watt)',
  fill: true,
  backgroundColor: 'rgba(255, 221, 130, 0.3)',
  borderColor: 'rgb(255, 221, 130)',
  data: []
};

var battery_voltage_datasets = {
  label: 'Battery voltage status (volt)',
  fill: true,
  backgroundColor: 'rgba(130, 255, 161, 0.3)',
  borderColor: 'rgb(130, 255, 161)',
  data: []
};
*/

/* Pack data for chart */
var pack_vol_datasets = [
  volume_datasets
];

var pack_capperc_datasets = [
  capperc_datasets
];

var pack_volume_solar_datasets = [
  volume_solar_datasets
];

var pack_total_vol_solar_datasets = [
  total_vol_solar_datasets
];

/*
var pack_solar_power_datasets = [
  solar_power_datasets
];

var pack_battery_voltage_datasets = [
  battery_voltage_datasets
];
*/

var myChart;

initialTimeFrame = twentyFourHourObj;
initialTimeLabel = 'Last 24hrs ago';

//getdata('smart_water_meter_1', rangeMode);
//getdata('supercap', 'prototype', rangeMode);
getdata('solar', 'prototype', rangeMode);
drawchart();
updatechart();
//testbarchart();

setInterval(function(){
  //getdata('supercap', 'prototype', rangeMode);
  getdata('solar', 'prototype', rangeMode);
  //getDataForDailyLog();
  getUsedDailyData();
  updatechart();
}, 10000);

function getdata(_mode, _device_id, _rangeMode){

  var getdataPath = '';

  switch (true) {
    case _mode == 'supercap':
      getdataPath = 'http://35.198.231.121:4000/getdata/';
      break;
    case _mode == 'solar':
      getdataPath = 'http://35.198.231.121:4001/getdata/';
      break;
    default:
      //..
  }

      getdataPath += _device_id;
      getdataPath += '/';
      getdataPath += _rangeMode;
      getdataPath += '?output=jsonp&callback=?';

  $.getJSON(getdataPath,{
    //..
  }).then(function(log){
    console.log(log);

    switch (true) {
      case _mode == 'supercap':
        //console.log(log.flowaccum);
        //console.log('length : ' + log.flowrate.length);
        //console.log(log.flowrate[0].x);
        //var latest_flowrate = log.flowrate[0].y;
        //$('#flow_rate_data_span').text(latest_flowrate);
        volume_datasets.data = log.vol;
        capperc_datasets.data = log.capperc;

        pack_vol_datasets = [
          volume_datasets
        ];

        pack_capperc_datasets = [
          capperc_datasets
        ];

        //console.log(pack_vol_datasets);
        break;
      case _mode == 'solar':

        volume_solar_datasets.data = log.vol;
        total_vol_solar_datasets.data = log.total_vol;

        break;
      default:

    }


  });

}

function drawchart(){

/*
  volume_canvas = new Chart(volume_chart, {
    type: 'line',
    data: {
        labels: initialTimeFrame,
        datasets: pack_vol_datasets
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      legend:{
        labels:{
          fontColor: 'rgb(0,0,0)'
        }
      },
      title: {
        display: true,
        fontSize: 16,
        text:'ปริมาตรของน้ำที่ไหลผ่าน Sensor ไปแล้ว (ลิตร)'
      },
      elements:{
        line:{
          borderWidth: 0,
          tension: 0 // Make line to strength line (no curved)
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            format: 'MM DD YY HH:mm:ss',
            tooltipFormat: 'll HH:mm'
          },
          scaleLabel: {
            display: true,
            labelString: initialTimeLabel,
            fontColor: 'rgb(0,0,0)',
            padding: -50
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'ปริมาตรของน้ำรวม (ลิตร)',
            fontColor: 'rgb(0,0,0)',
            padding: 4
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }]
      },
    }
  });

  capperc_canvas = new Chart(capperc_chart, {
    type: 'line',
    data: {
        labels: initialTimeFrame,
        datasets: pack_capperc_datasets
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      legend:{
        labels:{
          fontColor: 'rgb(0,0,0)'
        }
      },
      title: {
        display: true,
        fontSize: 16,
        text:'Capacitor voltage (%)'
      },
      elements:{
        line:{
          tension: 0 // Make line to strength line (no curved)
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            format: 'MM DD YY HH:mm:ss',
            tooltipFormat: 'll HH:mm'
          },
          scaleLabel: {
            display: true,
            labelString: initialTimeLabel,
            fontColor: 'rgb(0,0,0)',
            padding: -50
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: '%',
            fontColor: 'rgb(0,0,0)',
            padding: 4
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }]
      },
    }
  });
*/
  volume_solar_canvas = new Chart(volume_solar_chart, {
    type: 'line',
    data: {
        labels: initialTimeFrame,
        datasets: pack_volume_solar_datasets
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      legend:{
        labels:{
          fontColor: 'rgb(0,0,0)'
        }
      },
      title: {
        display: true,
        fontSize: 16,
        text:'อัตราการไหลของน้ำ (มิลลิลิตรต่อวินาที)'
      },
      elements:{
        line:{
          tension: 0 // Make line to strength line (no curved)
        },
        point:{
          radius: 0
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            format: 'MM DD YY HH:mm:ss',
            tooltipFormat: 'll HH:mm'
          },
          scaleLabel: {
            display: true,
            labelString: initialTimeLabel,
            fontColor: 'rgb(0,0,0)',
            padding: -50
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'ml/sec.',
            fontColor: 'rgb(0,0,0)',
            padding: 4
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }]
      },
    }
  });

  total_vol_solar_canvas = new Chart(total_vol_solar_chart, {
    type: 'line',
    data: {
        labels: initialTimeFrame,
        datasets: pack_total_vol_solar_datasets
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      legend:{
        labels:{
          fontColor: 'rgb(0,0,0)'
        }
      },
      title: {
        display: true,
        fontSize: 16,
        text:'ปริมาตรของน้ำที่ไหลผ่าน (ลิตร)'
      },
      elements:{
        line:{
          tension: 0 // Make line to strength line (no curved)
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            format: 'MM DD YY HH:mm:ss',
            tooltipFormat: 'll HH:mm'
          },
          scaleLabel: {
            display: true,
            labelString: initialTimeLabel,
            fontColor: 'rgb(0,0,0)',
            padding: -50
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'litre',
            fontColor: 'rgb(0,0,0)',
            padding: 4
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }]
      },
    }
  });

/*
  solar_power_canvas = new Chart(solar_power_chart, {
    type: 'line',
    data: {
        labels: initialTimeFrame,
        datasets: pack_solar_power_datasets
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      legend:{
        labels:{
          fontColor: 'rgb(0,0,0)'
        }
      },
      title: {
        display: true,
        fontSize: 16,
        text:'พลังงาน Solar cell (amp)'
      },
      elements:{
        line:{
          tension: 0 // Make line to strength line (no curved)
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            format: 'MM DD YY HH:mm:ss',
            tooltipFormat: 'll HH:mm'
          },
          scaleLabel: {
            display: true,
            labelString: initialTimeLabel,
            fontColor: 'rgb(0,0,0)',
            padding: -50
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'vAh',
            fontColor: 'rgb(0,0,0)',
            padding: 4
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }]
      },
    }
  });

  battery_voltage_canvas = new Chart(battery_voltage_chart, {
    type: 'line',
    data: {
        labels: initialTimeFrame,
        datasets: pack_battery_voltage_datasets
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      legend:{
        labels:{
          fontColor: 'rgb(0,0,0)'
        }
      },
      title: {
        display: true,
        fontSize: 16,
        text:'สถาณะ battery (volt)'
      },
      elements:{
        line:{
          tension: 0 // Make line to strength line (no curved)
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            format: 'MM DD YY HH:mm:ss',
            tooltipFormat: 'll HH:mm'
          },
          scaleLabel: {
            display: true,
            labelString: initialTimeLabel,
            fontColor: 'rgb(0,0,0)',
            padding: -50
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'volt',
            fontColor: 'rgb(0,0,0)',
            padding: 4
          },
          ticks:{
            fontSize : 9,
            fontColor: 'black'
          },
          gridLines:{
            display: true,
            borderDash: [20,10],
            color: 'rgb(224,224,224)'
          }
        }]
      },
    }
  });
*/
}

function updatechart(){

  regenRelativeTime();

  initialTimeFrame = twentyFourHourObj;
  initialTimeLabel = 'Last 24hrs ago';

/*
  volume_canvas.data.datasets = pack_vol_datasets;
  volume_canvas.data.labels = initialTimeFrame;
  volume_canvas.options.scales.xAxes[0].scaleLabel.labelString = initialTimeLabel;
  volume_canvas.update();

  capperc_canvas.data.datasets = pack_capperc_datasets;
  capperc_canvas.data.labels = initialTimeFrame;
  capperc_canvas.options.scales.xAxes[0].scaleLabel.labelString = initialTimeLabel;
  capperc_canvas.update();
*/

  //myChart.data.datasets[0].data = ;
  //console.log('volume_datasets.data = ' + JSON.stringify(volume_datasets.data[0]));
  //myChart.data.labels = fifthteenMinObj_str;
  //myChart.update();

  volume_solar_canvas.data.datasets = pack_volume_solar_datasets;
  volume_solar_canvas.data.labels = initialTimeFrame;
  volume_solar_canvas.options.scales.xAxes[0].scaleLabel.labelString = initialTimeLabel;
  volume_solar_canvas.update();

  total_vol_solar_canvas.data.datasets = pack_total_vol_solar_datasets;
  total_vol_solar_canvas.data.labels = initialTimeFrame;
  total_vol_solar_canvas.options.scales.xAxes[0].scaleLabel.labelString = initialTimeLabel;
  total_vol_solar_canvas.update();

}

function testbarchart(){
  var ctx = document.getElementById('myChart').getContext('2d');
  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: fifthteenMinObj_str,
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor:
                'rgba(255, 99, 132, 0.2)',
            borderColor:
                'rgba(255, 99, 132, 1)',
            borderWidth: 0
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: false
                }
            }]
        }
    }
});
}

google.charts.load("current", {packages:["calendar"]});
//google.charts.setOnLoadCallback(draw_supercap_calender);
//google.charts.setOnLoadCallback(getDataForDailyLog);
google.charts.setOnLoadCallback(getUsedDailyData);

function getDataForDailyLog(){
  var getDailyLogPath = 'http://35.198.231.121:4001/dailylog';
      getDailyLogPath += '?output=jsonp&callback=?';

  $.getJSON(getDailyLogPath, {
    //..
  }).then(function(dailylog){
    console.log('dailylog : ' + dailylog);
    console.log('dailylog size : ' + dailylog.length);
    console.log('dailylog array[0] = ' + dailylog[0].total_vol);

    setdata_updated_solar_calendar = [];

    for(var i in dailylog){
      setdata_updated_solar_calendar.push(
        [new Date(dailylog[i].fullyear, dailylog[i].month, dailylog[i].day), Number(dailylog[i].total_vol)]
      );
    }

    console.log(setdata_updated_solar_calendar);
    draw_solar_calender(setdata_updated_solar_calendar);

  });

}

function draw_solar_calender(_dataRowsArray) {

       var dataTable_solar = new google.visualization.DataTable();
       dataTable_solar.addColumn({ type: 'date', id: 'Date' });
       dataTable_solar.addColumn({ type: 'number', id: 'Litre' });
       dataTable_solar.addRows(_dataRowsArray);

       solar_chart = new google.visualization.Calendar(document.getElementById('solar_calendar'));

       solar_options = {
         title: "ปริมานน้ำที่ใช้แต่ละวัน (ระบบ Solar cell)",
         height: 400,
         noDataPattern: {
           backgroundColor: '#d8d8d8',
           color: '#e1e1e1'
         },
         calendar: {
           monthOutlineColor: {
             stroke: '#981b48',
             strokeOpacity: 0.8,
             strokeWidth: 2
           },
           unusedMonthOutlineColor: {
             stroke: '#606060',
             strokeOpacity: 0.8,
             strokeWidth: 1
           },
           focusedCellColor: {
             stroke: '#d3362d',
             strokeOpacity: 1,
             strokeWidth: 1,
           }
         }
       };

       solar_chart.draw(dataTable_solar, solar_options);
}

function getUsedDailyData(){
  var getUsedDailyDataPath = 'http://35.198.231.121:4001/useddailylog';
      getUsedDailyDataPath += '?output=jsonp&callback=?';

  $.getJSON(getUsedDailyDataPath, {
    //..
  }).then(function(useddailylog){
    //console.log(useddailylog);

    setdata_updated_solar_calendar = [];
    for(var i in useddailylog){
      setdata_updated_solar_calendar.push(
        [new Date(useddailylog[i].ts), Number(useddailylog[i].vol_daily_use)]
      );
    }

    console.log(setdata_updated_solar_calendar);
    draw_solar_calender(setdata_updated_solar_calendar);

  });

}

/*
function draw_supercap_calender() {

       var dataTable_supercap = new google.visualization.DataTable();
       dataTable_supercap.addColumn({ type: 'date', id: 'Date' });
       dataTable_supercap.addColumn({ type: 'number', id: 'Litre' });
       dataTable_supercap.addRows([
          [new Date(2019, 2, 4), 20],
          [new Date(2019, 2, 5), 20.5],
          [new Date(2019, 2, 12), 50],
          [new Date(2019, 2, 13), 45],
          [new Date(2019, 2, 19), 42],
          [new Date(2019, 2, 23), 41],
          [new Date(2019, 2, 24), 60],
          [new Date(2019, 2, 30), 5]
        ]);

      supercap_chart = new google.visualization.Calendar(document.getElementById('supercap_calendar'));

       var supercap_options = {
         title: "ปริมานน้ำที่ใช้แต่ละวัน (Super Capacitor)",
         height: 400,
       };

       supercap_chart.draw(dataTable_supercap, supercap_options);
}
*/
