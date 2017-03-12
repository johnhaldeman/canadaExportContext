import { Injectable } from '@angular/core';
import { Http, Response} from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export class ExportProportionData{
  title: string;
  data: Object[];
  total: number;
}

@Injectable()
export class ExportProportionService {
  private expPrefix = '/services/';
  private expContextURL = this.expPrefix + 'ExportProportions';  // URL to web api

  constructor(private http: Http) { }

  getPropData(resource: string){
    let url = this.expPrefix + resource;
    return this.http.get(url)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  getHS2Data(year: string, offset: number, max: number): Observable<ExportProportionData> {
    let url = `${this.expContextURL}?year=${year}&offset=${offset}&max=${max}&level=2`;
    return this.http.get(url)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  private extractData(res: Response) {
      let body = res.json();
      return body || { };
  }


  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

}
