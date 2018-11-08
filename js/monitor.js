// ----- INFO CARD -----//
/*
* InfoCard.
* 
* @params {JSON} sets Settings {
    parent: HTML Node that will contain the card,
    requirements: array of requirements by interval,
    title: string - title for the InfoCard
  }
* 
* @fires buildCard.
*/
const InfoCard = function (sets = {}) {
  this.settings     = sets;
  this.parent       = sets.parent;
  this.requirements = sets.requirements;
  this.title        = this.settings.title || "Info-Card";
  this.cardID       = this.setID();
  this.stats        = sets.stats || this.requirements.stats;

  if(this.parent) {
    this.buildCard();
    //this.updateStats();
  } else {
    throw Error("Parent most be defined for an InfoCard.");
  }
}
/*
* Creates an unique ID for the instance.
*/
InfoCard.prototype.setID = function() {
  let title   = this.title.trim().toLowerCase().replace(/\s/g, "_");
  let card_id = title;
  let exists  = document.getElementById(card_id);
  let i = 0;

  while(exists) {
    card_id = title + i;
    exists = document.getElementById(card_id);
    i++;
  }

  return card_id;
};
/*
* Build initial InfoCard DOM Object.
*/
InfoCard.prototype.buildCard = function() {
  let stats  = this.stats;
  let today  = new Date();
  let offset = today.getTimezoneOffset();
  let mins   = today.getMinutes();

  today.setMinutes(0);
  today.setMinutes(offset - 360);
  today.setMinutes(mins);

  let hh    = today.getHours();
  let hh2   = today.getMinutes() >= 30 ? hh+1 : hh; 
  let mm    = today.getMinutes() >= 30 ? 0.5  : 0;
  let mm2   = today.getMinutes() >= 30 ? 0    : 0.5;

  let mtxt1 = mm  === 0.5 ? ":30" : ":00";
  let mtxt2 = mm2 === 0   ? ":00" : ":30";

  let interval1 = this.requirements.intervals[hh     +  mm] || 0;
  let interval2 = this.requirements.intervals[hh2    + mm2] || 0;
  let interval3 = this.requirements.intervals[(hh+1) +  mm] || 0;

  let intervalDelta = stats.working - interval1.toFixed(0);
  let deltaPer      = interval1 != 0
                    ? ((stats.working / interval1.toFixed(0)) * 100).toFixed(0)
                    : 100;
  let cardClass = 'good';

  if(deltaPer > 110) {
    cardClass = "bad-up";
  }
  else if(deltaPer < 90)
  {
    cardClass = "bad-down"
  }
  else if (deltaPer >= 90 && deltaPer < 100) {
    cardClass = "warning";
  }

  this.card = document.createElement("div");
  this.card.classList.add('card', cardClass);

  this.card.innerHTML = `
    <svg class="flag"
         version="1.1"
         xmlns="http://www.w3.org/2000/svg"
         x="0px" y="0px"
         width="300px"
         height="320px"
         viewBox="0 0 300 320">
      <g>
        <path class="st0"
              d="M0.2,315.7c0,0,48.2-198.5,199.2-315.5H0.4L0.2,315.7z"/>
        <path class="st0"
              d="M0.3,141.8c0,0,34.2-79.1,199.1-141.6L0,0L0.3,141.8z"/>
        <path class="st0"
              d="M0.4,40.5c0,0,67.9-29.8,199.4-40.3L0.4,0V40.5z"/>
      </g>
    </svg>

    <div class="table">
      <h2 class="table-title">${this.title}</h2>
      <div class="stat">
        <h3>Working Agents</h3>
        <div class="num-1 working-agents">${stats.working}</div>
      </div>
      <div class="stat">
        <h3>Unavailable Agents</h3>
        <div class="num-1 unavailable-agents">${stats.unavailable}</div>
      </div>
      <div class="stat">
        <h3>Total Logged In</h3>
        <div class="num-1 total-logged-in">${stats.loggedIn}</div>
      </div>
      <div class="stat">
        <h3>Current Interval Delta</h3>
        <div class="num-1 interval-delta">
          ${intervalDelta}
          <div class="perc">(${deltaPer}%)</div>
        </div>
      </div>
      <h3 class="sbt">Interval Requirements</h3>
      <div class="intervals">
        <div class="stat">
          <h3>Current Interval <span class="current-interval-time">(${hh + mtxt1})</span></h3>
          <div class="num-1 current-interval-req">${interval1.toFixed(0)}</div>
        </div>
        <div class="stat">
          <h3>Next Interval <span class="next-interval-time-1">(${hh2 + mtxt2})</span></h3>
          <div class="num-1 next-interval-1">${interval2.toFixed(0)}</div>
        </div>
        <div class="stat">
          <h3>Next Interval <span class="next-interval-time-2">(${(hh+1) + mtxt1})</span></h3>
          <div class="num-1 next-interval-2">${interval3.toFixed(0)}</div>
        </div>
      </div>
    </div>`;

  this.parent.appendChild(this.card);
};
/*
* Update card stats.
*/
InfoCard.prototype.updateData = function(requirements) {
  this.requirements = requirements;
  let stats = requirements.stats;
  let working     = this.card.querySelector(".working-agents");
  let unavailable = this.card.querySelector(".unavailable-agents");
  let loggedIn    = this.card.querySelector(".total-logged-in");
  let delta       = this.card.querySelector(".interval-delta");
  let deltaPer    = this.card.querySelector(".interval-delta .perc");
  let interval    = this.card.querySelector(".current-interval-req");
  let interval2   = this.card.querySelector(".next-interval-1");
  let interval3   = this.card.querySelector(".next-interval-2");

  let today  = new Date();
  let offset = today.getTimezoneOffset();
  let mins   = today.getMinutes();

  today.setMinutes(0);
  today.setMinutes(offset - 300);
  today.setMinutes(mins);

  let hh    = today.getHours();
  let hh2   = today.getMinutes() >= 30 ? hh+1 : hh; 
  let mm    = today.getMinutes() >= 30 ? 0.5  : 0;
  let mm2   = today.getMinutes() >= 30 ? 0    : 0.5;

  let interval_1 = this.requirements.intervals[hh + mm] || 0;
  let interval_2 = this.requirements.intervals[hh2 + mm2] || 0;
  let interval_3 = this.requirements.intervals[(hh+1) + mm] || 0;

  let intervalDelta = stats.working - interval_1.toFixed(0);
  let delta_pe      = interval_1 != 0
                    ? ((stats.working / interval_1.toFixed(0)) * 100).toFixed(0)
                    : 100;
  let cardClass = 'good';

  if(delta_pe > 110)
  {
    cardClass = "bad-up";
  }
  else if(delta_pe < 90)
  {
    cardClass = "bad-down";
  }
  else if (delta_pe >= 90 && delta_pe < 100) {
    cardClass = "warning";
  }

  this.card.classList = "";
  this.card.classList.add("card", cardClass);

  working.textContent     = stats.working;
  unavailable.textContent = stats.unavailable;
  loggedIn.textContent    = stats.loggedIn;
  interval.textContent    = interval_1.toFixed(0);
  interval2.textContent   = interval_2.toFixed(0);
  interval3.textContent   = interval_3.toFixed(0);
  delta.innerHTML         = `${intervalDelta}<div class="perc">(${delta_pe}%)</div>`;
};


