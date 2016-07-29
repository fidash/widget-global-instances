/*global MashupPlatform, $ */

/*
 * widget-global-instances
 * https://github.com/rockneurotiko/widget-global-instances
 *
 * Copyright (c) 2016 CoNWeT
 * Licensed under the MIT license.
 */

/* exported WidgetGlobalInstances */

var WidgetGlobalInstances = (function () {

    "use strict";

    /*********************************************************
     ************************CONSTANTS*************************
     *********************************************************/
    var url = "http://nagios.lab.fiware.org/orion/v1/queryContext";

    var servs = {
        "cep.lab.fiware.org": ["http_api"],
        "chef-server.lab.fiware.org": ["http_web"],
        "cosmos.lab.fiware.org": ["http_fs", "https_web"],
        "gis.lab.fiware.org": ["http_web", "http_web_client"],
        "iot-discovery.lab.fiware.org": ["http_api", "http_ngsi"],
        "iotbroker.lab.fiware.org": ["http_web"],
        "kurento.lab.fiware.org": ["https_web", "https_web_demo", "https_web_demo2", "https_web_mirror"],
        "maketplace.lab.fiware.org": ["https_web"],
        "mashup.lab.fiware.org": ["http_web", "https_api"],
        "ngsiproxy.lab.fiware.org": ["http_api", "https_api"],
        "orion.lab.fiware.org": ["http_api"],
        "pegasus.lab.fiware.org": ["https_api"],
        "poi.lab.fiware.org": ["http_api", "http_web"],
        "policymanager.lab.fiware.org": ["http_api", "http_info"],
        "puppet-master.lab.fiware.org": ["https_server"],
        "repository.lab.fiware.org": ["http_api"],
        "rss.lab.fiware.org": ["http_web"],
        "saggita.lab.fiware.org": ["https_api"],
        "store.lab.fiware.org": ["http_web", "https_web"]
    };


    /*********************************************************
     ************************VARIABLES*************************
     *********************************************************/

    /********************************************************/
    /**********************CONSTRUCTOR***********************/
    /********************************************************/

    var WidgetGlobalInstances = function WidgetGlobalInstances() {
        // MashupPlatform.prefs.registerCallback(function (new_preferences) {

        // }.bind(this));
        init();
    };

    /*********************************************************
     **************************PRIVATE*************************
     *********************************************************/

    var createCard = function createCard(id, code, reason) {
        var $out = $("<div></div>", {
            id: id.replace(/(\.|:)/g, "_"),
            class: "status-card mdl-card mdl-shadow--2dp " + ((reason === "OK") ? "ok" : "nook")
        });

        var $inner = $("<div></div>", {
            class: "center-text mdl-card__title mdl-card--expand"
        });

        var host = id.split(":")[1];
        var serv = id.split(":")[2];

        var $h4 = $("<h4></h4>", {
            text: host + " -> " + serv
        });

        $h4.appendTo($inner);
        $inner.appendTo($out);
        var $main = $("#main");
        $out.appendTo($main);

        var $divs = $main.children("div");
        $divs.sort(function (a, b) {
            var at = a.textContent;
            var bt = b.textContent;

            var ah = at.split("->")[0].trim();
            var as = at.split("->")[1].trim();

            var bh = bt.split("->")[0];
            var bs = bt.split("->")[1];

            if (ah > bh) {
                return 1;
            }
            if (ah < bh) {
                return -1;
            }
            if (as > bs) {
                return 1;
            }
            if (as < bs) {
                return -1;
            }
            return 0;
        });

        $divs.detach().appendTo($main);
    };


    var getStatus = function getStatus(host, service) {
        var labname = "lab:" + host + ":" + service;
        var data = {
            entities: [{
                "type": "ge",
                "isPattern": "true",
                "id": labname
            }]
        };

        var options = {
            method: "POST",
            postBody: JSON.stringify(data),
            contentType: "application/json",
            requestHeaders: {
                Accept: "application/json"
            },
            onSuccess: function (response) {
                var data = JSON.parse(response.responseText);
                if (data.contextResponses.length === 0) {
                    return;
                }

                var statusData;
                for (var i in data.contextResponses) {
                    var resp = data.contextResponses[i];
                    if (resp.contextElement.id === labname) {
                        statusData = resp;
                        break;
                    }
                }
                if (!statusData) {
                    return;
                }

                var id = statusData.contextElement.id;
                var code = statusData.statusCode.code;
                var reason = statusData.statusCode.reasonPhrase;
                createCard(id, code, reason);
                // window.console.log(id, code, reason);
            },
            onFailure: function (response) {
                window.console.log(response);
            }
        };

        MashupPlatform.http.makeRequest(url, options);
    };


    var init = function init() {
        var keys = Object.keys(servs);
        for (var keyi in keys) {
            var key = keys[keyi];
            for (var namei in servs[key]) {
                getStatus(key, servs[key][namei]);
            }
        }
    };


    /****************************************/
    /************AUXILIAR FUNCTIONS**********/
    /****************************************/

    /* test-code */
    WidgetGlobalInstances.prototype = {
    };

    /* end-test-code */

    return WidgetGlobalInstances;

})();
