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
var export_proportions_service_1 = require("../../services/export_proportions.service");
var export_years_service_1 = require("../../services/export_years.service");
var PieChartList_1 = require("../pie-chart-list/PieChartList");
var router_1 = require("@angular/router");
var ExportProportionsComponent = (function () {
    function ExportProportionsComponent(exportPropService, exportYearsService, route, router) {
        var _this = this;
        this.exportPropService = exportPropService;
        this.exportYearsService = exportYearsService;
        this.route = route;
        this.router = router;
        this.drillAction = {
            id: 'drillDown',
            text: 'Click to Zoom to Subcategories',
            action: null,
            enabled: true
        };
        this.totalVal = 0;
        this.grandTotalVal = 1;
        this.currentYear = '2016';
        this.country = "Loading....";
        router.events.subscribe(function (event) {
            if (_this.route.snapshot.params['url'] != _this.currentURL) {
                _this.currentURL = _this.route.snapshot.params['url'];
                var yearIndex = _this.currentURL.indexOf("year=");
                _this.currentYear = _this.currentURL.substr(yearIndex + 5, 4);
                _this.redrawOnNavigation();
            }
        });
    }
    ExportProportionsComponent.prototype.onYearSliderChange = function (event) {
        if (event.value != this.currentYear) {
            this.currentYear = event.value;
            var yearIndex = this.currentURL.indexOf("year=");
            var newURL = this.currentURL.substr(0, yearIndex + 5);
            newURL += event.value;
            newURL += this.currentURL.substr(yearIndex + 9);
            this.router.navigate(["proportions", newURL]);
        }
    };
    ExportProportionsComponent.prototype.ngOnInit = function () {
        this.redrawOnNavigation();
        this.getYearData();
    };
    ExportProportionsComponent.prototype.redrawOnNavigation = function () {
        var _this = this;
        if (this.route.snapshot.params['url']) {
            this.exportPropService.getPropData(this.route.snapshot.params['url'])
                .subscribe(function (data) { return _this.processData(data); }, function (error) { return _this.processError(error); });
        }
        else {
            this.router.navigate(["proportions", "ExportProportions?year=2016&offset=1&max=10&level=2"]);
        }
    };
    ExportProportionsComponent.prototype.getYearData = function () {
        var _this = this;
        this.exportYearsService.getYearData()
            .subscribe(function (yearData) {
            _this.years = yearData;
        }, function (error) { return _this.errorMessage = error; });
    };
    ExportProportionsComponent.prototype.processData = function (data) {
        var _this = this;
        if (data.url_history != undefined) {
            this.chartList.chopList(data.url_history.length);
            var _loop_1 = function (i) {
                if (!this_1.chartList.isLoaded(i, data.url_history[i])) {
                    this_1.exportPropService.getPropData(data.url_history[i])
                        .subscribe(function (histData) { return _this.processHistoryData(histData, i, data.url_history[i]); }, function (error) { return _this.processError(error); });
                }
                else if (i == 0) {
                    this_1.grandTotalVal = this_1.chartList.charts[i].total;
                }
            };
            var this_1 = this;
            for (var i = 0; i < data.url_history.length; i++) {
                _loop_1(i);
            }
        }
        else {
            this.chartList.clear();
            this.grandTotalVal = data.total;
        }
        //data.data.shift();
        //this.data.removeRows(0, this.data.getNumberOfRows());
        this.data = data.data;
        if (this.data[1][4] == '') {
            console.log('end of the line');
            this.drillAction.enabled = false;
        }
        this.title = data.title;
        this.totalVal = data.total;
        this.country = data.country;
        this.actions = this.getActionClosures();
    };
    ExportProportionsComponent.prototype.reformatDataToHTML = function (data) {
        var retArray = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
            retArray[i] = new Array(3);
            retArray[i][0] = data[i][0];
            retArray[i][1] = data[i][1];
            //retArray[i][2] = this.getHTML(data[i][0], data[i][1]);
        }
        return retArray;
    };
    ExportProportionsComponent.prototype.getHTML = function (product, valText) {
        var encodedLink = encodeURIComponent('ExportGeos?' +
            'year=' + this.currentYear + '&territory=World&include_us=true' +
            '&hs_level=2&hs_category=Pharmaceutical products');
        var html = '<strong><u>' + product + '</u></strong></br>'
            + '<span style="white-space:nowrap">' + valText + '</span></br>'
            + '<a href="/proportions/'
            + encodedLink
            + '">View Products Exported</a>';
        return html;
    };
    ExportProportionsComponent.prototype.processHistoryData = function (data, index, url) {
        this.chartList.addChartAt(data.data, data.title, data.total, url, index);
    };
    ExportProportionsComponent.prototype.processError = function (error) {
        var _this = this;
        return function (error) { return _this.errorMessage = error; };
    };
    ExportProportionsComponent.prototype.onNewChartFocus = function (chart) {
        this.data = chart.chartData;
        this.title = chart.title;
        this.totalVal = chart.total;
        this.router.navigate(["proportions", chart.url]);
    };
    ExportProportionsComponent.prototype.getActionClosures = function () {
        function getGeoClosure(data, router) {
            return function (chart) {
                return function () {
                    var row = chart.getSelection()[0].row;
                    var url = data[row + 1][5];
                    router.navigate(["geos", url]);
                };
            };
        }
        this.drillAction.action = this.getDrillClosure(this.data, this.router);
        return [
            this.drillAction,
            {
                id: 'viewGeos',
                text: 'Click to View Export Countries for Category',
                action: getGeoClosure(this.data, this.router),
                enabled: true
            }
        ];
    };
    ExportProportionsComponent.prototype.getDrillClosure = function (data, router) {
        return function (chart) {
            return function () {
                var row = chart.getSelection()[0].row;
                var url = data[row + 1][4];
                router.navigate(["proportions", url]);
            };
        };
    };
    ;
    return ExportProportionsComponent;
}());
__decorate([
    core_1.ViewChild(PieChartList_1.PieChartList),
    __metadata("design:type", PieChartList_1.PieChartList)
], ExportProportionsComponent.prototype, "chartList", void 0);
ExportProportionsComponent = __decorate([
    core_1.Component({
        //selector: 'trade-app',
        templateUrl: '/app/components/export-proportions/templates/exportProportionsTemplate.html'
    }),
    __metadata("design:paramtypes", [export_proportions_service_1.ExportProportionService,
        export_years_service_1.ExportYearsService,
        router_1.ActivatedRoute,
        router_1.Router])
], ExportProportionsComponent);
exports.ExportProportionsComponent = ExportProportionsComponent;
//# sourceMappingURL=export-proportions.component.js.map