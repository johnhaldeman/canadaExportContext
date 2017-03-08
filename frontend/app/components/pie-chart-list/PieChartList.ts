import {Component,ElementRef,Input,Output,EventEmitter,HostListener} from '@angular/core';
import {GoogleChart} from '../google-chart/google-chart';
import {ChartDefinition} from '../chart-definition/ChartDefinition';

@Component({
  selector: 'pie-chart-list',
  templateUrl: '/app/components/pie-chart-list/templates/pie-chart-list-template.html'
})
export class PieChartList{
  @Input('charts') public charts:ChartDefinition[];
  @Output() onChartFocus = new EventEmitter();


  constructor(public element: ElementRef) {
    this.charts = new Array<ChartDefinition>();
  }

  private focusChart(index){
    this.onChartFocus.emit(this.charts[index]);
    this.charts = this.charts.slice(0, index);
  }

  public addChart(chartData: Object[], chartTitle: string, total: number){
    let chartDef = new ChartDefinition();
    chartDef.title = chartTitle;
    chartDef.total = total;
    chartDef.chartType = 'PieChart';
    chartDef.id = "littlePieChart" + this.charts.length;
    chartDef.chartOptions =  {
      height: window.innerHeight / 7,
      chartArea:{width:"95%",height:"95%"},
      legend: {position: 'none'},
      tooltip: { trigger: 'none' }
    };
    chartDef.chartData = chartData;
    chartDef.titleVisible = false;

    this.charts.push(chartDef);
  }

  public clear(){
    this.charts = new Array<ChartDefinition>();
  }
}
