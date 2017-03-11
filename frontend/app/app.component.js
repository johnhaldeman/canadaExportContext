"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var AppComponent = (function () {
    function AppComponent() {
    }
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'trade-app',
        template: "\n    <nav class=\"navbar navbar-dark bg-inverse\">\n      <!-- <div class=\"container-fluid\"> -->\n        <!-- Brand and toggle get grouped for better mobile display -->\n        <a class=\"navbar-brand\" routerLink=\"/\"><i class=\"fa fa-exchange\" aria-hidden=\"true\"></i>&nbsp; Canadian Trade in Context</a>\n\n        <!-- Collect the nav links, forms, and other content for toggling -->\n        <!-- <div class=\"collapse navbar-collapse\" id=\"bs-example-navbar-collapse-1\">-->\n          <ul class=\"nav navbar-nav\">\n            <li class=\"nav-item\" routerLinkActive=\"active\"><a class=\"nav-link\" routerLink=\"/proportions\"><i class=\"fa fa-tint\" aria-hidden=\"true\"></i>&nbsp;Products</a></li>\n            <li class=\"nav-item\" routerLinkActive=\"active\"><a class=\"nav-link\" routerLink=\"/geos\"><i class=\"fa fa-globe\" aria-hidden=\"true\"></i>&nbsp;Partners</a></li>\n            <!-- <li class=\"nav-item\"><a class=\"nav-link\"><i class=\"fa fa-line-chart\" aria-hidden=\"true\"></i>&nbsp;Trends</a></li>\n            <li class=\"nav-item\"><a class=\"nav-link\"><i class=\"fa fa-object-ungroup\" aria-hidden=\"true\"></i>&nbsp;Compare</a></li> -->\n          </ul>\n          <ul class=\"nav navbar-nav float-xs-right\">\n            <!-- <li class=\"nav-item\"><a class=\"nav-link\"><i class=\"fa fa-file-text\" aria-hidden=\"true\"></i>&nbsp;Analysis</a></li> -->\n            <li class=\"nav-item\" routerLinkActive=\"active\"><a href=\"#\" class=\"nav-link\" routerLink=\"/about\"><i class=\"fa fa-info-circle\" aria-hidden=\"true\"></i>&nbsp;About</a></li>\n          </ul>\n        <!-- </div>--><!-- /.navbar-collapse -->\n      <!-- </div>--><!-- /.container-fluid -->\n    </nav>\n    <router-outlet></router-outlet>\n  "
    })
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map