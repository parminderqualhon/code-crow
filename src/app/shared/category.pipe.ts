import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'category' })
export class CategoryPipe implements PipeTransform {
    transform(categories: any, searchText: any): any {
        if (searchText == null || !searchText || searchText === '') {
            return categories
        }

        return categories.filter(function (category) {
            return category.item_text.toLowerCase().indexOf(searchText) > -1
        })
    }
}