/*
* Special InfoCard
*/
const NestingInfoCard = function (sets = {}) {
  InfoCard.call(this, sets); 
}
// Inheritance
NestingInfoCard.prototype = Object.create(InfoCard.prototype);
Object.defineProperty(NestingInfoCard.prototype, 'constructor', {
  value: NestingInfoCard,
  enumerable: false,
  writable: true
});

NestingInfoCard.prototype.buildCard = function() {
  let stats  = this.stats;
  let today  = new Date();
  let offset = today.getTimezoneOffset();
  let mins   = today.getMinutes();

  today.setMinutes(0);
  today.setMinutes(offset - 360);
  today.setMinutes(mins);

  let hh    = today.getHours();
  let hh2   = today.getMinutes() >= 30 ? hh+1 : hh; 
  let mm    = today.getMinutes() >= 30 ? 0.5  : 0;
  let mm2   = today.getMinutes() >= 30 ? 0    : 0.5;

  let mtxt1 = mm  === 0.5 ? ":30" : ":00";
  let mtxt2 = mm2 === 0   ? ":00" : ":30";

  let interval1 = this.requirements.intervals[hh     +  mm] || 0;
  let interval2 = this.requirements.intervals[hh2    + mm2] || 0;
  let interval3 = this.requirements.intervals[(hh+1) +  mm] || 0;

  let intervalDelta = stats.working - interval1.toFixed(0);
  let deltaPer      = interval1 != 0
                    ? ((stats.working / interval1.toFixed(0)) * 100).toFixed(0)
                    : 100;
  let cardClass = 'good';

  if(deltaPer > 110) {
    cardClass = "bad-up";
  }
  else if(deltaPer < 90)
  {
    cardClass = "bad-down"
  }
  else if (deltaPer >= 90 && deltaPer < 100) {
    cardClass = "warning";
  }

  this.card = document.createElement("div");
  this.card.classList.add('card', cardClass);

  this.card.innerHTML = `
    <svg class="flag"
         version="1.1"
         xmlns="http://www.w3.org/2000/svg"
         x="0px" y="0px"
         width="300px"
         height="320px"
         viewBox="0 0 300 320">
      <g>
        <path class="st0"
              d="M0.2,315.7c0,0,48.2-198.5,199.2-315.5H0.4L0.2,315.7z"/>
        <path class="st0"
              d="M0.3,141.8c0,0,34.2-79.1,199.1-141.6L0,0L0.3,141.8z"/>
        <path class="st0"
              d="M0.4,40.5c0,0,67.9-29.8,199.4-40.3L0.4,0V40.5z"/>
      </g>
    </svg>

    <div class="table">
      <h2 class="table-title">${this.title}</h2>
      <div class="stat">
        <h3>Guatemala Abay</h3>
        <div class="num-1 working-agents">${stats.working}</div>
      </div>
      <div class="stat">
        <h3>Tampa Abay</h3>
        <div class="num-1 unavailable-agents">${stats.unavailable}</div>
      </div>
      <div class="stat">
        <h3>GTM Unavailable</h3>
        <div class="num-1 total-logged-in">${stats.loggedIn}</div>
      </div>
      <div class="stat">
        <h3>TPA Unavailable</h3>
        <div class="num-1 interval-delta">
          ${intervalDelta}
          <div class="perc">(${deltaPer}%)</div>
        </div>
      </div>
      <h3 class="sbt">Interval Requirements</h3>
      <div class="intervals">
        <div class="stat">
          <h3>Current Interval <span class="current-interval-time">(${hh + mtxt1})</span></h3>
          <div class="num-1 current-interval-req">${interval1.toFixed(0)}</div>
        </div>
        <div class="stat">
          <h3>Next Interval <span class="next-interval-time-1">(${hh2 + mtxt2})</span></h3>
          <div class="num-1 next-interval-1">${interval2.toFixed(0)}</div>
        </div>
        <div class="stat">
          <h3>Next Interval <span class="next-interval-time-2">(${(hh+1) + mtxt1})</span></h3>
          <div class="num-1 next-interval-2">${interval3.toFixed(0)}</div>
        </div>
      </div>
    </div>`;

  this.parent.appendChild(this.card);
};


