import { DialogContainer} from 'botbuilder-dialogs';
import TopMenu = require("./TopMenu");

export class Help extends DialogContainer {
    constructor(conversationState) {
        // Dialog ID of 'Help' will start when class is called in the parent
        super('Help');

        //add child dialogs
        this.dialogs.add('TopMenu', new TopMenu.TopMenu(conversationState));

        // Defining the conversation flow using a waterfall model
        this.dialogs.add('Help', [     
            async function (dc, results){
                await dc.context.sendActivity(`You've reached help dialog`);
                
                const state = conversationState.get(dc.context);
                state.activeDialog = 'TopMenu';
                await dc.replace("TopMenu");
            }                 
        ]);
    }
}