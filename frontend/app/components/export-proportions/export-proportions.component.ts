import {Component, ViewChild} from '@angular/core';
import {MainPieChart} from '../main-pie-chart/main-pie-chart';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExportProportionService} from '../../services/export_proportions.service'
import {ExportYearsService} from '../../services/export_years.service'
import {PieChartList} from '../pie-chart-list/PieChartList'
import {ChartDefinition} from '../chart-definition/ChartDefinition'
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
  //selector: 'trade-app',
  templateUrl: '/app/components/export-proportions/templates/exportProportionsTemplate.html'
})
export class ExportProportionsComponent {
  @ViewChild(PieChartList) chartList: PieChartList;
  private mainPieChartData = [];
  private years: string[];
  private title: string;
  private errorMessage: string;
  private totalVal: number;
  private grandTotalVal: number;
  private currentYear: string;
  private routeEventID: number;
  private currentURL: string;

  constructor(private exportPropService: ExportProportionService,
    private exportYearsService: ExportYearsService,
      private route: ActivatedRoute,
      private router: Router) {
    this.totalVal = 0;
    this.grandTotalVal = 1;
    this.currentYear = '2016';

    router.events.subscribe((event: NavigationEnd) => {
      console.log("event");
      if(this.route.snapshot.params['url'] != this.currentURL){
        console.log("url change");
        this.currentURL = this.route.snapshot.params['url'];
        this.redrawOnNavigation();
      }
    });
  }

  onYearSliderChange(event){
    if(event.value != this.currentYear){
      let yearIndex = this.currentURL.indexOf("year=");
      let newURL = this.currentURL.substr(0, yearIndex + 5);
      newURL += event.value;
      newURL += this.currentURL.substr(yearIndex + 9);
      //console.log('slider event triggered');
      //this.chartList.clear();
      //this.router.navigate(['proportions', event.value]);
      this.router.navigate(["proportions", newURL]);
    }
  }


  ngOnInit() {
    this.redrawOnNavigation();
    this.getYearData();
  }

  redrawOnNavigation(){
    if(this.route.snapshot.params['url']){
      this.exportPropService.getPropData(this.route.snapshot.params['url'])
      .subscribe(
        data => this.processData(data),
        error => this.processError(error)
      );
    }
    else{
      this.router.navigate(["proportions", "ExportProportions?year=2016&offset=1&max=10&level=2"])
    }
  }

  getYearData(){
    this.exportYearsService.getYearData()
      .subscribe(
        yearData => {
          this.years = yearData;
        },
        error =>  this.errorMessage = <any>error
      );
  }

  getHS2Data() {
    this.exportPropService.getHS2Data(this.currentYear, 1, 10)
    .subscribe(
      hs2Data => {
        this.mainPieChartData = hs2Data.data;
        this.title = hs2Data.title;
        this.totalVal = hs2Data.total;
        this.grandTotalVal = hs2Data.total;
      },
      error =>  this.errorMessage = <any>error);
  }

  processData(data) {
    //this.chartList.addChart(this.mainPieChartData, this.title, this.totalVal, this.route.snapshot.params['url']);

    if(data.url_history != undefined){
      this.chartList.clearLength(data.url_history.length);

      for(let i = 0; i < data.url_history.length; i++){
        this.exportPropService.getPropData(data.url_history[i])
        .subscribe(
          histData => this.processHistoryData(histData, i, data.url_history[i]),
          error => this.processError(error)
        );
      }
    }

    this.mainPieChartData = data.data;
    this.title = data.title;
    this.totalVal = data.total;
  }

  processHistoryData(data, index, url){
    console.log("processing: " + url);
    this.chartList.addChartAt(data.data, data.title, data.total, url, index);
  }

  processError(error){
      return error =>  this.errorMessage = <any>error;
  }

  onNewChartFocus(chart: ChartDefinition){
      this.mainPieChartData = chart.chartData;
      this.title = chart.title;
      this.totalVal = chart.total;
      this.router.navigate(["proportions", chart.url]);
  }

  onMainChartSelected(selected){
      if(selected[0]){
        let url = this.mainPieChartData[selected[0].row + 1][4];
        if(url != ''){
          this.router.navigate(["proportions", url]);
        }
      }
  }
}
