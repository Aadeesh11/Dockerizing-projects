import { environment } from './../environments/environment';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AppService {

  constructor(private http: Http) { }

  /**
   * callHello
   */
  public callHello() {
    return this.http.get(environment.apiUrl + 'hello')
      .map(resp => resp.json())
      .toPromise();
  }
}
