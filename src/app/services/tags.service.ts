import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class TagsService {
    constructor(public http: HttpClient) {}

    createTag({ name, isAllowed }): Promise<any> {
        return this.http.put(`${environment.apiUrl}/tags`, { name, isAllowed }).toPromise()
    }

    getTags(): Promise<any> {
        return this.http.get(`${environment.apiUrl}/tags`).toPromise()
    }
}
