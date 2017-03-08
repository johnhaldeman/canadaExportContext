
import {ChartOptionsInterface} from './ChartOptionsInterface';

export class ChartDefinition{
  public id: string;
  public chartType: string;
  public chartData: Object[];
  public chartOptions: ChartOptionsInterface;
  public titleVisible: boolean;
  public title: string;
  public total: number;
}
