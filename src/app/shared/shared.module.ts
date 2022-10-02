import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
// import { ChartsModule } from 'ng2-charts'

import { MatBadgeModule } from '@angular/material/badge'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTreeModule } from '@angular/material/tree'
import { MatTooltipModule } from '@angular/material/tooltip'

import { DragDropModule } from '@angular/cdk/drag-drop'
import { LazyImgDirective } from '../directives/lazy-img.directive'
import { CategoryPipe } from './category.pipe'
import { UserAvatarComponent } from '../controls/user-avatar/user-avatar.component'
import { ClickOutsideDirective } from '../directives/click-outside.directive'

@NgModule({
    imports: [
        CommonModule,
        MatToolbarModule,
        MatMenuModule,
        MatTabsModule,
        MatDividerModule,
        MatCardModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        MatDialogModule,
        MatInputModule,
        MatSnackBarModule,
        FormsModule,
        ReactiveFormsModule,
        MatSidenavModule,
        MatTreeModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        DragDropModule,
        // ChartsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatBadgeModule,
        MatTooltipModule
    ],
    exports: [
        MatToolbarModule,
        MatMenuModule,
        MatTabsModule,
        MatDividerModule,
        MatCardModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        MatDialogModule,
        MatInputModule,
        MatSnackBarModule,
        FormsModule,
        ReactiveFormsModule,
        MatSidenavModule,
        MatTreeModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        DragDropModule,
        // ChartsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatBadgeModule,
        MatTooltipModule,
        LazyImgDirective,
        CategoryPipe,
        UserAvatarComponent,
        ClickOutsideDirective
    ],
    declarations: [LazyImgDirective, CategoryPipe, UserAvatarComponent, ClickOutsideDirective]
})
export class SharedModule {}
