"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var http_1 = require("@angular/http");
var router_1 = require("@angular/router");
var export_proportions_component_1 = require("./components/export-proportions/export-proportions.component");
var app_component_1 = require("./app.component");
var google_chart_1 = require("./components/google-chart/google-chart");
var main_pie_chart_1 = require("./components/main-pie-chart/main-pie-chart");
var core_2 = require("@angular/core");
var export_proportions_service_1 = require("./services/export_proportions.service");
var export_years_service_1 = require("./services/export_years.service");
var export_geos_service_1 = require("./services/export_geos.service");
var PieChartList_1 = require("./components/pie-chart-list/PieChartList");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var about_component_1 = require("./components/about-component/about-component");
var export_geos_component_1 = require("./components/export-geos/export-geos.component");
var material_1 = require("@angular/material");
require("hammerjs");
var appRoutes = [
    { path: 'proportions', component: export_proportions_component_1.ExportProportionsComponent },
    { path: 'geos', component: export_geos_component_1.ExportGeosComponent },
    { path: 'about', component: about_component_1.AboutComponent },
    { path: '**', component: export_proportions_component_1.ExportProportionsComponent }
];
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        imports: [platform_browser_1.BrowserModule, http_1.HttpModule, http_1.JsonpModule, ng_bootstrap_1.NgbModule.forRoot(), router_1.RouterModule.forRoot(appRoutes), material_1.MaterialModule],
        declarations: [app_component_1.AppComponent, export_proportions_component_1.ExportProportionsComponent, google_chart_1.GoogleChart, main_pie_chart_1.MainPieChart, PieChartList_1.PieChartList, about_component_1.AboutComponent, export_geos_component_1.ExportGeosComponent],
        bootstrap: [app_component_1.AppComponent],
        schemas: [core_2.NO_ERRORS_SCHEMA],
        providers: [export_proportions_service_1.ExportProportionService, export_years_service_1.ExportYearsService, export_geos_service_1.ExportGeoService]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map