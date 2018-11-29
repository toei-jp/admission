import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { Effects } from './effects';
import { reducer } from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature('App', reducer),
        EffectsModule.forFeature([Effects])
    ]
})
export class AppStoreModule { }
