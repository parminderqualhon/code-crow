import { Component, OnInit, ViewChild } from '@angular/core'
import { HintService } from '../../services/hint.service'
import { AddHintComponent } from './add-hint/add-hint.component'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { MatDialog } from '@angular/material/dialog'

@Component({
    selector: 'app-hints',
    templateUrl: './hints.component.html',
    styleUrls: ['./hints.component.scss']
})
export class HintsComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator
    @ViewChild(MatSort, { static: true }) sort: MatSort
    public displayedColumns: string[] = ['text', 'options']
    public dataSource: MatTableDataSource<any>
    public hints: any = []
    public filter: string

    public pageNumber: number = 0
    public pageLimit: number = 5
    public totalCount: number = 0

    constructor(private hintService: HintService, private dialog: MatDialog) {
        this.dataSource = new MatTableDataSource(this.hints)
    }

    async ngOnInit() {
        await this.loadPage()
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    async loadPage() {
        try {
            const { hints, total } = await this.hintService.getHints({
                searchQuery: this.filter,
                skip: this.pageNumber * this.pageLimit,
                limit: this.pageLimit
            })
            this.hints = hints
            this.dataSource = new MatTableDataSource(this.hints)
            this.totalCount = total
        } catch (err) {
            console.log(err)
        }
    }

    add() {
        const dialogRef = this.dialog.open(AddHintComponent, {
            width: '900px'
        })
        dialogRef.afterClosed().subscribe((data) => {
            this.loadPage()
        })
    }

    async delete(funFactId) {
        await this.hintService.deleteHint({ funFactId })
        this.loadPage()
    }

    public async applyFilter(filterValue: string) {
        this.filter = filterValue.trim().toLowerCase()
        this.pageNumber = 0
        await this.loadPage()
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage()
        }
    }

    public changePage($event) {
        this.pageLimit = $event.pageSize
        this.pageNumber = $event.pageIndex
        this.loadPage()
    }
}
