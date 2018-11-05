/* Global */
let _GLOBAL = {
  gap: 240000, // 4 Mins
  raw_schedules: [/* 2D array */],
  schedules_by_interval: [/* JSON Object */],
  tables: {
    "Last Interval's Lunches": "",
    "Current Lunches": "",
    "Scheduled Lunches": "",
    "Next Interval's Lunches": "",

    "Last Interval's Breaks": "",
    "Current Breaks": "",
    "Scheduled Breaks": "",
    "Next Interval's Breaks": ""
  },
  dashboard:  ""/* DOM Dashboard */,
  agentsList: ""/* DOM Dashboard */,
  groups: {
    "24 7 Intouch Tampa":        "TPA",
    "24 7 Intouch Gaut" :        "GTM",
    "24 7 Intouch Guat Spanish": "GTM"
  },
  interval: {
    last: {
      "breaks":  [/* agent names */],
      "lunches": [/* agent names */],
      "starts":  [/* agent names */]
    },
    current: {
      "breaks":  [/* agent names */],
      "lunches": [/* agent names */],
      "starts":  [/* agent names */]
    },
    next: {
      "breaks":  [/* agent names */],
      "lunches": [/* agent names */],
      "starts":  [/* agent names */]
    }
  },
  count: {
    break: {
      totalOut: 0,
      scheduled: 0,
      onTime: 0,
      notOnTime: 0
    },
    lunch: {
      totalOut: 0,
      scheduled: 0,
      onTime: 0,
      notOnTime: 0
    }
  }
}

// --- CLASSES --- //
class Table {
  /*
  * @param {DOMElement} parent  DOM Element that will contain the table.
  * @param {String}     title   Title of the table.
  * @param {Boolean}    current Whether or not this table will show the current pauses.    
  */
  constructor(parent, title, current)
  {
    this.parent = parent;
    this.title  = title || "Table";
    this.current = current;
  }
  /*
  * Creates the table and appends it to the parent.
  */
  create() {
    if(!this.parent)
    {
      throw new Error("Parent not defined.");
    }

    this.body = document.createElement("div");
    this.body.classList.add("monitor-list");

    this.body.innerHTML = `
      <div class="title">${this.title}</div>
      <ul>
      </ul>
    `;

    this.parent.appendChild(this.body);
  }
  /*
  * Adds agent(s) to the table
  * 
  * @params {Array} arr Array of Agent instances.
  */
  add(arr)
  {
    arr.forEach(agent => {
      if(agent.constructor === Agent)
      {
        agent.appendToTable();
      }
      else
      {
        let li = document.createElement("li");
        let st_key = agent[0].toLowerCase().replace(" ", "_");
        let nm_key = agent[1].toLowerCase().replace(" ", "_");

        li.setAttribute("data-id", `${st_key}_${nm_key}`);

        li.innerHTML = `
          <div class="site">${agent[0]}</div>
          <div class="name">${agent[1]}</div>
        `;

        if(agent[2])
        {
          if(agent[3])
          {
            li.setAttribute("data-valid", agent[3].onTime);
            li.setAttribute("data-status", agent[3].status);
          }

          li.innerHTML += `
            <div class="time">${agent[2]}</div>
          `;
        }
        else
        {
          li.innerHTML += `
            <div class="time">0:00</div>
          `;
        }

        this.body.querySelector("ul").appendChild(li);
      }
    });
  }
  /*
  * Moves the unscheduled agents to the top.
  */
  sort()
  {
    let agentsObj = this.body.querySelectorAll("li");
    let agents = Object.assign([], agentsObj);

    agents.sort((a, b) => {
      let data_valid_a = a.getAttribute("data-status");
      let data_valid_b = b.getAttribute("data-status");

      if(data_valid_a > data_valid_b)
      {
        return 1;
      }
      else if(data_valid_b > data_valid_a)
      {
        return -1;
      }
      else
      {
        let a_time_str = a.querySelector(".time").textContent;
        let b_time_str = b.querySelector(".time").textContent;

        let a_time = timeStrToMilliseconds(a_time_str);
        let b_time = timeStrToMilliseconds(b_time_str);

        if(a_time > b_time)
        {
          return -1;
        }
        else if(b_time > a_time)
        {
          return 1;
        }
        else
        {
          return 0;
        }
      }
    });

    let new_agents = agents.map(li => {
      let childs = li.children;
      let site = childs[0].textContent;
      let name = childs[1].textContent;
      let time = childs[2].textContent;
      let data_valid = li.getAttribute("data-valid");
      let data_status = li.getAttribute("data-status");

      return [site, name, time, {onTime: data_valid, status: data_status}];
    });

    this.clean();
    this.add(new_agents);
  }
  /*
  * Cleans table list of agents.
  */
  clean()
  {
    this.body.querySelector("ul").innerHTML = "";
  }
}