// ----- MONITOR APP-----//
/*
* MonitorApp constructor.
* 
* @fires findList.
* @fires prepare.
*/
const MonitorApp = function () {
  this.daysRef       = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  this.widgets       = document.querySelectorAll(".widgetContainer");
  this.mainContainer = this.widgets[0].children[4];
  this.requirements  = {};
  this.language      = navigator.language;
  this.statesRef     = {
    "en-US": {
      "Inbound": "inCall",
      "Outbound": "inCall",
      "Available": "available",
      "Unavailable": "unavailable"
    },
    "es": {
      "Entrantes": "inCall",
      "Salientes": "inCall",
      "Disponible": "available",
      "No disponible": "unavailable"
    }
  }
  this.states = this.statesRef[this.language] || this.statesRef["en-US"];
  this.agentList,
  this.cardsContainer;
  this.infoCards = {};

  this.findList();
  this.prepare();
}
/*
* Find agents list within widgets.
*/
MonitorApp.prototype.findList = function() {
  this.widgets.forEach(widget => {
    let title = widget.children[3].textContent;
    if(title.includes("Agent List")) 
      {
        this.agentList = widget.querySelector(".widgetContent");
      }
  });
};
/*
* Prepare main dashboard for the application.
* 
* @fires getRequirements.
*/
MonitorApp.prototype.prepare = function() {
  this.mainContainer.innerHTML = "";

  //this.uploadInput      = document.createElement("input");
  //this.uploadInput.type = "file";
  //this.uploadInput.id   = "upload_input";
  //this.uploadInput.onchange = this.updateRequirements.bind(this);

  this.cardsContainer = document.createElement("div");
  this.cardsContainer.id  = "cards_container";

  this.mainContainer.style.height = "100%";
  //this.mainContainer.appendChild(this.uploadInput);
  this.mainContainer.appendChild(this.cardsContainer);

  this.updateRequirements();
};
/*
* Get data from FusionTables.
* 
* @fires getRequirements
*/
MonitorApp.prototype.updateRequirements = function() {
  let query = "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT * FROM 1gkM60YBV5KqIbOr8Xh3I2XIeBCd2ej_gztTCy3pu&alt=csv&key=AIzaSyD0obWn8dQo74pIEKU-7veW4O_pSYpUNug";
  fetch(query).then(res => {
    return res.text();
  }).then(data => {
    let raw_data = [];

    data.split("\n").forEach(row => {
      raw_data.push(row.split(","));
    });
    raw_data[0] = ["interval",
                   "weekDay",
                   "forecast:english",
                   "forecast:spanish",
                   "24 7 Intouch Tampa",
                   "24 7 Intouch Gaut",
                   "24 7 Intouch Guat Spanish",
                   "24 7 Intouch Dotcom",
                   "24 7 Intouch Nesting"];
    this.raw_data = raw_data;
    this.getRequirements();
  })
};
/*
* Parse the file raw_data into a JSON object.
* 
* @fires updateStats
*/
MonitorApp.prototype.getRequirements = function() {
  
  if(!this.agentObserver) {
    var config = { attributes: true, childList: true, subtree: true };
    this.agentObserver = new MutationObserver(this.updateCards.bind(this));
    this.agentObserver.observe(this.agentList, config);    
  }
  
  let days     = this.daysRef;
  let raw_data = this.raw_data;
  let cols     = raw_data[0].length;
  // File Rows/Lines
  for(var a = 1; a < raw_data.length; a++) {
    let row = raw_data[a];
    let day = row[1] ? row[1].trim().toLowerCase() : null;

    if(day) {
      if(!this.requirements[day]) {
        this.requirements[day] = {};
      }
      // Row/Line Columns
      for(var e = 2; e < cols; e++) {
        let header   = raw_data[0][e];
        let cell     = Number(row[e]) || 0;
        let interval = row[0];
        let day      = row[1].trim().toLowerCase();

        let header_values = this.getHeaderData(header);
        let title         = header_values[0];
        let key           = header_values[0].trim().toLowerCase().replace(/\s/g, "_");
        let group_key     = header_values[1]
                          ? header_values[1].trim().toLowerCase().replace(/\s/g, "_")
                          : header_values[1];

        if(!this.requirements[day][key]) {
          this.requirements[day][key] = {}
        }

        if(key === 'forecast') {
          if(group_key) {
            let existing_intervals = this.requirements[day][key][group_key] || {
              title: title,
              intervals: {}
            };
            this.requirements[day][key][group_key] = existing_intervals;
            this.requirements[day][key][group_key].intervals[interval] = cell;
          } else {
            let existing_intervals = this.requirements[day][key] || {
              title: title,
              intervals: {}
            };
            this.requirements[day][key] = existing_intervals;
            this.requirements[day][key].intervals[interval] = cell;
          }
        } else {
          let existing_intervals = this.requirements[day][key].intervals || {};

          existing_intervals[interval] = cell;
          this.requirements[day][key].title = title;
          this.requirements[day][key].forecastGroup = group_key;
          this.requirements[day][key].intervals = existing_intervals;
          this.requirements[day][key].stats = {
            inCall: 0,
            available: 0,
            unavailable: 0,
            working: 0,
            loggedIn: 0,
            intervalDelta: 0
          }
        }
      }
    }
  }
  this.updateStats();
}
/*
* Get information in the Headers row.
*/
MonitorApp.prototype.getHeaderData = function(str) {
  if(!str){return}

  let res;
  str = str.trim();

  if(str.includes("forecast") && str.includes(":")) {
    let vals = str.split(":"); 
    let group = vals[1];
    res = ["forecast", vals[1]];
  } else if (str.includes("forecast")) {
    res = ["forecast"];
  } else if (str.includes(":")) {
    res = str.split(":");
  } else {
    res = [str];
  }

  return res;
};
/*
* Iterates call list and update stats.
*/
MonitorApp.prototype.updateStats = function() {
  let today     = new Date();
  let day       = today.getDay();
  let day_key   = this.daysRef[day];
  let hh        = today.getHours();
  let todayReqs = this.requirements[day_key];

  let rows = this.agentList.children[1].children[4].children[0].children;

  for(group in this.requirements[day_key]) {
    if(this.requirements[day_key][group].intervals){
      this.requirements[day_key][group].stats = {
        inCall: 0,
        available: 0,
        unavailable: 0,
        working: 0,
        loggedIn: 0,
        intervalDelta: 0
      }
    }
  }

  for(var i = 0; i < rows.length; i++) {
    let row = rows[i].children;
  //let name  = row[0].textContent.trim();
    let state = row[1].textContent.trim();
  //let time  = row[2].textContent.trim();
    let team  = row[3].textContent.trim();
    let team_key = team.toLowerCase().replace(/\s/g, "_");

    if(todayReqs[team_key]) {
      for(key in this.states) {
        var exp    = `^${key}`;       // ^Available
        var regExp = new RegExp(exp); // /^Available/

        if(state.match(regExp)){
          let stat = this.states[key];
          todayReqs[team_key].stats[stat] += 1;
          todayReqs['24_7_intouch_dotcom'].stats[stat] += 1;
        }
      }
      todayReqs[team_key].stats.working  = todayReqs[team_key].stats.inCall  + todayReqs[team_key].stats.available;
      todayReqs[team_key].stats.loggedIn = todayReqs[team_key].stats.working + todayReqs[team_key].stats.unavailable;
      // Dotcom combined
      todayReqs['24_7_intouch_dotcom'].stats.working  = todayReqs['24_7_intouch_dotcom'].stats.inCall  + todayReqs['24_7_intouch_dotcom'].stats.available;
      todayReqs['24_7_intouch_dotcom'].stats.loggedIn = todayReqs['24_7_intouch_dotcom'].stats.working + todayReqs['24_7_intouch_dotcom'].stats.unavailable;
    }
  }
  this.requirements[day_key] = todayReqs;
  this.createCards();
};
/*
* Creates an InfoCard for each group.
*/
MonitorApp.prototype.createCards = function() {
  this.cardsContainer.innerHTML = '';
  let today     = new Date();
  let day       = today.getDay();
  let day_key   = this.daysRef[day];
  let todayReqs = this.requirements[day_key];

  for(group in todayReqs) {
    if(!group.includes("forecast") && !group.includes("nesting")){
      this.infoCards[group] = new InfoCard({
        parent: this.cardsContainer,
        title: todayReqs[group].title,
        stats: todayReqs[group].stats,
        requirements: todayReqs[group]
      })
    } else if(group.includes("nesting")) {
      this.infoCards[group] = new NestingInfoCard({
        parent: this.cardsContainer,
        title: todayReqs[group].title,
        stats: todayReqs[group].stats,
        requirements: todayReqs[group]
      })
    }
  }
};
MonitorApp.prototype.updateCards = function() {
  this.updateStats();

  let today     = new Date();
  let day       = today.getDay();
  let day_key   = this.daysRef[day];
  let hh        = today.getHours();

  for(card in this.infoCards) {
    this.infoCards[card].updateData( this.requirements[day_key][card] );
  }
};



/*
* Starts the app if the document has completely loaded,
* checks again every second if not.
*/
function checkState() {
  if(document.readyState != "complete") {
    setTimeout(checkState, 1000);
  } else {
    var a = new MonitorApp();
  }
}

checkState();