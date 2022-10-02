import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class FollowService {
    constructor(public http: HttpClient) {}

    /**
     * @param source1 person you want to follow
     * @param source2 your user id
     */
    createFollow({ source1, source2 }): Promise<any> {
        return this.http.put(`${environment.apiUrl}/follow`, { source1, source2 }).toPromise()
    }

    getFollows({ source, sourceType, searchQuery, skip, limit }): Promise<any> {
        return this.http
            .get(`${environment.apiUrl}/follow`, {
                params: { source, sourceType, searchQuery, skip, limit }
            })
            .toPromise()
    }

    getFollowCount({ source, sourceType }): Promise<any> {
        return this.http
            .get(`${environment.apiUrl}/follow/count`, {
                params: { source, sourceType }
            })
            .toPromise()
    }

    deleteFollow({ source1, source2 }): Promise<any> {
        return this.http
            .delete(`${environment.apiUrl}/follow`, { params: { source1, source2 } })
            .toPromise()
    }

    getFollowRelationship({ source }): Promise<any> {
        return this.http
            .get(`${environment.apiUrl}/follow/relationship`, { params: { source } })
            .toPromise()
    }
}