class Agent {
  constructor(site, name, pause, time)
  {
    this.site      = site;
    this.name      = name;
    this.pause     = pause;
    this.timeStr   = time;
    this.time      = timeStrToMilliseconds(time) || "-:--";
    this.pauseType = pause;

    let nm_key = name.toLowerCase().replace(" ", "_");
    let st_key = site.toLowerCase().replace(" ", "_");
    let li_id  = `${st_key}_${nm_key}`;

    this.id = li_id;

    this.validation = {
      onTime: true,
      status: 1 // -1 out of adherence, 0 ooa but withing the allowed gap, 1 on time
    }
  }

  create()
  {
    this.li = document.createElement("li");
    this.li.setAttribute("data-id", this.id);

    this.li.innerHTML = `
      <div class="site">${this.site}</div>
      <div class="name">${this.name}</div>
      <div class="time">${this.timeStr}</div>
    `;
  }

  addToList()
  {
    if(this.pause === "lunch")
    {
      this.pauseType = "lunch";
      _GLOBAL.interval.current.lunches.push(this);
    }
    else if(this.pause === "break")
    {
      this.pauseType = "break";
      _GLOBAL.interval.current.breaks.push(this);
    }
  }

  appendToTable()
  {
    if(this.pauseType === "break")
    {
      let ul = _GLOBAL.tables["Current Breaks"].body.querySelector("ul");
      ul.appendChild(this.li);
    }
    else if(this.pauseType === "lunch")
    {
      let ul = _GLOBAL.tables["Current Lunches"].body.querySelector("ul");
      ul.appendChild(this.li);
    }

    this.validatePause();
  }

  validatePause()
  {
    if(this.pauseType === "break")
    {
      let table = _GLOBAL.tables["Scheduled Breaks"].body;
      let li = table.querySelector(`li[data-id="${this.id}"]`);
      //
      _GLOBAL.count.break.totalOut++;

      if(!li)
      {
        this.validation.onTime = false;
        this.validation.status = -1;

        _GLOBAL.count.break.notOnTime++;
      }
      else
      {
        let limit   = li.querySelector(".time").textContent;
        let limit_n = timeStrToMilliseconds(limit);

        this.validation.onTime = true;
        _GLOBAL.count.break.onTime++;

        if(this.time > limit_n)
        {
          this.validation.onTime = false;
          this.validation.status = -1;
        }

        let now = new Date();
        // Minutes in milliseconds
        let now_mm = now.getMinutes() * 60000;
        // 0 | 15 | 30 | 45 in Milliseconds
        let interval = Math.floor(now_mm / 900000) * 900000;

        let dif = Math.abs( (now_mm - this.time) - interval );
        // 4 mins, 11 mins | In milliseconds
        let limits = [_GLOBAL.gap, (limit_n - _GLOBAL.gap)];

        this.validation.status = dif <= limits[0] || dif >= limits[1] ? 1 : 0;
      }
    }

    if(this.pauseType === "lunch")
    {
      let table = _GLOBAL.tables["Last Interval's Lunches"].body;
      let li = table.querySelector(`li[data-id="${this.id}"]`);
      //
      _GLOBAL.count.lunch.totalOut++;

      if(!li)
      {
        this.validation.onTime = false;
        this.validation.status = -1;

        _GLOBAL.count.lunch.notOnTime++;
      }
      else
      {
        let limit   = li.querySelector(".time").textContent;
        let limit_n = timeStrToMilliseconds(limit);

        this.validation.onTime = true;
        _GLOBAL.count.lunch.onTime++;

        if(this.time > limit_n)
        {
          this.validation.onTime = false;
          this.validation.status = -1;

          this.li.setAttribute("data-valid", this.validation.onTime);
          this.li.setAttribute("data-status", this.validation.status);
          return;
        }

        // Current time
        let now = new Date();
        let now_mm = now.getMinutes();
        let interval = Math.floor(now_mm / 15) * 15;
        // Current interval
        let interval_tm = new Date();
        let interval_mm = interval_tm.getMinutes();
        interval_tm.setMinutes(interval_mm);
        // Last Interval
        let last_interval = new Date(0,0,0,0,interval_mm,0);
        last_interval.setMinutes(-15);
        // Pause time
        let pause_time = new Date(0,0,0,0,0,0);
        pause_time.setMilliseconds(this.time);
        // Delta
        let dif = Math.abs(last_interval - pause_time);
        let limits = [_GLOBAL.gap, (limit_n - _GLOBAL.gap)];

        this.validation.status = dif <= limits[0] || dif >= limits[1] ? 1 : 0;
      }
    }

    this.li.setAttribute("data-valid", this.validation.onTime);
    this.li.setAttribute("data-status", this.validation.status);
  }
}



