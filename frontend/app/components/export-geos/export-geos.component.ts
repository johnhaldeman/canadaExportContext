import {Component, ViewChild} from '@angular/core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExportGeoService} from '../../services/export_geos.service'
import {ExportYearsService} from '../../services/export_years.service'
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {GoogleChart} from '../google-chart/google-chart'
declare var google:any;
declare var googleLoaded:any;

@Component({
  templateUrl: '/app/components/export-geos/templates/exportGeosTemplate.html'
})
export class ExportGeosComponent {
    private regions = [
        ["world", "World", "countries"],
        ["US", "US", "provinces"],
        ["002", "Africa", "countries"],
        ["150", "Europe", "countries"],
        ["005", "South America", "countries"],
        ["013", "Central America", "countries"],
        ["029", "Caribean", "countries"],
        ["142", "Asia", "countries"],
        ["009", "Oceania", "countries"]
    ];
    private data: any;
    private total: number;
    private grand_total: number;
    private year: string;
    private territory: string;
    public include_us: boolean;
    private errorMessage: string;
    private ids: number[];
    @ViewChild(GoogleChart) chart: GoogleChart;
    private id = 'geochart1';
    private chartType = 'GeoChart';
    private currentURL: string;
    private hs_category: string;
    private hs_level: string;

    constructor(private exportPropService: ExportGeoService,
      private exportYearsService: ExportYearsService,
      private router: Router,
      private route: ActivatedRoute
    ) {

      this.include_us = true;
      this.territory = 'World';
      this.year = '2016';
      this.total = 0;
      this.grand_total = 0;

      router.events.subscribe((event: NavigationEnd) => {

        if(this.route.snapshot.params['url'] != this.currentURL){
          this.currentURL = this.route.snapshot.params['url'];
          this.redrawOnNavigation();
        }
      });
    }

    redrawOnNavigation(){
        if(this.route.snapshot.params['url']){
          this.redrawGraph();
        }
        else{
          console.log('renavigating');
          this.router.navigate(["geos", "ExportGeos?territory=World&year=2015&include_us=true"]);
        }
    }

    ngOnInit() {
      this.redrawOnNavigation();
    }

    //ngAfterViewInit(){
    redrawGraph(){
      if(!googleLoaded) {
        googleLoaded = true;
        google.charts.load('upcoming', {'packages':['geochart']});
      }
      google.charts.setOnLoadCallback(() => {
        this.data = new google.visualization.DataTable();
        this.data.addColumn('string', 'Region');
        this.data.addColumn('number', 'ExportValue');
        this.data.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});

        this.getGeoData();
      });
    }

    onRegionSelected(event){
      console.log(event.value);
      let terr = 'World';
      for(let i = 0; i < this.regions.length; i++){
        if(this.regions[i][0] == event.value){
          terr = this.regions[i][1];
        }
      }

      let newURL = "ExportGeos?territory=" + terr
              + "&year=" + this.year + "&include_us=" + this.include_us;
      if(this.hs_level != 'ALL'){
        newURL += "&hs_level=" + this.hs_level + "&hs_category=" + this.hs_category;
      }
      this.test = newURL;
      this.router.navigate(["geos", newURL]);
    }

    switchRegion(value){
      for(let i = 0; i < this.regions.length; i++){
        if(this.regions[i][1] == value){
            this.chartOptions.region = this.regions[i][0];
            this.chartOptions.resolution = this.regions[i][2];
            this.territory = this.regions[i][1];
        }
      }
      this.test = value;
    }

    onYearSliderChange(event){
      if(event.value != this.year){
        let newURL = "ExportGeos?territory=" + this.territory
                + "&year=" + event.value + "&include_us=" + this.include_us;
        this.test = newURL;
        this.router.navigate(["geos", newURL]);
      }
    }

    includeUSChanged(event){
      let newURL = "ExportGeos?territory=" + this.territory
              + "&year=" + this.year + "&include_us=" + event.checked;
      this.test = newURL;
      this.router.navigate(["geos", newURL]);
      this.getGeoData();
    }

    onCountrySelected(event){
      let row = event[0].row;
    }

    reformatDataToHTML(data: Object[], ids: Object[]){
      let retArray = new Array(data.length);
      for(let i = 0; i < data.length; i++){
        retArray[i] = new Array(3);
        retArray[i][0] = data[i][0];
        retArray[i][1] = data[i][1];
        if(this.territory == 'US'){
          retArray[i][2] = this.getHTMLUSState(data[i][2], data[i][3], data[i][0]);
        }
        else
          retArray[i][2] = this.getHTML(data[i][2], data[i][3], data[i][4]);
      }
      return retArray;
    }

    getHTML(country: Object, valText: Object, id: Object) : string{
      let encodedLink = encodeURIComponent('ExportProportions?' +
        'year=' + this.year + '&offset=1&max=10&level=2&country='
        + id);

      let html = '<strong><u>' + country + '</u></strong></br>'
        + '<span style="white-space:nowrap">' + valText + '</span></br>'
        + '<a href="/proportions/'
              + encodedLink
        + '">View Products Exported</a>';
      return html;
    }

    getHTMLUSState(stateName: Object, valText: Object, stateCode: Object) : string{
      let encodedLink = encodeURIComponent('ExportProportions?' +
        'year=' + this.year + '&offset=1&max=10&level=2&us_state='
        + stateCode);

      let html = '<strong><u>' + stateName + '</u></strong></br>'
        + '<span style="white-space:nowrap">' + valText + '</span></br>'
        + '<a href="/proportions/'
              + encodedLink
        + '">View Products Exported</a>';
      return html;
    }

    getGeoData() {
      this.exportPropService.getGeoData(this.currentURL)
      .subscribe(
        geoData => {
          geoData.data.shift();
          this.data.removeRows(0, this.data.getNumberOfRows());
          this.territory = geoData.territory;
          this.data.addRows(this.reformatDataToHTML(geoData.data, geoData.ids));
          this.total = geoData.total;
          this.grand_total = geoData.grand_total;
          this.test = geoData.total + "";
          this.ids = geoData.ids;
          this.include_us = geoData.include_us == 'true';
          this.year = geoData.year;
          this.switchRegion(this.territory);
          if(geoData.hs_level == null){
            this.hs_level = 'ALL';
            this.hs_category = 'ALL';
          }
          else{
            this.hs_category = geoData.hs_category;
            this.hs_level = geoData.hs_level;
          }
        },
        error =>  this.errorMessage = <any>error);
    }

    private test = "";
    private chartOptions = {displayMode: 'regions'
        ,colorAxis: {colors: ['F5F3F3', '771111']}
        ,datalessRegionColor: 'FFFFFF'
        //,region: "009"
        ,resolution: 'countries'
        ,region: "world"
        ,height: window.innerHeight / 1.5
        ,width: window.innerWidth
        ,tooltip: { isHtml: true, trigger: 'selection' }
    };




}
