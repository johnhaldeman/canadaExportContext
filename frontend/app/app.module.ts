import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, JsonpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { ExportProportionsComponent }   from './components/export-proportions/export-proportions.component';
import { AppComponent }   from './app.component';
import { GoogleChart } from './components/google-chart/google-chart';
import { MainPieChart } from './components/main-pie-chart/main-pie-chart';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ExportProportionService } from './services/export_proportions.service';
import { ExportYearsService } from './services/export_years.service';
import { ExportGeoService } from './services/export_geos.service';
import { PieChartList } from './components/pie-chart-list/PieChartList';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AboutComponent } from './components/about-component/about-component';
import { HomeComponent } from './components/home/home-component';
import { ExportGeosComponent } from './components/export-geos/export-geos.component';
import { MaterialModule } from '@angular/material';
import 'hammerjs';

const appRoutes: Routes = [
  { path: 'proportions', component: ExportProportionsComponent },
  { path: 'proportions/:url', component: ExportProportionsComponent },
  { path: 'geos', component: ExportGeosComponent },
  { path: 'geos/:url', component: ExportGeosComponent },
  { path: 'about', component: AboutComponent },
  { path: '', component: HomeComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports:      [ BrowserModule, HttpModule, JsonpModule, NgbModule.forRoot(), RouterModule.forRoot(appRoutes), MaterialModule],
  declarations: [ AppComponent, ExportProportionsComponent, GoogleChart,
                  MainPieChart, PieChartList, AboutComponent, ExportGeosComponent,
                  HomeComponent ],
  bootstrap:    [ AppComponent ],
  schemas:      [ NO_ERRORS_SCHEMA ],
  providers:    [ ExportProportionService, ExportYearsService, ExportGeoService ]
})
export class AppModule { }
