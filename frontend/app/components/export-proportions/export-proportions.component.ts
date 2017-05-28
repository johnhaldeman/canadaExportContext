import {Component, ViewChild} from '@angular/core';
import {MainPieChart} from '../main-pie-chart/main-pie-chart';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExportProportionService} from '../../services/export_proportions.service'
import {ExportYearsService} from '../../services/export_years.service'
import {PieChartList} from '../pie-chart-list/PieChartList'
import {ChartDefinition} from '../chart-definition/ChartDefinition'
import {ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {ChartActionInterface} from '../chart-definition/ChartActionInterface';
declare var google:any;
declare var googleLoaded:any;

@Component({
  //selector: 'trade-app',
  templateUrl: '/app/components/export-proportions/templates/exportProportionsTemplate.html'
})
export class ExportProportionsComponent {
  @ViewChild(PieChartList) chartList: PieChartList;
  //private mainPieChartData = [];
  private data: any;
  private years: string[];
  private title: string;
  private errorMessage: string;
  private totalVal: number;
  private grandTotalVal: number;
  private currentYear: string;
  private routeEventID: number;
  private currentURL: string;
  private country: string;
  public actions: ChartActionInterface[];

  constructor(private exportPropService: ExportProportionService,
    private exportYearsService: ExportYearsService,
      private route: ActivatedRoute,
      private router: Router) {
    this.totalVal = 0;
    this.grandTotalVal = 1;
    this.currentYear = '2016';
    this.country = "Loading....";

    router.events.subscribe((event: NavigationEnd) => {
      if(this.route.snapshot.params['url'] != this.currentURL){
        this.currentURL = this.route.snapshot.params['url'];

        let yearIndex = this.currentURL.indexOf("year=");
        this.currentYear = this.currentURL.substr(yearIndex + 5, 4);

        this.redrawOnNavigation();
      }
    });
  }

  onYearSliderChange(event){
    if(event.value != this.currentYear){
      this.currentYear = event.value;
      let yearIndex = this.currentURL.indexOf("year=");
      let newURL = this.currentURL.substr(0, yearIndex + 5);
      newURL += event.value;
      newURL += this.currentURL.substr(yearIndex + 9);
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

  processData(data) {
    if(data.url_history != undefined){
      this.chartList.chopList(data.url_history.length);

      for(let i = 0; i < data.url_history.length; i++){
        if(!this.chartList.isLoaded(i, data.url_history[i])){
          this.exportPropService.getPropData(data.url_history[i])
          .subscribe(
            histData => this.processHistoryData(histData, i, data.url_history[i]),
            error => this.processError(error)
          );
        }
        else if(i == 0){
          this.grandTotalVal = this.chartList.charts[i].total;
        }
      }
    }
    else{
      this.chartList.clear();
      this.grandTotalVal = data.total;
    }

    //data.data.shift();
    //this.data.removeRows(0, this.data.getNumberOfRows());
    this.data = data.data;

    if(this.data[1][4] == ''){
      console.log('end of the line');
      this.drillAction.enabled = false;
    }

    this.title = data.title;
    this.totalVal = data.total;
    this.country = data.country;

    this.actions = this.getActionClosures();
  }

  reformatDataToHTML(data: Object[]){
      let retArray = new Array(data.length);
      for(let i = 0; i < data.length; i++){
        retArray[i] = new Array(3);
        retArray[i][0] = data[i][0];
        retArray[i][1] = data[i][1];
        //retArray[i][2] = this.getHTML(data[i][0], data[i][1]);
      }
      return retArray;
  }

  getHTML(product: Object, valText: Object) : string{
    let encodedLink = encodeURIComponent('ExportGeos?' +
      'year=' + this.currentYear + '&territory=World&include_us=true' +
      '&hs_level=2&hs_category=Pharmaceutical products');

    let html = '<strong><u>' + product + '</u></strong></br>'
      + '<span style="white-space:nowrap">' + valText + '</span></br>'
      + '<a href="/proportions/'
            + encodedLink
      + '">View Products Exported</a>';
    return html;
  }

  processHistoryData(data, index, url){
    this.chartList.addChartAt(data.data, data.title, data.total, url, index);
  }

  processError(error){
      return error =>  this.errorMessage = <any>error;
  }

  onNewChartFocus(chart: ChartDefinition){
      this.data = chart.chartData;
      this.title = chart.title;
      this.totalVal = chart.total;
      this.router.navigate(["proportions", chart.url]);
  }

  getActionClosures(){

    function getGeoClosure(data, router){
      return function(chart){
        return function(){
          let row = chart.getSelection()[0].row;
          let url = data[row + 1][5];
          router.navigate(["geos", url]);
        }
      }
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
  }

  getDrillClosure(data, router){
    return function(chart){
      return function(){
        let row = chart.getSelection()[0].row;
        let url = data[row + 1][4];
        router.navigate(["proportions", url]);
      }
    }
  };

  private drillAction = {
    id: 'drillDown',
    text: 'Click to Zoom to Subcategories',
    action: null,
    enabled: true
  }

  /*onMainChartSelected(selected){
      if(selected[0]){
        let url = this.mainPieChartData[selected[0].row + 1][4];
        if(url != ''){
          this.router.navigate(["proportions", url]);
        }
      }
  }*/
}
