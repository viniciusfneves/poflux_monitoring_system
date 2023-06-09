import { ws } from "./websocket.js";
import "https://cdn.plot.ly/plotly-2.20.0.min.js";

const lens_info_graph = document.getElementById("lens_info");

const fig_aperture = 5;

var modified = false;
var ticks = 0;

window.onload = function () {
	document.getElementById("auto-btn").addEventListener("click", (_) => ws.send("{'mode':'auto'}"));
	document.getElementById("manual-btn").addEventListener("click", (_) => ws.send("{'mode':'manual'}"));
	document.getElementById("halt-btn").addEventListener("click", (_) => ws.send("{'mode':'halt'}"));
	document.getElementById("adjust_rtc").oninput = function () {
		modified = true;
		ticks = 0;
	};
	document.getElementById("rtc-set-btn").addEventListener("click", (_) => {
		let value = document.getElementById("adjust_rtc").value;
		let date = Date.parse(value + "Z");
		ws.send(`{'adjust':{'rtc':${date / 1000}}}`);
	});
	document
		.getElementById("download-tracking-file")
		.addEventListener("click", (_) => (window.location.href = "pof-lux/tracking"));
	document.getElementById("clear-tracking-file").addEventListener("click", (_) =>
		fetch("/pof-lux/clear_tracking", {
			method: "DELETE",
		}).then((response) => {
			if (response.status == 200) {
				alert("Sucesso! Dados apagados");
			} else {
				alert("Ops! Algo deu errado");
			}
		})
	);
	// document.getElementById("debug-send-button").addEventListener("click", (_) => {
	// 	let message = document.getElementById("debug_message-text-field").value;
	// 	ws.send(message);
	// });

	setInterval(() => {
		if (!modified) {
			var now = new Date(Date.now()).toISOString();
			var nowStr = now.substring(0, now.lastIndexOf("."));
			document.getElementById("adjust_rtc").value = nowStr;
		} else {
			ticks++;
			if (ticks > 15) {
				modified = false;
				ticks = 0;
			}
		}
	}, 1000);
};

function setOpMode(mode) {
	var buttons = document.getElementsByClassName("mode-btn");
	for (var i = 0, len = buttons.length; i < len; i++) {
		buttons[i].style.backgroundColor = "gray";
	}
	if (mode + "-btn" == "halt-btn") {
		document.getElementById(mode + "-btn").style.backgroundColor = "#dc3545";
	} else {
		document.getElementById(mode + "-btn").style.backgroundColor = "#198754";
	}
}

ws.onmessage = function (response) {
	let json = JSON.parse(response.data);

	let now = new Date(json["esp_clock"] * 1000);

	setOpMode(json["mode"]);

	document.getElementById("rtc_day").innerHTML = now.getUTCDate();
	document.getElementById("rtc_month").innerHTML = now.getUTCMonth() + 1;
	document.getElementById("rtc_year").innerHTML = now.getUTCFullYear();
	document.getElementById("rtc_hour").innerHTML = now.getUTCHours();
	document.getElementById("rtc_minute").innerHTML = now.getUTCMinutes();
	document.getElementById("rtc_second").innerHTML = now.getUTCSeconds();

	let motor_percentage = (json["motor"] / 2.55).toFixed(1);
	document.getElementById("motor-bar").value = motor_percentage;
	document.getElementById("kp").innerHTML = json["pid_values"]["kp"];
	document.getElementById("ki").innerHTML = json["pid_values"]["ki"];
	document.getElementById("kd").innerHTML = json["pid_values"]["kd"];
	document.getElementById("P").innerHTML = json["pid_values"]["p"].toFixed(1);
	document.getElementById("I").innerHTML = json["pid_values"]["i"].toFixed(2);
	document.getElementById("D").innerHTML = json["pid_values"]["d"].toFixed(2);
	document.getElementById("pid_output").innerHTML = json["pid_values"]["output"];
	document.getElementById("error").innerHTML = json["pid_values"]["error"];

	let manual_setpoint = json["manual_setpoint"];
	let lens_angle = json["mpu"]["lens_angle"];
	let sun_position = json["sun_position"];
	Plotly.newPlot(
		lens_info_graph,
		[
			{
				name: "Manual Setpoint",
				type: "scatterpolar",
				mode: "lines",
				r: [1.5, 1.75],
				theta: [manual_setpoint, manual_setpoint],
				line: {
					width: 8,
					color: "deepskyblue",
				},
			},
			{
				name: "Lens Angle",
				type: "scatterpolar",
				mode: "lines",
				r: [2, 2.25, 2.25, 2],
				theta: [
					lens_angle - fig_aperture,
					lens_angle - fig_aperture,
					lens_angle + fig_aperture,
					lens_angle + fig_aperture,
				],
				fill: "toself",
				fillcolor: "red",
				line: {
					color: "red",
				},
			},
			{
				name: "Sun Position",
				type: "scatterpolar",
				mode: "lines",
				r: [4, 4.25, 4.25, 4],
				theta: [
					sun_position - fig_aperture,
					sun_position - fig_aperture,
					sun_position + fig_aperture,
					sun_position + fig_aperture,
				],
				fill: "toself",
				fillcolor: "#ffc107",
				line: {
					color: "#ffc107",
				},
			},
		],
		{
			paper_bgcolor: "transparent",
			polar: {
				sector: [0, 180],
				radialaxis: {
					range: [0, 4.5],
					visible: false,
				},
				// angularaxis: {
				// 	direction: "clockwise",
				// },
			},
			showlegend: true,
			legend: { orientation: "h", x: 0.5, xanchor: "center" },
		},
		{
			responsive: true,
			displaylogo: false,
			displayModeBar: false,
		}
	);
};
