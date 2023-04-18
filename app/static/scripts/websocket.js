/*Abre a conexão com serviço WebSocket do ESP*/
export var ws = new WebSocket("ws://" + window.location.host + "/live");

ws.onopen = function () {
	// document.getElementById("connection_status").innerHTML = "Status: Conectado";
};
