import {Component,ElementRef,Input,Output,HostListener,EventEmitter} from '@angular/core';
import {GoogleChart} from '../google-chart/google-chart';
import {ChartDefinition} from '../chart-definition/ChartDefinition';
import {ChartActionInterface} from '../chart-definition/ChartActionInterface';

@Component({
  selector: 'main-pie-chart',
  templateUrl: '/app/components/main-pie-chart/templates/main-pie-chart-template.html'
})
export class MainPieChart{
    @Input('header') public header:string;
    @Input('chartDefinition') public chartDef: ChartDefinition;
    @Input('chartData') public chartData;
    @Input('actions') public actions: ChartActionInterface[];
    @Output('onSelected') public onSelected = new EventEmitter();
    public test: number;

    constructor(public element: ElementRef) {
      this.test = 0;

      this.header = 'Loading...';

      this.chartDef = new ChartDefinition();
      this.chartDef.id = "mainPieChart";
      this.chartDef.chartType = 'PieChart';

      this.chartDef.chartData  = this.chartData;

      this.chartDef.chartOptions =  {
          height: window.innerHeight / 2.5,
          chartArea:{width:"90%",height:"90%"},
          legend: {position: 'right'},
          tooltip: { isHtml: false, trigger: 'selection' }
      };
    }

    onChildSelected(selected){
       this.onSelected.emit(selected);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      //this.chartOptions.height = event.target.innerWidth / heightRatio;
      this.chartDef.chartOptions.height = window.innerHeight / 2.5;
      this.test = window.innerHeight / 2;
    }


}
