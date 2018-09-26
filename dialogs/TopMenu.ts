import { ComponentDialog, WaterfallDialog } from 'botbuilder-dialogs';
import { MessageFactory, ActionTypes, CardFactory } from 'botbuilder';
import  MenuOptions from './MenuOptions';


export class TopMenu extends ComponentDialog {
    constructor(conversationState) {
        // Dialog ID of 'TopMenu' will start when class is called in the parent
        super('TopMenu');
        // Defining the conversation flow using a waterfall model
        this.addDialog(new WaterfallDialog('TopMenu', [
              async function (dc){
                let helpPrompt = MessageFactory.attachment(
                    CardFactory.heroCard(
                        'Try natural language or click one of the options below',
                        [],
                        [{
                            type: ActionTypes.ImBack,
                            title: MenuOptions.MenuOptionsMap["payments"],
                            value: MenuOptions.MenuOptionsMap["payments"]
                        },
                        {
                            type: ActionTypes.ImBack,
                            title: MenuOptions.MenuOptionsMap["accounts"],
                            value: MenuOptions.MenuOptionsMap["accounts"]
                        },
                        {
                            type: ActionTypes.ImBack,
                            title: MenuOptions.MenuOptionsMap["cards"],
                            value: MenuOptions.MenuOptionsMap["cards"]
                        },
                        {
                            type: ActionTypes.ImBack,
                            title: MenuOptions.MenuOptionsMap["help"],
                            value: MenuOptions.MenuOptionsMap["help"]
                        }
                       ]
                    )
                );
                
                await dc.context.sendActivity(helpPrompt);
                return await dc.endDialog();
            }                 
        ]));
    }
}