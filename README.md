# Module: MMM-DigitalAlarmClock:

This module is a combination of the digital part of the default MM<sup>2</sup> clock module and @fewieden's MMM-AlarmClock 3<sup>rd</sup> Party module for MM<sup>2</sup>.

## Screenshots

![ScreenShot for Alarm Set](https://github.com/rafhtl/MMM-DigitalAlarmClock/blob/master/Screenshot%20(1).png)
![ScreenShot for Alarm Not Set](https://github.com/rafhtl/MMM-DigitalAlarmClock/blob/master/Screenshot%20(2).png)

## Installing this module:

$ cd MagicMirror<br>
$ cd modules<br>
$ git clone https://github.com/rafhtl/MMM-DigitalAlarmClock.git<br>
$ cd MMM-DigitalAlarmClock<br>
$ npm i<br>

## Using the module:

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		disabled: false,
		module: "MMM-DigitalAlarmClock",
		position: "top_center",	// This can be any of the regions.
		config: {
			timezone: "America/Chicago",
			alarmSet: true,
			alarms: [
				{
					time: "09:30",
					days: [1, 2, 3, 4, 5],
					sound: "alarm.mp3",
				}
			],
			sound: "alarm.mp3", // default sound if not set within the alarms section
			touch: false,
			snooze: false,
			popup: true,
		}
	},
]
````
**The power button on the bottom left side can be clicked (or touched) to turn on or off the alarm as well as silence the alarm**

## Configuration options

The following properties can be configured:

| Option            | Description
| ----------------- | -----------
| `alarmSet`        | to enable or disable the alarm <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `timeFormat`      | Use 12 or 24 hour format. <br><br> **Possible values:** `12` or `24` <br> **Default value:** uses value of _config.timeFormat_
| `showDate`        | Turn off or on the Date section. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `showWeek`        | Turn off or on the Week section. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `dateFormat`      | Configure the date format as you like. <br><br> **Possible values:** [Docs](http://momentjs.com/docs/#/displaying/format/) <br> **Default value:** `"dddd, LL"`
| `timezone`        | Specific a timezone to show clock. <br><br> **Possible examples values:** `America/New_York`, `America/Santiago`, `Etc/GMT+10` <br> **Default value:** `"America/Chicago"` (central time US). See more informations about configuration value [here](https://momentjs.com/timezone/docs/#/data-formats/packed-format/).
| `touch`           | for touch screen, touch alert message box to turn off the alarm. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `popup`           | to show the alert message box on the screen, click to turn off the alarm. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `snooze`	    | Turn on of off the snooze function in combination with touch and popup turned on, click to snooze, double click or power button cycle to turn off. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `snoozeTimer`	    | To define the amount of snoozeTimeUnit to snooze. <br><br> **Possible values:** `int` <br> **Default value:** `5`
| `snoozeTimerUnit` | To define the snoozeTimerUnit. <br><br> **Possible values:** `minutes`, `seconds` or `hours` <br> **Default value:** `"minutes"`
| ----------------- | -----------
| `alarms`          | must be inside [{}], can set as many as needed. See below for example.
| `time`            | must be set in 24hr time. Time shown in module will be how you have it set in your config.js file.
| `days`            | are nubered starting with Sunday = 0 through Saturday = 6.
| `sound`           | can set a different sound for different alarms. See sounds folder for choices, may add your own.
| `snooze`	    | (optional) overrides the default snooze setting
| `snoozeTimer`	    | (optional) overrides the default snoozeTimer setting
| `snoozeTimerUnit` | (optional) overrides the default snoozeTimerUnit setting
| `title`           | (optional) add a reason for the alarm
| `message`         | (optional) add a message to the alert

 ````javascript
 alarms: [
	{
		time: "0600",
		days: [0, 5, 6], // Sun, Fri, Sat
		title: "Weekend - Work",
		snooze: true,
		message: "Get Up and Go To Work!",
		sound: alarm.mp3
	},
	{
		time: "0900",
		days: [1, 2, 3, 4], // Mon, Tue, Wed, Thu
		message: "TIME TO WORK OUT!!!",
		sound: Tornado_Siren.mp3
	},
	{
		... // CAN ADD AS MANY DIFFERENT ALARMS AS YOU NEED
	}
 ],
````
==================================================================================

## Acknowledgements:

@MichMich for the default clock module from which this was started<br>
@fewieden for his MMM-AlarmClock module from which was added to the default clock module<br>
@wesdsturdevant for his help with some of the code issues I ran into a few times<br>
@sdetwiel as always, for his help and input<br>
