/**
 * NgModule
 */

// tslint:disable:no-submodule-imports max-line-length
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AdmissionComponent } from './components/pages/admission/admission.component';
import { AuthIndexComponent } from './components/pages/auth/auth-index/auth-index.component';
import { AuthSigninComponent } from './components/pages/auth/auth-signin/auth-signin.component';
import { AuthSignoutComponent } from './components/pages/auth/auth-signout/auth-signout.component';
import { BaseComponent } from './components/pages/base/base.component';
import { ErrorComponent } from './components/pages/error/error.component';
import { IndexComponent } from './components/pages/index/index.component';
import { NotfoundComponent } from './components/pages/notfound/notfound.component';
import { ScheduleComponent } from './components/pages/schedule/schedule.component';
import { AlertModalComponent } from './components/parts/alert-modal/alert-modal.component';
import { ConfirmModalComponent } from './components/parts/confirm-modal/confirm-modal.component';
import { ContentsComponent } from './components/parts/contents/contents.component';
import { FooterComponent } from './components/parts/footer/footer.component';
import { HeaderMenuComponent } from './components/parts/header-menu/header-menu.component';
import { HeaderComponent } from './components/parts/header/header.component';
import { LoadingComponent } from './components/parts/loading/loading.component';
import { StoreModule } from './store.module';
import { CoreStoreModule } from './store/core/store';

// tslint:disable-next-line:no-stateless-class
@NgModule({
    declarations: [
        AppComponent,
        NotfoundComponent,
        ContentsComponent,
        HeaderComponent,
        HeaderMenuComponent,
        FooterComponent,
        AlertModalComponent,
        LoadingComponent,
        ErrorComponent,
        BaseComponent,
        ConfirmModalComponent,
        IndexComponent,
        ScheduleComponent,
        AdmissionComponent,
        AuthSigninComponent,
        AuthSignoutComponent,
        AuthIndexComponent,
    ],
    entryComponents: [
        AlertModalComponent,
        ConfirmModalComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        StoreModule,
        CoreStoreModule,
        NgbModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
