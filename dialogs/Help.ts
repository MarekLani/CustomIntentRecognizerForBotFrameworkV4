import { ComponentDialog, WaterfallDialog} from 'botbuilder-dialogs';
import TopMenu = require("./TopMenu");

export class Help extends ComponentDialog {
    constructor(conversationState) {
        // Dialog ID of 'Help' will start when class is called in the parent
        super('Help');

        // Defining the conversation flow using a waterfall model
        this.addDialog(new WaterfallDialog('Help', [     
            async function (dc){
                await dc.context.sendActivity(`You've reached help dialog`);                
                return await dc.replaceDialog("TopMenu");
            }                 
        ]));

        //add child dialogs
        this.addDialog(new TopMenu.TopMenu(conversationState));
    }
}