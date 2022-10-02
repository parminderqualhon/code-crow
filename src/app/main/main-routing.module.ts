import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LoginWrapperComponent } from './login-wrapper/login-wrapper.component'
import { MainComponent } from './main.component'

const routes: Routes = [
    // {
    //   path : '',
    //   loadChildren : ()=>import('../pages/home/home.module').then(m=>m.HomeModule)
    // }
    {
        path: '',
        component: MainComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('../pages/home/home.module').then((m) => m.HomeModule)
            }
        ]
    },
    {
        path: 'login',
        component: LoginWrapperComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainRoutingModule {}
