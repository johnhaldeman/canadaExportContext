import {Component, ViewChild} from '@angular/core';
import {MainPieChart} from '../main-pie-chart/main-pie-chart';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExportProportionService} from '../../services/export_proportions.service'
import {ExportYearsService} from '../../services/export_years.service'
import {PieChartList} from '../pie-chart-list/PieChartList'
import {ChartDefinition} from '../chart-definition/ChartDefinition'

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

  constructor(private exportPropService: ExportProportionService,
    private exportYearsService: ExportYearsService) {
    this.totalVal = 0;
    this.grandTotalVal = 1;
    this.currentYear = '2016';
  }

  onYearSliderChange(event){
    if(event.value != this.currentYear){
      this.currentYear = event.value;
      this.chartList.clear();
      this.getHS2Data();
    }
  }


  ngOnInit() {
    this.getHS2Data();
    this.getYearData()
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
    this.chartList.addChart(this.mainPieChartData, this.title, this.totalVal);
      this.mainPieChartData = data.data;
      this.title = data.title;
      this.totalVal = data.total;
  }

  processError(error){
      return error =>  this.errorMessage = <any>error;
  }

  onNewChartFocus(chart: ChartDefinition){
      this.mainPieChartData = chart.chartData;
      this.title = chart.title;
      this.totalVal = chart.total;
  }

  onMainChartSelected(selected){
      console.log('User Selected: component' + JSON.stringify(selected));
      if(selected[0]){
        let url = this.mainPieChartData[selected[0].row + 1][4];
        if(url != ''){
          this.exportPropService.getPropData(url)
          .subscribe(
            data => this.processData(data),
            error => this.processError(error)
          );
        }
      }
  }
}
