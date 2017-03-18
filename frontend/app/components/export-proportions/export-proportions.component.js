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
        this.mainPieChartData = [];
        this.totalVal = 0;
        this.grandTotalVal = 1;
        this.currentYear = '2016';
        router.events.subscribe(function (event) {
            if (_this.route.snapshot.params['year'] != _this.currentYear) {
                _this.redrawOnNavigation();
                console.log('navigation triggered');
                console.log(_this.route.snapshot.params);
            }
        });
    }
    ExportProportionsComponent.prototype.onYearSliderChange = function (event) {
        if (event.value != this.currentYear) {
            console.log('slider event triggered');
            this.chartList.clear();
            this.router.navigate(['proportions', event.value]);
        }
    };
    ExportProportionsComponent.prototype.ngOnInit = function () {
        this.redrawOnNavigation();
        this.getYearData();
    };
    ExportProportionsComponent.prototype.redrawOnNavigation = function () {
        if (this.route.snapshot.params['year'])
            this.currentYear = this.route.snapshot.params['year'];
        console.log('redrawing with ' + this.currentYear);
        this.getHS2Data();
    };
    ExportProportionsComponent.prototype.getYearData = function () {
        var _this = this;
        this.exportYearsService.getYearData()
            .subscribe(function (yearData) {
            _this.years = yearData;
        }, function (error) { return _this.errorMessage = error; });
    };
    ExportProportionsComponent.prototype.getHS2Data = function () {
        var _this = this;
        this.exportPropService.getHS2Data(this.currentYear, 1, 10)
            .subscribe(function (hs2Data) {
            _this.mainPieChartData = hs2Data.data;
            _this.title = hs2Data.title;
            _this.totalVal = hs2Data.total;
            _this.grandTotalVal = hs2Data.total;
        }, function (error) { return _this.errorMessage = error; });
    };
    ExportProportionsComponent.prototype.processData = function (data) {
        this.chartList.addChart(this.mainPieChartData, this.title, this.totalVal);
        this.mainPieChartData = data.data;
        this.title = data.title;
        this.totalVal = data.total;
    };
    ExportProportionsComponent.prototype.processError = function (error) {
        var _this = this;
        return function (error) { return _this.errorMessage = error; };
    };
    ExportProportionsComponent.prototype.onNewChartFocus = function (chart) {
        this.mainPieChartData = chart.chartData;
        this.title = chart.title;
        this.totalVal = chart.total;
    };
    ExportProportionsComponent.prototype.onMainChartSelected = function (selected) {
        var _this = this;
        console.log('User Selected: component' + JSON.stringify(selected));
        if (selected[0]) {
            var url = this.mainPieChartData[selected[0].row + 1][4];
            if (url != '') {
                this.exportPropService.getPropData(url)
                    .subscribe(function (data) { return _this.processData(data); }, function (error) { return _this.processError(error); });
            }
        }
    };
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