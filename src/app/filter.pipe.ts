import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(list: any[], searchTitle: string | null): any[] {
        if (searchTitle) {
            return list.filter((item) => {
                const regex = new RegExp(searchTitle, 'gi')
                const channelName = item.friendlyName
                const videoTitle = item.title
                const videoAuthor = item.auther
                const friendName = item.name
                const displayName = item.displayName
                if (
                    (channelName !== undefined && channelName.match(regex)) ||
                    (videoTitle !== undefined && videoTitle.match(regex)) ||
                    (videoAuthor !== undefined && videoAuthor.match(regex)) ||
                    (friendName !== undefined && friendName.match(regex)) ||
                    (displayName !== undefined && displayName.match(regex))
                ) {
                    return true
                } else {
                    return false
                }
            })
        } else {
            return list
        }
    }
}
