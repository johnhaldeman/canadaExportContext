import {Component, ViewChild} from '@angular/core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExportGeoService} from '../../services/export_geos.service'
import {ExportYearsService} from '../../services/export_years.service'
import {Router } from '@angular/router';
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

    constructor(private exportPropService: ExportGeoService,
      private exportYearsService: ExportYearsService,
      private router: Router) {

      this.include_us = true;
      this.territory = 'World';
      this.year = '2015';
      this.total = 0;
      this.grand_total = 0;
    }

    ngAfterViewInit(){
      if(!googleLoaded) {
        googleLoaded = true;
        google.charts.load('upcoming', {'packages':['geochart']});
      }
      google.charts.setOnLoadCallback(() => {
        this.data = new google.visualization.DataTable();
        this.data.addColumn('string', 'Region');
        this.data.addColumn('number', 'ExportValue');
        this.data.addColumn({type: 'string', role: 'tooltip'});
        this.getGeoData();
      });
    }

    getGeoData() {
      this.exportPropService.getGeoData(this.year, this.territory, this.include_us)
      .subscribe(
        geoData => {
          geoData.data.shift();
          this.data.removeRows(0, this.data.getNumberOfRows());
          this.data.addRows(geoData.data);
          this.total = geoData.total;
          this.grand_total = geoData.grand_total;
          this.test = geoData.total + "";
          this.ids = geoData.ids;
        },
        error =>  this.errorMessage = <any>error);
    }

    includeUSChanged(event){
      this.include_us = event.checked;
      this.getGeoData();
    }

    onRegionSelected(event){
      this.chartOptions.region = event.value;
      console.log(event.value);

      for(let i = 0; i < this.regions.length; i++){
        if(this.regions[i][0] == event.value){
            this.chartOptions.resolution = this.regions[i][2];
            this.territory = this.regions[i][1];
            console.log(this.regions[i]);
        }
      }
      this.test = event.value;
      this.getGeoData();

    }

    onYearSliderChange(event){
      if(event.value != this.year){
        this.year = event.value;
        this.test = event.value;
        this.getGeoData();
      }
    }

    onCountrySelected(event){
      let row = event[0].row;
      this.router.navigate(["proportions", "ExportProportions?year=" + this.year + "&offset=1&max=10&level=2&country=" + this.ids[row]]);
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
    };

    private id = 'geochart1';

    private chartType = 'GeoChart';

}
