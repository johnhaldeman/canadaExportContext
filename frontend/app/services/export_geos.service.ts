import { Injectable } from '@angular/core';
import { Http, Response} from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export class ExportGeoData{
  data: Object[];
  total: number;
  grand_total: number;
}

@Injectable()
export class ExportGeoService {

  private url = '/services/ExportGeos';
  constructor(private http: Http) { }

  getYearData(): Observable<string[]>{
    return this.http.get(this.url)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  getGeoData(year: string, territory: string, include_us: boolean): Observable<ExportGeoData> {
    let url = `${this.url}?year=${year}&territory=${territory}&include_us=${include_us}`;
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
