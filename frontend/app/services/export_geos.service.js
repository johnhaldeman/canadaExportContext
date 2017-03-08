"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
var ExportGeoData = (function () {
    function ExportGeoData() {
    }
    return ExportGeoData;
}());
exports.ExportGeoData = ExportGeoData;
var ExportGeoService = (function () {
    function ExportGeoService(http) {
        this.http = http;
        this.url = 'http://localhost:8080/ExportContext/ExportGeos';
    }
    ExportGeoService.prototype.getYearData = function () {
        return this.http.get(this.url)
            .map(this.extractData)
            .catch(this.handleError);
    };
    ExportGeoService.prototype.getGeoData = function (year, territory, include_us) {
        var url = this.url + "?year=" + year + "&territory=" + territory + "&include_us=" + include_us;
        return this.http.get(url)
            .map(this.extractData)
            .catch(this.handleError);
    };
    ExportGeoService.prototype.extractData = function (res) {
        var body = res.json();
        return body || {};
    };
    ExportGeoService.prototype.handleError = function (error) {
        var errMsg;
        if (error instanceof http_1.Response) {
            var body = error.json() || '';
            var err = body.error || JSON.stringify(body);
            errMsg = error.status + " - " + (error.statusText || '') + " " + err;
        }
        else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable_1.Observable.throw(errMsg);
    };
    return ExportGeoService;
}());
ExportGeoService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], ExportGeoService);
exports.ExportGeoService = ExportGeoService;
//# sourceMappingURL=export_geos.service.js.map