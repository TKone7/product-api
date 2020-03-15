import { environment } from './../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class DummyDataService extends DataService<any> {
  constructor(http: HttpClient) {
    super(environment.baseUrl + '/dummy', http);
  }
}
