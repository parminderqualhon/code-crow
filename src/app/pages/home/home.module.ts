import { ComponentFactoryResolver, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { HomeRoutingModule } from './home-routing.module'
import { HomeComponent } from './home.component'
import { CarouselComponent } from './carousel/carousel.component'
import { CarouselCardComponent } from './carousel/carousel-card/carousel-card.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ChannelItemComponent } from '../channel-details/channel/channel-item/channel-item.component'
import { SharedModule } from '../../shared/shared.module'
// import { FriendChatComponent } from '../friends/friend-chat/friend-chat.component';
import { MessageComponent } from '../channel-details/chat/message/message.component'
import { InputComponent } from '../channel-details/chat/input/input.component'
import { MatChipsModule } from '@angular/material/chips'
import { MultiSelectDropdownComponent } from '../../controls/multi-select-dropdown/multi-select-dropdown.component'
import { AddChannelComponent } from '../channel-details/channel/add-channel/add-channel.component'
import { FilterOptionsComponent } from '../channel-details/channel/filter-options/filter-options.component'
import { PickerModule } from '@ctrl/ngx-emoji-mart'

@NgModule({
    declarations: [
        HomeComponent,
        CarouselComponent,
        CarouselCardComponent,
        ChannelItemComponent,
        // FriendChatComponent,
        MessageComponent,
        InputComponent,
        MultiSelectDropdownComponent,
        AddChannelComponent,
        FilterOptionsComponent
    ],
    imports: [
        CommonModule,
        HomeRoutingModule,
        FormsModule,
        SharedModule,
        MatChipsModule,
        ReactiveFormsModule,
        PickerModule
    ],
    exports: [
        MessageComponent,
        InputComponent,
        MultiSelectDropdownComponent,
        AddChannelComponent,
        FilterOptionsComponent,
        ChannelItemComponent
    ]
})
export class HomeModule {
    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    getHomeComponent() {
        return HomeComponent
    }
}
