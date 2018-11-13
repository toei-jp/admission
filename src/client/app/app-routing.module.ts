/**
 * ルーティング
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './canActivates';
import { AdmissionComponent } from './components/pages/admission/admission.component';
import { BaseComponent } from './components/pages/base/base.component';
import { ErrorComponent } from './components/pages/error/error.component';
import { NotfoundComponent } from './components/pages/notfound/notfound.component';
import { ScheduleComponent } from './components/pages/schedule/schedule.component';
import { authRoute } from './routes';

const appRoutes: Routes = [
    { path: '', redirectTo: '/auth', pathMatch: 'full' },
    authRoute,
    {
        path: '',
        component: BaseComponent,
        children: [
            { path: 'schedule', canActivate: [AuthGuardService], component: ScheduleComponent },
            { path: 'admission', canActivate: [AuthGuardService], component: AdmissionComponent },
            { path: 'error', component: ErrorComponent },
            { path: '**', component: NotfoundComponent }
        ]
    }
];

// tslint:disable-next-line:no-stateless-class
@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            { useHash: true, enableTracing: true }
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