// --- FUNCTIONS --- //
/*
* Prepares the VCC Dashboard to run the application.
*/
function prepareDashboard() {
  // Main dashboard
  let dashboards = document.querySelectorAll(".widgetContent");
  _GLOBAL.dashboard = dashboards[0].children[1];
  _GLOBAL.dashboard.innerHTML = `
    <div id='gap_input_cont'>
      <input id='gap_input' type='number' placeholder='Gap minutes'>
      <table id="summary_table_break" class="summary">
        <thead>
          <tr>
            <th>Scheduled Breaks</th>
            <th>Total Out</th>
            <th>On Time</th>
            <th>Not On Time</th>
            <th>Delta</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${_GLOBAL.count.break.scheduled}</td>
            <td>${_GLOBAL.count.break.totalOut}</td>
            <td>${_GLOBAL.count.break.onTime}</td>
            <td>${_GLOBAL.count.break.notOnTime}</td>
            <td>${_GLOBAL.count.break.scheduled - _GLOBAL.count.break.totalOut}</td>
          </tr>
        </tbody>
      </table>

      <table id="summary_table_lunch" class="summary">
        <thead>
          <tr>
            <th>Scheduled Lunches</th>
            <th>Total Out</th>
            <th>On Time</th>
            <th>Not On Time</th>
            <th>Delta</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${_GLOBAL.count.lunch.scheduled}</td>
            <td>${_GLOBAL.count.lunch.totalOut}</td>
            <td>${_GLOBAL.count.lunch.onTime}</td>
            <td>${_GLOBAL.count.lunch.notOnTime}</td>
            <td>${_GLOBAL.count.lunch.scheduled - _GLOBAL.count.lunch.totalOut}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
  _GLOBAL.dashboard.classList.add("break-monitor-container");

  // Agents status list
  dashboards.forEach(dash => {
    let header = dash.parentElement.querySelector(".widgetHeader");

    if(header.textContent.indexOf("Agent List") != -1)
    {
      _GLOBAL.agentsList = dash.children[1].children[4].children[0];
    }
  });

  // Injects CSS Styles into the DOM.
  var style  = document.createElement('link');
  style.rel  = 'stylesheet';
  style.type = 'text/css';
  style.href = chrome.extension.getURL('css/breaks.css');
  (document.head||document.documentElement).appendChild(style);
}
/*
* Creates the tables for the break and lunch lists.
*/
function createTables() {
  for(table_key in _GLOBAL.tables)
  {
    let isCurrent = table_key.toLowerCase().match(/current|scheduled/);
    let newTable = new Table(_GLOBAL.dashboard, table_key, isCurrent);
    newTable.create();

    _GLOBAL.tables[table_key] = newTable;
  }
}
/*
* Get schedules from Fustion Tables.
* 
* @return {array} 2D Array representing table rows.
*/
function getSchedules()
{
  const base_url = "https://www.googleapis.com/fusiontables/v2/query?";
  const table_id = "1ivZuagAgen1e4QTy6oGwUeRMB2wztvtHRV6VYg2G";
  const api_key  = "AIzaSyATPc_p1MI-xUpcllYyYhHY40jCZK102VU";

  let query = `${base_url}sql=SELECT * FROM ${table_id}&key=${api_key}`;

  return fetch(query)
    .then(res => {
      return res.json();
    })
    .then(res2 => {
      return res2.rows;
    })
}
/*
* Organizes agents by intervals in which they have
* start, breaks or lunch scheduled.
* 
* @param {Array} arr 2D array.
* 
* @return {Object} Data organized by interval.
*/
function getSchedulesByInterval(arr) {
  // arr row [vcc name, site, shift start, break 1, break 2, lunch]
  let res = {};

  for(var i = 0; i < arr.length -1; i++)
  {
    let row   = arr[i];
    let agent = row[0];
    let site  = row[4];

    let keys = {
      "breaks":   row[1],
      "breaks_":  row[2],
      "lunches":  row[3]
    }

    for(key in keys)
    {
      let dat = new Date(keys[key])
      let offset = dat.getTimezoneOffset();
      let mins   = dat.getMinutes();

      dat.setUTCMinutes(offset);
      dat.setUTCMinutes(-360);
      dat.setUTCMinutes(mins);

      let interval = getIntervalStr(dat);
      let _key = key.replace("_", "");
      let time = _key === "breaks" ? "15:00" : "30:00";

      _key = site === "TPA" ? "lunches" : _key;

      // Jumps to the next loop if the value is not a number.
      if(interval === ""){continue;}

      // res["6:30"]
      if(res[interval])
      {
        // res["6:30"]["lunch"]
        if(res[interval][_key])
        {
          res[interval][_key].push([site, agent, time]);
        }
        else
        {
          res[interval][_key] = [[site, agent, time]];
        }
      }
      else
      {
        res[interval] = {
          "start":   [],
          "breaks":  [],
          "lunches": []
        }

        res[interval][_key].push([site, agent, time]);
      }
    }
  }

  return res;
}
/*
* Calculates: previous, current and next interval in CST time and calls updateTables for
* each interval.
*/
function getCurrentScheduled()
{
  let now    = new Date();
  let offset = now.getTimezoneOffset();
  let mins   = now.getMinutes();

  now.setUTCMinutes(offset);
  now.setUTCMinutes(-360);
  now.setUTCMinutes(mins);

  let next = new Date(now);
  next.setMinutes(mins + 15);

  let last = new Date(now);
  last.setMinutes(mins - 15);

  updateTables(last, "Last Interval's");
  updateTables( now, "Scheduled", true);
  updateTables(next, "Next Interval's");
}
/*
* Update the values of the tables.
* 
* @param {String}  interval_str Interval string in h:mm format.
* @param {String}  table_key    Key word of the table's index name: Last Interval's | Scheduled | Next Interval's.
* @param {Boolean} isCurrent    Whether or not the table shows the current scheduled pauses.
*/
function updateTables(interval_str, table_key, isCurrent)
{
  let inteval_key = getIntervalStr(interval_str);
  let interval    = _GLOBAL.schedules_by_interval[inteval_key]
                  || {breaks: [[]], lunches: [[]]};

  let breaks  = interval.breaks  || [[]];
  let lunches = interval.lunches || [[]];

  let l_key = `${table_key} Lunches`; // Last Interval's Lunches
  let b_key = `${table_key} Breaks`;  // Last Interval's Breaks

  // Lunches
  if(lunches[0] && lunches[0].length > 0)
  {
    _GLOBAL.tables[l_key].clean();
    _GLOBAL.tables[l_key].add(lunches);
    _GLOBAL.interval.last.lunches = lunches;
  }
  
  // Breaks
  if(breaks[0] && breaks[0].length > 0)
  {
    _GLOBAL.tables[b_key].clean();
    _GLOBAL.tables[b_key].add(breaks);
    _GLOBAL.interval.last.breaks = breaks;
  }

  if(isCurrent)
  {
    _GLOBAL.count.lunch.scheduled = lunches.length;
    _GLOBAL.count.break.scheduled = breaks.length;
  }
}
/*
* 
*/
function updateSummary()
{
  let breakTable = document.getElementById("summary_table_break");
  let lunchTable = document.getElementById("summary_table_lunch");

  let tds_b = breakTable.querySelectorAll("td");
  let tds_l = lunchTable.querySelectorAll("td");

  tds_b[0].textContent = _GLOBAL.count.break.scheduled;
  tds_b[1].textContent = _GLOBAL.count.break.onTime + _GLOBAL.count.break.notOnTime;
  tds_b[2].textContent = _GLOBAL.count.break.onTime;
  tds_b[3].textContent = _GLOBAL.count.break.notOnTime;
  tds_b[4].textContent = -(_GLOBAL.count.break.scheduled - _GLOBAL.count.break.totalOut)

  tds_l[0].textContent = _GLOBAL.count.lunch.scheduled;
  tds_l[1].textContent = _GLOBAL.count.lunch.onTime + _GLOBAL.count.lunch.notOnTime;
  tds_l[2].textContent = _GLOBAL.count.lunch.onTime;
  tds_l[3].textContent = _GLOBAL.count.lunch.notOnTime;
  tds_l[4].textContent = -(_GLOBAL.count.lunch.scheduled - _GLOBAL.count.lunch.totalOut)
}
/*
* Scouts agents list and get current Breaks and Lunches.
*/
function getCurrentBreaks() {
  let list = _GLOBAL.agentsList.children;

  _GLOBAL.tables["Current Breaks"].clean();
  _GLOBAL.tables["Current Lunches"].clean();

  _GLOBAL.interval.current.breaks  = [];
  _GLOBAL.interval.current.lunches = [];

  for(var i = 0; i < list.length; i++)
  {
    let row   = list[i].children;
    let name  = row[0].textContent.trim();
    let state = row[1].textContent.trim();
    let time  = row[2].textContent.trim();
    let team  = row[3].textContent.trim();

    if(_GLOBAL.groups[team])
    {
      let minState = state.toLowerCase();
      let site = _GLOBAL.groups[team];

      if(minState.match("lunch"))
      {
        let agent = new Agent(site, name, "lunch", time); 
        agent.create();
        agent.addToList();
      }
      else if(minState.match("break"))
      {
        let agent = new Agent(site, name, "break", time); 
        agent.create();
        agent.addToList();;
      }
    }
  }

  _GLOBAL.tables["Current Breaks" ].add(_GLOBAL.interval.current.breaks);
  _GLOBAL.tables["Current Lunches"].add(_GLOBAL.interval.current.lunches);

  _GLOBAL.tables["Current Breaks" ].sort();
  _GLOBAL.tables["Current Lunches"].sort();
}
/*
* Validates if the agent pause was taken on time, before or after.
* 
* @return {Object} Status information {onTime: boolean, status: -1|0|1 for bad, ok, warning}.
*/
function validatePause(name, site, time_str, isBreak = true) {
  let gap = _GLOBAL.gap;
  let time_on_break = timeStrToMilliseconds(time_str);

  // Current time
  let now = new Date();
  let now_mm = now.getMinutes() * 60000;

  // On time by default
  let res = {
    onTime: true,
    status: 0
  };

  // 15 mins : 30 mins
  let limit = isBreak ? 900000 : 1800000;

  // Time exceeded
  if(time_on_break > limit){return {onTime: false, status: -1}}

  // 0 | 15 | 30 | 45
  let interval = (Math.floor( time_on_break / 15 ) * 15) * 900000;

  let nm_key = name.toLowerCase().replace(" ", "_");
  let st_key = site.toLowerCase().replace(" ", "_");
  let li_id  = `${st_key}_${nm_key}`;

  // Overall difference. Curent minutes - minutes on break - limit.
  let ov_diff = (now_mm - time_on_break) - limit;

  // Breaks
  if(isBreak)
  {
    let bod    = _GLOBAL.tables["Scheduled Breaks"].body;
    let exists = bod.querySelector(`li[data-id="${li_id}"]`);

    if(exists)
    {
      res.onTime = true;
      res.status = ov_diff <= -gap || ov_diff >= -(limit - gap) ? 1 : 0;
    }
    else
    {
      res.onTime = false;
      res.status = -1;
    }
    
    return res;
  }
  // Lunches
  else
  {
    let bod    = _GLOBAL.tables["Scheduled Lunches"].body;
    let exists = bod.querySelector(`li[data-id="${li_id}"]`);

    let bod2    = _GLOBAL.tables["Last Interval's Lunches"].body;
    let exists2 = bod2.querySelector(`li[data-id="${li_id}"]`);

    if(exists || exists2)
    {
      res.onTime = true;
      res.status = ov_diff <= -gap || ov_diff >= -(limit - gap) ? 1 : 0;
    }
    else
    {
      res.onTime = false;
      res.status = -1;
    }
    
    return res;
  }
}
/*
* Converts Date into a h:mm formated string.
* 
* @params {Date} dat Date instance. 
*/
function getIntervalStr(dat) {
  let hrs  = dat.getHours();
  let mins = dat.getMinutes();
    
  mins = Math.floor(mins/15) * 15; // 15 mins intervals
  mins = mins < 10 ? `0${mins}` : mins;

  return `${hrs}:${mins}`;
}
/*
* Converts hh:mm:ss string to milliseconds.
* 
* @params {String} str Time string in hh:mm:ss format.
* 
* @return {Number} Time in Milliseconds.
*/
function timeStrToMilliseconds(str)
{
  let format = new RegExp("\\d{0,2}:?\\d{1,2}:\\d{1,2}");
  let time   = str.match(format);
  let times  = time[0].split(":");
  let ss = Number( times[times.length-1] );
  let mm = Number( times[times.length-2] );
  let hh = Number( times[times.length-3] ) || 0;

  ss *= 1000;
  mm *= 60000;
  hh *= 3600000;

  return ss + mm + hh;
}
/*
* 
*/
function onMutationCallback()
{
  getCurrentBreaks();

  let now  = new Date();
  let mins = now.getMinutes();

  updateSummary();

  _GLOBAL.count = {
    break: {
      totalOut: 0,
      scheduled: _GLOBAL.count.break.scheduled,
      onTime: 0,
      notOnTime: 0
    },
    lunch: {
      totalOut: 0,
      scheduled: _GLOBAL.count.lunch.scheduled,
      onTime: 0,
      notOnTime: 0
    }
  }

  if(mins % 15 === 0)
  {
    _GLOBAL.count.break.scheduled = 0;
    _GLOBAL.count.lunch.scheduled = 0;

    getCurrentScheduled();
  }
}
/*
* 
*/
function onGapChange(ev)
{
  let new_gap = ev.target.value === ""
              ? 240000
              : Number(ev.target.value) * 60000;
  _GLOBAL.gap = new_gap;
}
/*
* Initial function.
*/
async function main()
{
  console.clear();
  console.log("Running breaks monitor...");

  prepareDashboard();
  createTables();

  _GLOBAL.raw_schedules = await getSchedules();
  _GLOBAL.schedules_by_interval = getSchedulesByInterval(_GLOBAL.raw_schedules);

  getCurrentScheduled();
  getCurrentBreaks();

  let observer = new MutationObserver(onMutationCallback);
  observer.observe(_GLOBAL.agentsList, {childList: true});

  _GLOBAL.gapInput = document.getElementById("gap_input");
  _GLOBAL.gapInput.onchange = onGapChange;
}

main();
