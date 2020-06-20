/* MagicMIrror Module - MMM-DigitalAlarmClock
 *
 * This is a module for the MagicMirror² By Michael Teeuw http://michaelteeuw.nl
 * (https://github.com/MichMich/MagicMirror/).
 *
 * The digital only part of the default MM2 clock
 * written by Michael Teeuw http://michaelteeuw.nl]
 *
 * Integrated with MMM-AlarmClock by @fewieden
 *
 * I was shooting for this to have the look of the
 * "old school" or vintage digital alarm clocks!
 *
 * Most of the ones I remember came in red, blue, white, or green
 * Of course, you are welcome to choose whatever color or
 * color combination you want.
 *
 * NOT tested with Raspberry Pi
 * It DOES work with Windows 10 AND Ubuntu!!!
 *
 * version: 1.0.0
 *
 * Modified module by Jim Hallock (justjim1220@gmail.com)
 *
 * Licensed with a crapload of good ole' Southern Sweet Tea
 * and a lot of Cheyenne Extreme Menthol cigars!!!
 */

// jshint esversion:6

Module.register("MMM-DigitalAlarmClock", {
	next: null,
	alarmFired: false,
	timer: null,
	fadeInterval: null,

	defaults: {
		showDate: true,
		dateFormat: "ddd ll",
		alarmSet: null,
		alarms: [{
			time: "09:30",
			days: [1, 2, 3, 4, 5]
		}],
		sound: "alarm.mp3",
		touch: false,
		popup: true,
		volume: 1.0,
		timer: 60 * 1000,
		format: "ddd HH:mm",
		fade: false,
		fadeTimer: 60 * 1000,
		fadeStep: 0.005,
		snooze: false,
		snoozeTimer: 5,
		snoozeTimerUnit: "minutes", // other option is seconds
        //set Alarm
        minutesStepSize: 5,
        snoozeMinutes: 5,
        alarmTimeoutMinutes: 5,
        alarmSound: true,
        alarmSoundFile: 'alarm.mp3',
        alarmSoundMaxVolume: 1.0,
        alarmSoundFade: true,
        alarmSoundFadeSeconds: 30,
        // Expert options
        debug: false,
        defaultHour: 08,
        defaultMinutes: 00,
        alarmStoreFileName: 'alarm.json'
	},

    
    // set Alarm Inner variables
    setTimeModalVisible: false, // current state about the visibility of the set time modal
    
    hour: 0, // alarm hour
    minutes: 0, // alarm minutes
 
    alarmCheckRunner: null, // Interval that check if a alarm is reached
    nextAlarm: null, // moment with the next alarm time
    alarmFadeRunner: null, // Intervall to handle fade of the alarm
    alarmTimeoutRunner: null, // Intervall that check if the alarm should be timed out

    // Ids to find components again
    DISPLAY_ALARM_ICON_ID: `MMM-DigitalAlarmClock-display-alarm-icon`,
    DISPLAY_TIME_ID: `MMM-DigitalAlarmClock-display-time`,
    ALARM_MODAL_ID: `MMM-DigitalAlarmClock-alarm-modal`,
    ALARM_SOUND_ID: `MMM-DigitalAlarmClock-alarm-sound`,
    SETTIME_MODAL_ID: `MMM-DigitalAlarmClock-settime-modal`,
    SETTIME_HOUR_ID: `MMM-DigitalAlarmClock-settime-hour`,
    SETTIME_MINUTES_ID: `MMM-DigitalAlarmClock-settime-minutes`,
    
    
    debug() {
        if(this.config.debug) {
            console.log([].slice.apply(arguments));
        }
    },
    
	requiresVersion: "2.1.0",


	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "moment-timezone.js"];
	},

	// Define styles.
	getStyles: function() {
		return ["MMM-DigitalAlarmClock.css", "font-awesome.css"];
	},

   
	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		

		// Set locale.
		moment.locale(config.language);
		 
		// Schedule update interval.
		var self = this;
		setInterval(function() {
			self.updateDom();
		}, 1000);

		
		setInterval(() => {
			this.checkAlarm();
		}, 1000);
        
        //set Alarm
        this.hour = this.config.defaultHour;
        this.minutes = this.config.defaultMinutes;
        
        var thedays_arr = [];
        var check_value = [];
        var howmanydays = 7;
        var length_days = 7;
        
        
        

	},


    
	notificationReceived(notification) {
        if (notification === 'DOM_OBJECTS_CREATED') {
            this.sendSocketNotification(`${this.name}-STARTED`, {
                config: this.config,
                alarmFile: this.file(this.config.alarmStoreFileName)
            });
            

        

          

            
        }
		if (notification === "STOP_ALARM") {
			this.resetAlarmClock()
		} else if(notification === "SNOOZE_ALARM") {
			this.snoozeAlarmClock()
		}
        
        
	},

	checkAlarm() {
        //this.sendNotification("SHOW_ALERT", {title: "checkAlarm", message: this.config.alarmSet.toString(), timer: 1000});
        if (this.config.alarmSet){
            
		if (!this.alarmFired && this.next && moment().diff(this.next.moment) >= 0) {
			var alert = {
				imageFA: "bell-o",
				title: this.next.sender || this.next.title,
				message: this.next.message
			};
			let timer = this.config.timer;
			// If the alarm has specific timer and if MM is not touch, we use the alarm timer.
			if (typeof this.next.timer !== "undefined" && !this.config.touch) {
				timer = this.next.timer;
			}
			if (!this.config.touch) {
				alert.timer = timer;
			}
			if (this.config.popup) {
				this.sendNotification("SHOW_ALERT", alert);
			}
			this.alarmFired = true;
            this.sendNotification("STOP"); 
			this.updateDom();
			this.timer = setTimeout(() => {
				this.resetAlarmClock();
			}, timer);
			if (this.config.touch && this.config.popup) {
				MM.getModules().enumerate(module => {
					if (module.name === "alert") {
						if (this.config.snooze && this.next.snooze !== false || this.next.snooze) {
							module.alerts["MMM-DigitalAlarmClock"].ntf.addEventListener("click", () => {
								this.snoozeAlarmClock();
							});
							module.alerts["MMM-DigitalAlarmClock"].ntf.addEventListener("dblclick", () => {
								this.resetAlarmClock();
							});
						} else {
							module.alerts["MMM-DigitalAlarmClock"].ntf.addEventListener("click", () => {
								this.resetAlarmClock();
							});
						}
					}
				});
			}
			setTimeout(() => {
				var player = document.getElementById("MMM-AlarmClock-Player");
				player.volume = this.config.fade ? 0 : this.config.volume;
				this.fadeAlarm();
			}, 100);
		}
        }
	},

	fadeAlarm() {
		let volume = 0;
		let counter = 0;
		this.fadeInterval = setInterval(() => {
			var player = document.getElementById("MMM-DigitalAlarmClock-Player");
			player.volume = volume;
			volume += this.config.fadeStep;
			counter += 1000;
			if (volume >= this.config.volume || counter >= this.config.fadeTimer) {
				player.volume = this.config.volume;
				clearInterval(this.fadeInterval);
			}
		}, 1000);
	},

	setNextAlarm() {
		this.next = null;
        
        
        //this.sendNotification("SHOW_ALERT", {title: "payload.hour", message: this.hour, timer: 3000});
        //console.log("THIS.HOUR setNextAlarm:"+this.hour);
         
		for (let i = 0; i < this.config.alarms.length; i += 1) {
			var temp = this.getMoment(this.config.alarms[i]);
            
			if (!this.next || temp.diff(this.next.moment) < 0) {
				this.next = this.config.alarms[i];
				this.next.moment = temp;
                
			}
		}
        
	},

	snoozeAlarmClock() {
		clearTimeout(this.timer);
		clearTimeout(this.fadeInterval);
		this.alarmFired = false;
		if (this.config.touch && this.config.popup) {
			this.sendNotification("HIDE_ALERT");
		}
		if (this.next.snoozeTimerUnit) {
			snoozeTimerUnit = this.next.snoozeTimerUnit;
		} else {
			snoozeTimerUnit = this.config.snoozeTimerUnit;
		}
		if (this.next.snoozeTimer) {
			this.next.moment.add(this.next.snoozeTimer,snoozeTimerUnit);
		} else if (this.config.snoozeTimer) {
			this.next.moment.add(this.config.snoozeTimer,snoozeTimerUnit);
		} else {
			this.setNextAlarm();
		}
		this.updateDom(300);
	},

	resetAlarmClock() {
		clearTimeout(this.timer);
		clearTimeout(this.fadeInterval);
		this.alarmFired = false;
		if (this.config.touch && this.config.popup) {
			this.sendNotification("HIDE_ALERT");
		}
		this.setNextAlarm();
		this.updateDom(300);
	},

	getMoment(alarm) {
		var now = moment();
		let difference = Math.min();
		var hour = parseInt(alarm.time.split(":")[0]);
		var minute = parseInt(alarm.time.split(":")[1]);

		for (let i = 0; i < alarm.days.length; i += 1) {
			if (now.day() < alarm.days[i]) {
				difference = Math.min(alarm.days[i] - now.day(), difference);
			} else if (now.day() === alarm.days[i] && (parseInt(now.hour()) < hour ||
				(parseInt(now.hour()) === hour && parseInt(now.minute()) < minute))) {
				difference = Math.min(0, difference);
			} else if (now.day() === alarm.days[i]) {
				difference = Math.min(7, difference);
			} else {
				difference = Math.min((7 - now.day()) + alarm.days[i], difference);
			}
		}

		return moment().add(difference, "days").set({
			hour,
			minute,
			second: 0,
			millisecond: 0
		});
	},

	button(onclick) {
		var audio = document.getElementsByTagName("audio");
		if (!audio.paused) {
			audio.pause(onclick);
			audio.currentTime = 0;
		}
	},

	getDom: function () {

		var wrapper = document.createElement("div");

		// Date section
		var dateWrapper = document.createElement("div");
		dateWrapper.classList.add("medium");

		var date = document.createElement("span");
		var  now = moment();
		date.className = "date";
		date.innerHTML = now.format(this.config.dateFormat);
		dateWrapper.appendChild(date);

		// Time section
		var timeWrapper = document.createElement("div");
		timeWrapper.classList.add("large");

		var time = document.createElement("span");
		time.className = "time";

		var hourSymbol = "HH";
		if (this.config.timeFormat !== 24) {
			hourSymbol = "h";
		}

		var colonSymbol = ":";
		colonSymbol.className = "colon";

		var timeString = now.format(hourSymbol + colonSymbol + "mm");
		time.innerHTML = timeString;
		timeWrapper.appendChild(time);

		// Alarm section
		var alarmWrapper = document.createElement("div");
		alarmWrapper.classList.add("large");

		var alarm = document.createElement("tr");
		alarm.className = "alarm";

		var pwrBtn = document.createElement("button");
		pwrBtn.className = "onoff";
		var	BtnImg=document.createElement("img");
		BtnImg.width="40";
		//BtnImg.style.valign="middle";
		BtnImg.id="onoff";

		if (this.config.alarmSet === true) {
			BtnImg.src = "modules/" + this.name + "/on.png";
		} else {
			BtnImg.src = "modules/" + this.name + "/off.png";
		}
		pwrBtn.appendChild(BtnImg);

		pwrBtn.addEventListener("click", (button) => {
			Log.log("in event handler for click");
			var b = document.getElementById("onoff");
			if(b.src.indexOf("on.png") > 0) {
				b.src = "modules/" + this.name + "/off.png";
				this.config.alarmSet = false;
				this.resetAlarmClock();
			}
			else {
				b.src = "modules/"+this.name+"/on.png";
				this.config.alarmSet = true;
			}
            this.sendSocketNotification(`${this.name}-ALARM-CHANGED`, {
            active: this.config.alarmSet,
            nextAlarm: this.nextAlarm,
            hour: this.hour,
            minutes: this.minutes,
            days: this.config.alarms[0].days,    

        });
            
		});
		alarmWrapper.appendChild(pwrBtn);

		if (this.config.alarmSet === true) {
			alarm.classList.add("fa", "fa-bell-o", "bell");
		} else {
			alarm.classList.add("fa", "fa-bell-slash-o", "bell");
		}
		alarmWrapper.appendChild(alarm);
        
        
        
        
        
        
		var alarmSet = document.createElement("span");
		alarmSet.className = "set";
		if (this.config.alarmSet === true) {
			alarmSet.classList.add("medium");
             
			alarmSet.innerHTML = `&nbsp;&nbsp;${this.next.moment.format(this.config.format)}&nbsp&nbsp`;
              
            
            //this.createShowAlarmTime()
            
            alarmSet.addEventListener('click', () => {
                // Stop current alarm first
                this.resetAlarmClock()
                
                this.showSetTimeModal();
            });
        
		} else {
			alarmSet.innerHTML = "&nbsp;&nbsp;";
            this.hideSetTimeModal();
		}
		alarmWrapper.appendChild(alarmSet);

		var setButton = document.createElement("span");
		setButton.className = "button";
		if (this.config.alarmSet === true) {
			setButton.innerHTML = "Alarm Set";
		} else {
			setButton.innerHTML = "Alarm NOT Set";
		}
		alarmWrapper.appendChild(setButton);

		if (this.alarmFired) {
			var sound = document.createElement("audio");
			sound.className = "alarmSound";
			let srcSound = this.config.sound;
			if (this.next.sound) {
				srcSound = this.next.sound;
			}
			if (!srcSound.match(/^https?:\/\//)) {
				srcSound = this.file(`sounds/${srcSound}`);
			}
			sound.src = srcSound;
			sound.volume = this.config.volume;
			sound.setAttribute("id", "MMM-DigitalAlarmClock-Player");
			sound.volume = this.config.fade ? 0 : this.config.volume;
			sound.setAttribute("autoplay", true);
			sound.setAttribute("loop", true);
			if (this.config.fade === true) {
				this.fadeAlarm();
			}
			alarmWrapper.appendChild(sound);
		}

		digitalWrapper = document.createElement("div");
		digitalWrapper.className = "digital";
		digitalWrapper.appendChild(dateWrapper);
		digitalWrapper.appendChild(timeWrapper);
		digitalWrapper.appendChild(alarmWrapper);

		//
        
        
        wrapper.appendChild(digitalWrapper);
        
        
        //checkboxes
         
        
        //wrapper.appendChild(this.createShowAlarmTime());
		return wrapper;
	},
    
    
    //set alarm
    
    
    updateAlarmActive(activateAlarm) {
        this.debug('updateAlarmActive(activateAlarm) called', activateAlarm);

        

        this.notifyAboutAlarmChanged();
    },

    notifyAboutAlarmChanged() {
        
        
        
        //this.config.alarms[0].days = [];
        //this.sendNotification("SHOW_ALERT", {title: "this.thedays_arr", message: this.thedays_arr, timer: 5000});
        var thedays_arr_numb = 0;
        this.config.alarms[0].days = [];
        for(count=0;count< 7;count++)
        {
            //this.sendNotification("SHOW_ALERT", {title: "this.thedays_arr[count]", message: this.thedays_arr[count], timer: 2000});
            if (this.thedays_arr[count] != -1){
                
                this.config.alarms[0].days[thedays_arr_numb] = this.thedays_arr[count];
                
            }else{
                  thedays_arr_numb--;
            }
            thedays_arr_numb++;
        }
        //this.sendNotification("SHOW_ALERT", {title: "this.config.alarms[0].days", message: this.config.alarms[0].days, timer: 5000});
        this.config.alarms= [{time: this.formatFullTime(this.hour,this.minutes),
                            days: this.config.alarms[0].days
                            }];
        
        this.sendSocketNotification(`${this.name}-ALARM-CHANGED`, {
            active: this.config.alarmSet,
            nextAlarm: this.nextAlarm,
            hour: this.hour,
            minutes: this.minutes,
            days: this.config.alarms[0].days,    

        });
        
        this.setNextAlarm();
        this.updateDom(300);
    },
    
    createShowAlarmTime() {

        const displaySetAlarm = document.createElement('span');
        displaySetAlarm.classList.add('display-set-alarm-time');
        displaySetAlarm.setAttribute('id', this.DISPLAY_TIME_ID);
        displaySetAlarm.innerText = this.formatFullTime(this.hour, this.minutes);
        //this.sendNotification("SHOW_ALERT", {title: "Update Time", message: displaySetAlarm.innerText, timer: 1000});   
        
        // Open config dialog if clicked
        displaySetAlarm.addEventListener('click', () => {
            // Stop current alarm first
            this.resetAlarmClock()
            
            this.showSetTimeModal();
        });

        return displaySetAlarm;
    },
    
    
    showSetTimeModal() {
        this.hideSetTimeModal(); // assure it's not visible before
        this.blurModules(true);
        
        // Show modal
        const body = document.getElementsByTagName('body')[0];
        const modal = this.createSetTimeModal();
        body.appendChild(modal);
    },

    hideSetTimeModal() {
        this.debug('hideSetTimeModal() called');
        this.blurModules(false);

        const modal = document.getElementById(this.SETTIME_MODAL_ID);
        if (modal) {
            modal.remove();
        }
    },

    createSetTimeModal() {
        // Modal itself
        const modal = document.createElement('div');
        modal.setAttribute('id', this.SETTIME_MODAL_ID);
        modal.classList.add('MMM-DigitalAlarmClock-set');
        modal.classList.add('bordered');

        modal.appendChild(this.createSetTimeModalContainer())

        return modal;
    },

    createSetTimeModalContainer() {
        const container = document.createElement('div');
        container.classList.add('settime-container');

        // Row 1
        container.appendChild(this.createSetTimeModalButtonCell('+', () => {
            this.updateHour(this.hour + 1);
        }));
        container.appendChild(this.createSetTimeModalMiddleCell(''));
        container.appendChild(this.createSetTimeModalButtonCell('+', () => {
            this.updateMinutes(this.minutes + this.config.minutesStepSize);
        }));

        // Row 2
        container.appendChild(this.createSetTimeModalNumberCell(this.SETTIME_HOUR_ID, this.formatTime(this.hour)));
        container.appendChild(this.createSetTimeModalMiddleCell(':'));
        container.appendChild(this.createSetTimeModalNumberCell(this.SETTIME_MINUTES_ID, this.formatTime(this.minutes)));
        
        // Row 3
        container.appendChild(this.createSetTimeModalButtonCell('-', () => {
            this.updateHour(this.hour - 1);
        }));
        container.appendChild(this.createSetTimeModalMiddleCell(''));
        container.appendChild(this.createSetTimeModalButtonCell('-', () => {
            this.updateMinutes(this.minutes - this.config.minutesStepSize);
        }));

        
        
        // Days check Boxes
        container.appendChild(this.createSetTimeModalDaysCheck(''));
        
        
        
        // OK Button
        container.appendChild(this.createSetTimeModalOkButton('OK'));
        
        return container;
    },

    createSetTimeModalOkButton(text) {
        const okButton = document.createElement('button');
        okButton.classList.add('button-ok');
        okButton.innerText = text;

        okButton.addEventListener('click', () => {
            this.hideSetTimeModal();
            this.updateAlarmActive(true);
        });
        return okButton;
    },
    createSetTimeModalDaysCheck(text) {
        
        
            this.thedays_arr = [-1, -1, -1, -1, -1, -1, -1];
            this.length_days = this.config.alarms[0].days.length;
            this.check_value = this.config.alarms[0].days;
            for(count=0;count< this.length_days;count++)
        {
               
               this.thedays_arr[this.check_value[count]] = this.check_value[count];

        }
        
        const DaysCheck = document.createElement('div');
       
        DaysCheck.classList.add('checkbox-DaysCheck');
        //this.check_value = this.config.alarms[0].days;
        //this.sendNotification("SHOW_ALERT", {title: "SunCheck", message: ""+String(this.config.alarms[0].days), timer: 5000});

        var theday, p, br;
        //this.thedays_arr = [-1, -1, -1, -1, -1, -1, -1];
       //this.sendNotification("SHOW_ALERT", {title: "this.thedays_arr", message: this.thedays_arr, timer: 4000}); 
       for(count=0;count< 7;count++)
        {
          theday=document.createElement("input"); 
          theday.type="checkbox";
          theday.id="theday" + count;
          
                
                
            if(this.thedays_arr[count] != -1){
                
                
                theday.value=('*' + '</br>');
                theday.checked = true;
                
                
                
            }else{
                
                theday.value=(' ' + '</br>');
                theday.checked = false;
                
               
            }
            
            
            theday.addEventListener('change', e => {
            //this.sendNotification("SHOW_ALERT", {title: "CHECKED", message: "YES", timer: 2000});
            const thearrnumb = this.retnum(e.target.id);
            if(e.target.checked){
                
                
                
                
                this.thedays_arr[thearrnumb]= thearrnumb;
                
                
            }else{
                //this.sendNotification("SHOW_ALERT", {title: "UNCH", message: "UN", timer: 2000});
                this.thedays_arr[thearrnumb] = -1;
                
                }
                });
            //this.sendNotification("SHOW_ALERT", {title: "SunCheck", message: "this.thedays_arr: "+this.thedays_arr, timer: 5000});        
            p =document.createElement("span");    
            p.innerHTML = " "+count.toString() + ":";
            br =document.createElement("br");
            
            
            
            
          
              
          DaysCheck.appendChild(p);
          DaysCheck.appendChild(theday);
          //DaysCheck.appendChild(br);
          
          

          
          
       }
         
       

            

       

        return DaysCheck;
    },
    retnum(str) { 
        var num = str.replace(/[^0-9]/g, ''); 
        return parseInt(num,10); 
    },
            
    updateHour(hour) {
        this.debug('updateHour(hour) called', hour);
        if(hour > 23) {
            this.hour = 0;
        } else if(hour < 0) {
            this.hour = 23;
        } else {
            this.hour = hour;
        }

        this.updateTime();
    },

    updateMinutes(minutes) {
        this.debug('updateMinutes(minutes) called', minutes);
        if(minutes > 59) {
            this.minutes = 0;
        } else if (minutes < 0) {
            this.minutes = 60 - this.config.minutesStepSize;
        } else {
            this.minutes = minutes;
        }

        this.updateTime();
    },

    updateTime() {
        
        /* var thetime = document.getElementById(this.DISPLAY_TIME_ID);
        thetime.innerText = this.formatFullTime(this.hour, this.minutes);
        this.sendNotification("SHOW_ALERT", {title: "Update Time", message: setTimeMinutes.innerText, timer: 1000});   */  
        const setTimeHour = document.getElementById(this.SETTIME_HOUR_ID);
        if(setTimeHour) {
            setTimeHour.innerText = this.formatTime(this.hour);
        }

        const setTimeMinutes = document.getElementById(this.SETTIME_MINUTES_ID);
        
        if(setTimeMinutes) {
            setTimeMinutes.innerText = this.formatTime(this.minutes);
            
        }
    },

    formatFullTime(hour, minutes) {
        return this.formatTime(hour) + ":" + this.formatTime(minutes);
    },

    formatTime(input) {
        return input < 10 ? '0' + input : input;
    },

    createSetTimeModalButtonCell(innerText, callback) {
        const buttonCell = document.createElement('div');
        buttonCell.classList.add('cell');
        buttonCell.classList.add('button-cell');

        const button = document.createElement('button');
        if (callback) {
            // Add click callback if it exists
            button.addEventListener('click', callback);
        }
        button.innerText = innerText;

        buttonCell.appendChild(button);
        return buttonCell;
    },

    createSetTimeModalMiddleCell(innerText) {
        const middleCell = document.createElement('div');
        middleCell.classList.add('cell');
        middleCell.classList.add('middle-cell');
        middleCell.innerText = innerText;
        return middleCell;
    },

    createSetTimeModalNumberCell(id, innerText) {
        const numberCell = document.createElement('div');
        numberCell.setAttribute('id', id);
        numberCell.classList.add('cell');
        numberCell.classList.add('number-cell');
        numberCell.innerText = innerText;
        return numberCell;
    },

    blurModules(blur) {
        const modules = document.querySelectorAll('.module');
        for (let i = 0; i < modules.length; i += 1) {
            if (!modules[i].classList.contains(this.name)) {
                if (blur) {
                    modules[i].classList.add(`${this.name}-blur`);
                } else {
                    modules[i].classList.remove(`${this.name}-blur`);
                }
            }
        }
    },
    
    socketNotificationReceived(notification, payload) {
        this.debug('socketNotificationReceived(notification, payload) called', notification, payload);

        // Handle if somebody want to update the current alarm
        if (notification === `${this.name}-UPDATE-ALARM`) {
            
            this.updateHour(payload.hour);
            
            this.updateMinutes(payload.minutes);
             
            
            //this.updateAlarmActive(payload.active);
            this.config.alarmSet = payload.active;
            
            this.config.alarms[0].days = payload.days;
            this.config.alarms[0].time = this.formatFullTime(payload.hour,payload.minutes);
            //
            
            if(payload.active) {
                // If the alarm is/was active set nextAlarm and check if it is gone already
                this.nextAlarm = payload.nextAlarm;
                this.checkAlarm();
            }
            
        //console.log("THIS.UPDATE-ALARM :"+this.hour+" : "+this.config.alarms[0].time);    
        this.setNextAlarm();
        }
    },

        
        
    suspend: function () {
    
        this.hideSetTimeModal();
  },
});
