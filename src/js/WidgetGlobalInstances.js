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

    /*var servs = {
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
    };*/


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

    var createServiceCard = function createCard(host, service, status, code, reason) {

        var $main = $("#main");
        var hostDOM = document.getElementById(host);
        var $host = hostDOM ? $(hostDOM) : null;
        var servicesContainer = document.getElementById(host + "-services");
        var $servicesContainer = servicesContainer ? $(servicesContainer) : null;
        var statusText = ((status === "") ? "MISSING" : status); // OK, CRITICAL, WARNING, UNKNOWN

        if (!$host) {
            $host = $("<div></div>", {
                'id': host,
                'class': "host"
            }).append($("<div></div>", {
                'text': host,
                'class': "host-name"
            }));
            $servicesContainer = $("<div></div>", {
                'id': host + "-services",
                'class': "services-container"
            });
            $servicesContainer.appendTo($host);
            $host.appendTo($main);
        }

        var $service = $("<div></div>" , {
            'id': host + ":" + service,
            'class': "service",
            'data-toggle': "tooltip",
            'title': service + ": " + "status " + status + ", code" + code + ": " + reason
        }). append($("<div></div>", {
            'class': "service-name",
            'text': service
        }));

        $servicesContainer.append($service);

        // Add service status
        $service.append($("<label></label>", {
            'text': statusText,
            'class': statusText.toLowerCase()
        }));

        // Sort services
        var $services = $servicesContainer.children("div");
        $services.sort(function (a, b) {
            return a.id < b.id;
        });
        $services.detach().appendTo($servicesContainer);

        // Sort hosts
        var $hosts = $main.children("div");
        $hosts.sort(function (a, b) {
            return a.id < b.id;
        });

        $hosts.detach().appendTo($main);
    };


    var getStatus = function getStatus(host, service) {
        //var labname = "lab:" + host + ":" + service;
        var data = {
            entities: [{
                "type": "ge",
                "isPattern": "true",
                "id": "lab:.*"
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

                var hostData;
                var hostId;
                var host;
                var service;
                var code;
                var reason;

                for (var i in data.contextResponses) {
                    hostData = data.contextResponses[i];
                    hostId = hostData.contextElement.id.split(":");
                    host = hostId[1];
                    service = hostId[2];
                    code = hostData.statusCode.code;
                    reason = hostData.statusCode.reasonPhrase;
                    createServiceCard(host, service, status, code, reason);
                }
            },
            onFailure: function (response) {
                window.console.log(response);
            }
        };

        MashupPlatform.http.makeRequest(url, options);
    };


    var init = function init() {
        getStatus();
    };


    /****************************************/
    /************AUXILIAR FUNCTIONS**********/
    /****************************************/


    return WidgetGlobalInstances;

})();
