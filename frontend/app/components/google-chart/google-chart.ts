import {Directive,ElementRef,Input,Output,EventEmitter,OnInit,OnChanges,HostListener} from '@angular/core';
import {ChartActionInterface} from '../chart-definition/ChartActionInterface';
declare var google:any;
declare var googleLoaded:any;
@Directive({
  selector: '[GoogleChart]'
})
export class GoogleChart implements OnChanges  {
  public _element:any;
  @Input('chartType') public chartType: string;
  @Input('chartOptions') public chartOptions: Object;
  @Input('chartData') public chartData: Object;
  @Input('test') public test:number;
  @Input('actions') public actions: ChartActionInterface[];
  @Output() onSelected = new EventEmitter();
  public wrapper: any;

  constructor(public element: ElementRef) {
    this._element = this.element.nativeElement;
  }

  ngOnChanges(){
    if(this._element.id){
      console.log('change');
      if(!googleLoaded) {
        googleLoaded = true;
        google.charts.load('upcoming', {'packages':['geochart']});
      }
      this.drawGraphNoParams();
    }
  }

  ngAfterViewInit(){
    if(this._element.id){
      if(!googleLoaded) {
        googleLoaded = true;
        google.charts.load('upcoming', {'packages':['geochart']});
      }
      this.drawGraphNoParams();
    }
  }

  drawGraphNoParams(){
    this.drawGraph(this.chartOptions,this.chartType,this.chartData,this._element,this.onSelected,this.actions);
  }

  drawGraph (chartOptions,chartType,chartData,ele,onSelected,actions) {

      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        let wrapper = new google.visualization.ChartWrapper({
               chartType: chartType,
               dataTable:chartData ,
               options:chartOptions || {},
               containerId: ele.id
        });

        google.visualization.events.addListener(wrapper, 'select', function(){
            onSelected.emit(wrapper.getChart().getSelection())
        });

        function regActions() {
          if(actions != undefined){
            for(let i = 0; i < actions.length; i++){
              if(actions[i].enabled){
                wrapper.getChart().setAction({
                  id: actions[i].id,
                  text: actions[i].text,
                  action: actions[i].action(wrapper.getChart())
                });
              }
            }
          }
        }

        google.visualization.events.addListener(wrapper, 'ready', regActions);

        wrapper.draw();

    }
  }
}
