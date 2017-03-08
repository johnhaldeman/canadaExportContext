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
var GoogleChart = (function () {
    function GoogleChart(element) {
        this.element = element;
        this.onSelected = new core_1.EventEmitter();
        this._element = this.element.nativeElement;
    }
    GoogleChart.prototype.ngOnChanges = function () {
        if (this._element.id) {
            console.log('change');
            if (!googleLoaded) {
                googleLoaded = true;
                google.charts.load('upcoming', { 'packages': ['geochart'] });
            }
            this.drawGraphNoParams();
        }
    };
    GoogleChart.prototype.ngAfterViewInit = function () {
        if (this._element.id) {
            if (!googleLoaded) {
                googleLoaded = true;
                google.charts.load('upcoming', { 'packages': ['geochart'] });
            }
            this.drawGraphNoParams();
        }
    };
    GoogleChart.prototype.drawGraphNoParams = function () {
        this.drawGraph(this.chartOptions, this.chartType, this.chartData, this._element, this.onSelected);
    };
    GoogleChart.prototype.drawGraph = function (chartOptions, chartType, chartData, ele, onSelected) {
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {
            var wrapper;
            wrapper = new google.visualization.ChartWrapper({
                chartType: chartType,
                dataTable: chartData,
                options: chartOptions || {},
                containerId: ele.id
            });
            google.visualization.events.addListener(wrapper, 'select', function () {
                onSelected.emit(wrapper.getChart().getSelection());
            });
            wrapper.draw();
        }
    };
    return GoogleChart;
}());
__decorate([
    core_1.Input('chartType'),
    __metadata("design:type", String)
], GoogleChart.prototype, "chartType", void 0);
__decorate([
    core_1.Input('chartOptions'),
    __metadata("design:type", Object)
], GoogleChart.prototype, "chartOptions", void 0);
__decorate([
    core_1.Input('chartData'),
    __metadata("design:type", Object)
], GoogleChart.prototype, "chartData", void 0);
__decorate([
    core_1.Input('test'),
    __metadata("design:type", Number)
], GoogleChart.prototype, "test", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], GoogleChart.prototype, "onSelected", void 0);
GoogleChart = __decorate([
    core_1.Directive({
        selector: '[GoogleChart]'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], GoogleChart);
exports.GoogleChart = GoogleChart;
//# sourceMappingURL=google-chart.js.map