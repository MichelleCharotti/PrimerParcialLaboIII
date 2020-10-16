var http = new XMLHttpRequest;
var fechaSeteada;
var trClick;
var rowGlobal;

window.onload = function () {
    var fecha = new Date();
    fechaSeteada = fecha.getFullYear() + "-" + (fecha.getMonth() + 1) + "-" + fecha.getDate();

    document.getElementById("idSpinner").hidden = false;

    http.onreadystatechange = callbackGrilla;
    http.open("GET", "http://localhost:3000/materias", true);
    http.send();

    ////// captar el doble click
    var eventoClick = document.getElementById("tCuerpo");
    eventoClick.addEventListener("dblclick", hacer_click);
    ///botones
    var btnCerrar = document.getElementById("btnCerrar");
    btnCerrar.addEventListener("click", Cerrar);

    var btnEliminar = document.getElementById("btnEliminar");
    btnEliminar.addEventListener("click", Eliminar);

    var btnModificar = document.getElementById("btnModificar");
    btnModificar.addEventListener("click", Modificar);
}

function callbackGrilla() {
    if (http.readyState == 4 && http.status == 200) {
        armarGrilla(JSON.parse(http.responseText));
    }
}

var tCuerpo;

function armarGrilla(jsonObj) {
    tCuerpo = document.getElementById("tCuerpo");

    for (var i = 0; i < jsonObj.length; i++) {
        var row = document.createElement("tr");
        row.setAttribute("idMaterias", jsonObj[i].id); 

        var cel0 = document.createElement("td");
        var text0 = document.createTextNode(jsonObj[i].id);
        cel0.appendChild(text0);
        row.appendChild(cel0);
        cel0.hidden = true;

        var cel1 = document.createElement("td");
        var text1 = document.createTextNode(jsonObj[i].nombre);
        cel1.appendChild(text1);
        row.appendChild(cel1);

        var cel2 = document.createElement("td");
        var text2 = document.createTextNode(jsonObj[i].cuatrimestre);
        cel2.appendChild(text2);
        row.appendChild(cel2);


        var cel3 = document.createElement("td");
        var text3 = document.createTextNode(jsonObj[i].fechaFinal);
        cel3.appendChild(text3);
        row.appendChild(cel3);

        var cel4 = document.createElement("td");
        var text4 = document.createTextNode(jsonObj[i].turno);
        cel4.appendChild(text4);
        row.appendChild(cel4);

        tCuerpo.appendChild(row);
    }
    document.getElementById("idSpinner").hidden = true;
}

function hacer_click(e) {
    console.log(e.target.parentNode);
    trClick = e.target.parentNode;
    document.getElementById("fname").value = trClick.childNodes[1].innerHTML;
    document.getElementById("idCuatri").value = trClick.childNodes[2].innerHTML;

    var fechaEnArray = trClick.childNodes[3].innerHTML.split("/");
    var auxFecha = fechaEnArray[2] + "-" + fechaEnArray[1] + "-" + fechaEnArray[0];
    document.getElementById("fecha").value = auxFecha;

    rowGlobal = trClick;
    if (trClick.childNodes[4].innerHTML == "Mañana") {
        document.getElementById("mañana").checked = true;
    } else {
        document.getElementById("noche").checked = true;
    }
    document.getElementById("idContenedor").hidden = false;
}


function Cerrar(e) {
    var contenedor = document.getElementById("idContenedor");
    contenedor.hidden = true;
}

function Eliminar(e) {
    document.getElementById("idSpinner").hidden = false;
    document.getElementById("idContenedor").hidden = true;

    var httpPost = new XMLHttpRequest();
    httpPost.onreadystatechange = function () {
        if (httpPost.readyState == 4 && http.status == 200) {
            rowGlobal.remove();
            document.getElementById("idSpinner").hidden = true;
        }
    }
    httpPost.open("POST", "http://localhost:3000/eliminar", true);
    httpPost.setRequestHeader("Content-Type", "application/json");
    var json = { "id": rowGlobal.getAttribute("idMaterias") };
    httpPost.send(JSON.stringify(json));
}

///////
function Modificar(e) {
    var nombre = document.getElementById("fname").value;
    var apellido = document.getElementById("idCuatri").value;
    var fecha = document.getElementById("fecha").value;
    var fechaEnArray = fecha.split("-");
    var auxFecha = fechaEnArray[2] + "/" + fechaEnArray[1] + "/" + fechaEnArray[0];
    var mañana = document.getElementById("mañana");
    var noche = document.getElementById("noche");

    if (obtenerFecha(fecha) > Date.now()) {
        if (nombre.length >= 6 && (mañana.checked == true || noche.checked == true)) {
            var resultado = confirm("Esta seguro que desea modificar una materia?");
            var httpPost = new XMLHttpRequest();
            if (resultado == true) {
                document.getElementById("idSpinner").hidden = false;
                document.getElementById("idContenedor").hidden = true;

                httpPost.onreadystatechange = function () {
                    if (httpPost.readyState == 4 && http.status == 200) {
                        document.getElementById("fname").className = "sinError";
                        document.getElementById("idCuatri").className = "sinError";
                        document.getElementById("fecha").className = "sinError";

                        rowGlobal.childNodes[1].innerHTML = nombre;
                        rowGlobal.childNodes[2].innerHTML = apellido;
                        rowGlobal.childNodes[3].innerHTML = auxFecha;

                        if (mañana.checked == true) {
                            rowGlobal.childNodes[4].innerHTML = "mañana";
                        } else if (noche.checked == true) {
                            rowGlobal.childNodes[4].innerHTML = "noche"
                        }
                        document.getElementById("idSpinner").hidden = true;
                    }
                }

                httpPost.open("POST", "http://localhost:3000/editar", true);
                httpPost.setRequestHeader("Content-Type", "application/json");
                if (noche.checked == true) {
                    var json = { "id": rowGlobal.getAttribute("idMaterias"), "nombre": nombre, "cuatrimestre": "cuatrimestre", "fecha": auxFecha, "turno": "noche" };
                } else if (mañana.checked == true) {
                    var json = { "id": rowGlobal.getAttribute("idMaterias"), "nombre": nombre, "cuatrimestre": "cuatrimestre", "fecha": auxFecha, "turno": "mañana" };
                }

                httpPost.send(JSON.stringify(json));
            }
        } else {
            document.getElementById("fname").className = "error";
            alert("Nombre deben tener mas de 6 caracteres");
            fname.className = "inputError";
            return;
        }
        // fname.className="SinError";
    } else {
        alert("La fecha debe ser mayor al dia de hoy");
        document.getElementById("fecha").className = "error";
        return;
    }
}
function obtenerFecha(auxFecha) 
{
    let data = new Date();
    var fechaEnArray = auxFecha.split("-");

    data.setFullYear(fechaEnArray[0]);
    data.setMonth(fechaEnArray[1] - 1);
    data.setDate(fechaEnArray[2]);

    return data;
}