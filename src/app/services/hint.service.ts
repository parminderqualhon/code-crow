import { HttpClient } from '@angular/common/http'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
//TODO: change client side code naming of Hint to funFact
@Injectable({
    providedIn: 'root'
})
export class HintService {
    constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

    createHint({ funFactText }): Promise<any> {
        return this.http.put(`${environment.apiUrl}/fun-facts`, { funFactText }).toPromise()
    }

    deleteHint({ funFactId }): Promise<any> {
        return this.http
            .delete(`${environment.apiUrl}/fun-facts?funFactId=${funFactId}`, {})
            .toPromise()
    }

    getRandomHint(): Promise<any> {
        return this.http.get(`${environment.apiUrl}/fun-facts/random`, {}).toPromise()
    }

    async getHints({ searchQuery, skip, limit }) {
        const hintsWithCount = await this.http
            .get(`${environment.apiUrl}/fun-facts`, {
                params: { searchQuery, skip, limit }
            })
            .toPromise()
        if (!hintsWithCount || !hintsWithCount['total']) {
            if (searchQuery)
                this.snackBar.open('No results with the search criteria', null, {
                    duration: 2000
                })
        }
        return {
            hints: hintsWithCount['hints'],
            total: hintsWithCount['total']
        }
    }
}
