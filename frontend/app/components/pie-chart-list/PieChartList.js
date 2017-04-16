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
var ChartDefinition_1 = require("../chart-definition/ChartDefinition");
var PieChartList = (function () {
    function PieChartList(element) {
        this.element = element;
        this.onChartFocus = new core_1.EventEmitter();
        this.charts = new Array();
    }
    PieChartList.prototype.focusChart = function (index) {
        this.onChartFocus.emit(this.charts[index]);
        this.charts = this.charts.slice(0, index);
    };
    PieChartList.prototype.buildNewChartDef = function (chartData, chartTitle, total, url, id) {
        var chartDef = new ChartDefinition_1.ChartDefinition();
        chartDef.title = chartTitle;
        chartDef.total = total;
        chartDef.chartType = 'PieChart';
        chartDef.id = "littlePieChart" + id;
        chartDef.url = url;
        chartDef.chartOptions = {
            height: window.innerHeight / 7,
            chartArea: { width: "95%", height: "95%" },
            legend: { position: 'none' },
            tooltip: { trigger: 'none' }
        };
        chartDef.chartData = chartData;
        chartDef.titleVisible = false;
        return chartDef;
    };
    PieChartList.prototype.addChartAt = function (chartData, chartTitle, total, url, at) {
        var chartDef = this.buildNewChartDef(chartData, chartTitle, total, url, at);
        this.charts[at] = chartDef;
    };
    PieChartList.prototype.clear = function () {
        this.charts = new Array();
    };
    return PieChartList;
}());
__decorate([
    core_1.Input('charts'),
    __metadata("design:type", Array)
], PieChartList.prototype, "charts", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], PieChartList.prototype, "onChartFocus", void 0);
PieChartList = __decorate([
    core_1.Component({
        selector: 'pie-chart-list',
        templateUrl: '/app/components/pie-chart-list/templates/pie-chart-list-template.html'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], PieChartList);
exports.PieChartList = PieChartList;
//# sourceMappingURL=PieChartList.js.map