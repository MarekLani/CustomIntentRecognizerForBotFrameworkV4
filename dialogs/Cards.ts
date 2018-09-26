import { ComponentDialog, WaterfallDialog} from 'botbuilder-dialogs';
import TopMenu = require("./TopMenu");

export class Cards extends ComponentDialog {
    constructor(conversationState) {
        // Dialog ID of 'Help' will start when class is called in the parent
        super('Cards');

        // Defining the conversation flow using a waterfall model
        this.addDialog(new WaterfallDialog('Cards', [     
            async function (dc){
                await dc.context.sendActivity(`You've reached cards dialog`);              
                return await dc.replaceDialog("TopMenu");
            }                 
        ]));
        
        //add child dialogs
        this.addDialog(new TopMenu.TopMenu(conversationState));

        
    }
}