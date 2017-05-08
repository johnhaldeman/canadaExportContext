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
var export_geos_service_1 = require("../../services/export_geos.service");
var export_years_service_1 = require("../../services/export_years.service");
var router_1 = require("@angular/router");
var google_chart_1 = require("../google-chart/google-chart");
var ExportGeosComponent = (function () {
    function ExportGeosComponent(exportPropService, exportYearsService, router) {
        this.exportPropService = exportPropService;
        this.exportYearsService = exportYearsService;
        this.router = router;
        this.regions = [
            ["world", "World", "countries"],
            ["US", "US", "provinces"],
            ["002", "Africa", "countries"],
            ["150", "Europe", "countries"],
            ["005", "South America", "countries"],
            ["013", "Central America", "countries"],
            ["029", "Caribean", "countries"],
            ["142", "Asia", "countries"],
            ["009", "Oceania", "countries"]
        ];
        this.test = "";
        this.chartOptions = { displayMode: 'regions',
            colorAxis: { colors: ['F5F3F3', '771111'] },
            datalessRegionColor: 'FFFFFF'
            //,region: "009"
            ,
            resolution: 'countries',
            region: "world",
            height: window.innerHeight / 1.5,
            width: window.innerWidth,
            tooltip: { isHtml: true, trigger: 'selection' }
        };
        this.id = 'geochart1';
        this.chartType = 'GeoChart';
        this.include_us = true;
        this.territory = 'World';
        this.year = '2015';
        this.total = 0;
        this.grand_total = 0;
    }
    ExportGeosComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (!googleLoaded) {
            googleLoaded = true;
            google.charts.load('upcoming', { 'packages': ['geochart'] });
        }
        google.charts.setOnLoadCallback(function () {
            _this.data = new google.visualization.DataTable();
            _this.data.addColumn('string', 'Region');
            _this.data.addColumn('number', 'ExportValue');
            _this.data.addColumn({ type: 'string', role: 'tooltip', 'p': { 'html': true } });
            _this.getGeoData();
        });
    };
    ExportGeosComponent.prototype.reformatDataToHTML = function (data, ids) {
        var retArray = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
            retArray[i] = new Array(3);
            retArray[i][0] = data[i][0];
            retArray[i][1] = data[i][1];
            retArray[i][2] = this.getHTML(data[i][2], data[i][3], data[i][4]);
        }
        return retArray;
    };
    ExportGeosComponent.prototype.getHTML = function (country, valText, id) {
        var encodedLink = encodeURIComponent('ExportProportions?' +
            'year=' + this.year + '&offset=1&max=10&level=2&country='
            + id);
        var html = '<strong><u>' + country + '</u></strong></br>'
            + '<span style="white-space:nowrap">' + valText + '</span></br>'
            + '<a href="/proportions/'
            + encodedLink
            + '">View Products Exported</a>';
        return html;
    };
    ExportGeosComponent.prototype.getGeoData = function () {
        var _this = this;
        this.exportPropService.getGeoData(this.year, this.territory, this.include_us)
            .subscribe(function (geoData) {
            geoData.data.shift();
            _this.data.removeRows(0, _this.data.getNumberOfRows());
            _this.data.addRows(_this.reformatDataToHTML(geoData.data, geoData.ids));
            _this.total = geoData.total;
            _this.grand_total = geoData.grand_total;
            _this.test = geoData.total + "";
            _this.ids = geoData.ids;
        }, function (error) { return _this.errorMessage = error; });
    };
    ExportGeosComponent.prototype.includeUSChanged = function (event) {
        this.include_us = event.checked;
        this.getGeoData();
    };
    ExportGeosComponent.prototype.onRegionSelected = function (event) {
        this.chartOptions.region = event.value;
        for (var i = 0; i < this.regions.length; i++) {
            if (this.regions[i][0] == event.value) {
                this.chartOptions.resolution = this.regions[i][2];
                this.territory = this.regions[i][1];
            }
        }
        this.test = event.value;
        this.getGeoData();
    };
    ExportGeosComponent.prototype.onYearSliderChange = function (event) {
        if (event.value != this.year) {
            this.year = event.value;
            this.test = event.value;
            this.getGeoData();
        }
    };
    ExportGeosComponent.prototype.onCountrySelected = function (event) {
        var row = event[0].row;
    };
    return ExportGeosComponent;
}());
__decorate([
    core_1.ViewChild(google_chart_1.GoogleChart),
    __metadata("design:type", google_chart_1.GoogleChart)
], ExportGeosComponent.prototype, "chart", void 0);
ExportGeosComponent = __decorate([
    core_1.Component({
        templateUrl: '/app/components/export-geos/templates/exportGeosTemplate.html'
    }),
    __metadata("design:paramtypes", [export_geos_service_1.ExportGeoService,
        export_years_service_1.ExportYearsService,
        router_1.Router])
], ExportGeosComponent);
exports.ExportGeosComponent = ExportGeosComponent;
//# sourceMappingURL=export-geos.component.js.map