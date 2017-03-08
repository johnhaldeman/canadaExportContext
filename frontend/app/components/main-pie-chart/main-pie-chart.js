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
var MainPieChart = (function () {
    function MainPieChart(element) {
        this.element = element;
        this.onSelected = new core_1.EventEmitter();
        this.test = 0;
        this.header = 'Loading...';
        this.chartDef = new ChartDefinition_1.ChartDefinition();
        this.chartDef.id = "mainPieChart";
        this.chartDef.chartType = 'PieChart';
        this.chartDef.chartData = this.chartData;
        this.chartDef.chartOptions = {
            height: window.innerHeight / 2.5,
            chartArea: { width: "90%", height: "90%" },
            legend: { position: 'right' },
            tooltip: { trigger: 'focus' }
        };
    }
    MainPieChart.prototype.onChildSelected = function (selected) {
        this.onSelected.emit(selected);
    };
    MainPieChart.prototype.onResize = function (event) {
        //this.chartOptions.height = event.target.innerWidth / heightRatio;
        this.chartDef.chartOptions.height = window.innerHeight / 2.5;
        this.test = window.innerHeight / 2;
    };
    return MainPieChart;
}());
__decorate([
    core_1.Input('header'),
    __metadata("design:type", String)
], MainPieChart.prototype, "header", void 0);
__decorate([
    core_1.Input('chartDefinition'),
    __metadata("design:type", ChartDefinition_1.ChartDefinition)
], MainPieChart.prototype, "chartDef", void 0);
__decorate([
    core_1.Input('chartData'),
    __metadata("design:type", Object)
], MainPieChart.prototype, "chartData", void 0);
__decorate([
    core_1.Output('onSelected'),
    __metadata("design:type", Object)
], MainPieChart.prototype, "onSelected", void 0);
__decorate([
    core_1.HostListener('window:resize', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MainPieChart.prototype, "onResize", null);
MainPieChart = __decorate([
    core_1.Component({
        selector: 'main-pie-chart',
        templateUrl: '/app/components/main-pie-chart/templates/main-pie-chart-template.html'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], MainPieChart);
exports.MainPieChart = MainPieChart;
//# sourceMappingURL=main-pie-chart.js.map